import { Capacitor } from '@capacitor/core';

// Inside the Android app (Capacitor WebView) there is no Web Share API and blob
// downloads are ignored, so sharing and saving go through native plugins there.
export const isNativeApp = () => Capacitor.isNativePlatform();

type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed';

const isCancel = (err: unknown) =>
  (err as DOMException)?.name === 'AbortError' || /cancel/i.test(String((err as Error)?.message ?? err));

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function shareNativeFile(blob: Blob, filename: string, title: string, text?: string) {
  const [{ Filesystem, Directory }, { Share }] = await Promise.all([import('@capacitor/filesystem'), import('@capacitor/share')]);
  const { uri } = await Filesystem.writeFile({ path: filename, data: await blobToBase64(blob), directory: Directory.Cache });
  await Share.share({ title, text, files: [uri], dialogTitle: title });
}

// Share via the OS share sheet when available, otherwise copy to the clipboard.
export async function shareOrCopy(data: { title: string; text: string; url?: string }): Promise<ShareResult> {
  if (isNativeApp()) {
    try {
      const { Share } = await import('@capacitor/share');
      await Share.share({ title: data.title, text: data.text, url: data.url, dialogTitle: data.title });
      return 'shared';
    } catch (err) {
      if (isCancel(err)) return 'cancelled';
    }
  } else if (navigator.share) {
    try {
      await navigator.share(data);
      return 'shared';
    } catch (err) {
      if (isCancel(err)) return 'cancelled';
    }
  }
  const text = [data.text, data.url].filter(Boolean).join(' ');
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}

// Shares an image (or any file) through the share sheet, where Instagram shows up
// as Stories / Feed / Direct. Returns 'unsupported' when the browser can't share files.
export async function shareFile(file: File, title: string, text?: string): Promise<'shared' | 'cancelled' | 'unsupported'> {
  try {
    if (isNativeApp()) {
      await shareNativeFile(file, file.name, title, text);
      return 'shared';
    }
    const data: ShareData = { files: [file], title, text };
    if (!navigator.canShare?.(data)) return 'unsupported';
    await navigator.share(data);
    return 'shared';
  } catch (err) {
    if (isCancel(err)) return 'cancelled';
    throw err;
  }
}

// Saves a file. In the Android app this opens the share sheet, where "Save to
// device", Files, Drive or Photos are offered; browsers download it directly.
export async function downloadBlob(blob: Blob, filename: string): Promise<'saved' | 'shared' | 'cancelled'> {
  if (isNativeApp()) {
    try {
      await shareNativeFile(blob, filename, filename);
      return 'shared';
    } catch (err) {
      if (isCancel(err)) return 'cancelled';
      throw err;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  return 'saved';
}
