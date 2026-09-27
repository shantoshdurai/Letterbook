import React, { useRef, useState } from 'react';
import { LogOut, Download, Upload, Trash2, Camera, FileSpreadsheet, Loader2 } from 'lucide-react';
import { CreditsFooter } from './CreditsFooter';
import { useLibrary, LibraryExport } from '../state/library';
import { useUI } from '../state/ui';
import { GENRES } from '../lib/openLibrary';
import { parseGoodreadsCSV } from '../lib/goodreads';
import { downloadBlob } from '../lib/share';
import { normalizeHandle, updateAccountIdentity } from '../lib/auth';
import { todayISO } from '../lib/format';
import { Avatar, OverlayScreen, ScreenHeader, Toggle } from './ui';

interface SettingsProps {
  z: number;
  onSignOut: () => void;
  onDeleteAccount: () => void;
  onIdentityChange: (name: string, handle: string) => void;
}

// Square-crop and shrink an uploaded photo so it fits comfortably in storage.
function resizeAvatar(file: File, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const ctx = c.getContext('2d');
      if (!ctx) return reject(new Error('Canvas unsupported'));
      const s = Math.min(img.naturalWidth, img.naturalHeight);
      ctx.drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('That image could not be read.'));
    };
    img.src = url;
  });
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="space-y-2.5">
    <h2 className="font-mono uppercase font-bold text-[#8fa0b5] text-[11px] tracking-wider">{title}</h2>
    {children}
  </section>
);

const ActionButton: React.FC<{ icon: React.ReactNode; label: string; hint?: string; onClick: () => void; busy?: boolean }> = ({ icon, label, hint, onClick, busy }) => (
  <button type="button" onClick={onClick} disabled={busy} className="w-full p-3 rounded-xl bg-[#1a2330] hover:bg-[#243242] border border-[#283748] text-left flex items-center gap-3 disabled:opacity-60">
    <span className="text-[#8fa0b5]">{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}</span>
    <span className="flex-1">
      <span className="text-xs text-white font-semibold block">{label}</span>
      {hint && <span className="text-[10px] text-[#6c7f96]">{hint}</span>}
    </span>
  </button>
);

export const SettingsModal: React.FC<SettingsProps> = ({ z, onSignOut, onDeleteAccount, onIdentityChange }) => {
  const lib = useLibrary();
  const ui = useUI();
  const { profile, settings, session } = lib;
  const [name, setName] = useState(profile.name);
  const [handle, setHandle] = useState(profile.handle.replace(/^@/, ''));
  const [bio, setBio] = useState(profile.bio);
  const [location, setLocation] = useState(profile.location);
  const [busy, setBusy] = useState<string | null>(null);
  const avatarInput = useRef<HTMLInputElement>(null);
  const backupInput = useRef<HTMLInputElement>(null);
  const goodreadsInput = useRef<HTMLInputElement>(null);

  const dirty = name !== profile.name || `@${handle}` !== profile.handle || bio !== profile.bio || location !== profile.location;

  const saveProfile = (e?: React.FormEvent) => {
    e?.preventDefault();
    const nextHandle = normalizeHandle(handle);
    if (!name.trim()) return ui.toast('Name cannot be empty', { tone: 'error' });
    if (!session.isGuest && (nextHandle !== profile.handle || name.trim() !== profile.name)) {
      const err = updateAccountIdentity(session.userId, name, nextHandle);
      if (err) return ui.toast(err, { tone: 'error' });
      onIdentityChange(name.trim(), nextHandle);
    }
    lib.actions.updateProfile({ name: name.trim(), handle: session.isGuest ? profile.handle : nextHandle, bio: bio.trim(), location: location.trim() });
    setHandle((session.isGuest ? profile.handle : nextHandle).replace(/^@/, ''));
    ui.toast('Profile saved');
  };

  const onAvatar = async (file?: File) => {
    if (!file) return;
    try {
      lib.actions.updateProfile({ avatar: await resizeAvatar(file) });
      ui.toast('Photo updated');
    } catch (err) {
      ui.toast((err as Error).message, { tone: 'error' });
    }
  };

  const exportBackup = async () => {
    const data = lib.actions.exportData();
    try {
      const result = await downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), `letterbook-backup-${todayISO()}.json`);
      if (result !== 'cancelled') ui.toast(`Exported ${data.logs.length} diary entries and ${data.lists.length} lists`);
    } catch {
      ui.toast('Could not export your backup');
    }
  };

  const importBackup = async (file?: File) => {
    if (!file) return;
    try {
      const data = JSON.parse(await file.text()) as LibraryExport;
      const ok = await ui.confirm({
        title: 'Restore this backup?',
        body: `This replaces your current diary, lists and watchlist with the backup from ${data.exportedAt ? new Date(data.exportedAt).toLocaleDateString() : 'this file'}.`,
        confirmLabel: 'Restore',
        destructive: true,
      });
      if (!ok) return;
      lib.actions.importData(data);
      ui.toast('Backup restored');
    } catch (err) {
      ui.toast(err instanceof SyntaxError ? 'That file is not valid JSON.' : (err as Error).message, { tone: 'error' });
    }
  };

  const importGoodreads = async (file?: File) => {
    if (!file) return;
    setBusy('goodreads');
    try {
      const result = parseGoodreadsCSV(await file.text());
      const added = lib.actions.mergeImport(result.books, result.logs, result.toRead);
      ui.toast(`Imported ${added} read ${added === 1 ? 'book' : 'books'} and ${result.toRead.length} to your watchlist`);
    } catch (err) {
      ui.toast((err as Error).message, { tone: 'error' });
    } finally {
      setBusy(null);
    }
  };

  const deleteAccount = async () => {
    const ok = await ui.confirm({
      title: session.isGuest ? 'Erase guest data?' : 'Delete your account?',
      body: 'Your diary, reviews, lists and settings will be permanently deleted from this device. Export a backup first if you want to keep them.',
      confirmLabel: 'Delete everything',
      destructive: true,
    });
    if (ok) onDeleteAccount();
  };

  const inputClass = 'w-full p-2.5 rounded-xl bg-[#1a2330] border border-[#283748] text-white text-sm focus:outline-none focus:border-[#00E054]';

  return (
    <OverlayScreen z={z} label="Settings">
      <ScreenHeader title="Settings" onBack={ui.close} />
      <div className="p-4 space-y-7 pb-safe">
        <Section title="Profile">
          <form onSubmit={saveProfile} className="space-y-3">
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => avatarInput.current?.click()} className="relative shrink-0" aria-label="Change profile photo">
                <Avatar src={profile.avatar} name={profile.name} className="w-16 h-16 text-xl" />
                <span className="absolute -bottom-0.5 -right-0.5 p-1.5 rounded-full bg-[#00E054] text-black border-2 border-[#14181c]"><Camera className="w-3 h-3" /></span>
              </button>
              <div className="text-xs space-y-1">
                <button type="button" onClick={() => avatarInput.current?.click()} className="text-[#40BCF4] font-semibold block">Change photo</button>
                {profile.avatar && (
                  <button type="button" onClick={() => lib.actions.updateProfile({ avatar: '' })} className="text-[#8fa0b5] block">Remove photo</button>
                )}
              </div>
              <input ref={avatarInput} type="file" accept="image/*" className="hidden" onChange={(e) => { onAvatar(e.target.files?.[0]); e.target.value = ''; }} />
            </div>
            <label className="block space-y-1">
              <span className="text-[10px] uppercase font-mono text-[#6c7f96]">Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className={inputClass} />
            </label>
            {!session.isGuest && (
              <label className="block space-y-1">
                <span className="text-[10px] uppercase font-mono text-[#6c7f96]">Username</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6c7f96] text-sm">@</span>
                  <input value={handle} onChange={(e) => setHandle(e.target.value.replace(/^@/, ''))} maxLength={30} autoCapitalize="none" className={`${inputClass} pl-7`} />
                </div>
              </label>
            )}
            <label className="block space-y-1">
              <span className="text-[10px] uppercase font-mono text-[#6c7f96]">Location</span>
              <input value={location} onChange={(e) => setLocation(e.target.value)} maxLength={60} placeholder="City, country" className={inputClass} />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] uppercase font-mono text-[#6c7f96]">Bio</span>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={300} placeholder="What do you love to read?" className={`${inputClass} resize-none`} />
            </label>
            <button type="submit" disabled={!dirty} className="w-full py-2.5 rounded-xl bg-[#00E054] text-black text-xs font-bold disabled:opacity-40">
              Save profile
            </button>
          </form>
        </Section>

        <Section title="Favourite genres">
          <p className="text-[11px] text-[#6c7f96] -mt-1">Used for “Picked for you” on Home.</p>
          <div className="flex flex-wrap gap-1.5">
            {GENRES.map((g) => {
              const on = profile.favoriteGenres.includes(g.name);
              return (
                <button
                  key={g.name}
                  type="button"
                  aria-pressed={on}
                  onClick={() => lib.actions.updateProfile({ favoriteGenres: on ? profile.favoriteGenres.filter((x) => x !== g.name) : [...profile.favoriteGenres, g.name] })}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${on ? 'bg-[#00E054] text-black border-[#00E054] font-bold' : 'bg-[#141b24] text-[#9fb0c3] border-[#2a3848]'}`}
                >
                  {g.name}
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Preferences">
          <div className="space-y-2">
            <Toggle checked={settings.spoilerShield} onChange={(v) => lib.actions.updateSettings({ spoilerShield: v })} label="Spoiler shield" description="Hide reviews marked as containing spoilers until you tap them" />
            <Toggle checked={settings.showStoryAfterLog} onChange={(v) => lib.actions.updateSettings({ showStoryAfterLog: v })} label="Offer Story sharing after logging" description="Show the Instagram Story card when you rate a book" />
          </div>
        </Section>

        <Section title="Your data">
          <div className="space-y-2">
            <ActionButton icon={<Download className="w-4 h-4" />} label="Export backup" hint="Download your diary, lists and settings as a JSON file" onClick={exportBackup} />
            <ActionButton icon={<Upload className="w-4 h-4" />} label="Restore from backup" hint="Load a Letterbook JSON backup" onClick={() => backupInput.current?.click()} />
            <ActionButton icon={<FileSpreadsheet className="w-4 h-4" />} label="Import from Goodreads" hint="Upload the CSV from Goodreads → My Books → Import and export" onClick={() => goodreadsInput.current?.click()} busy={busy === 'goodreads'} />
          </div>
          <input ref={backupInput} type="file" accept="application/json,.json" className="hidden" onChange={(e) => { importBackup(e.target.files?.[0]); e.target.value = ''; }} />
          <input ref={goodreadsInput} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => { importGoodreads(e.target.files?.[0]); e.target.value = ''; }} />
        </Section>

        <Section title="Account">
          <div className="space-y-2">
            <p className="text-[11px] text-[#6c7f96]">
              {session.isGuest
                ? 'You are browsing as a guest. Your data stays on this device.'
                : `Signed in as ${profile.handle}. Your account and data are stored on this device.`}
            </p>
            <button type="button" onClick={onSignOut} className="w-full py-3 rounded-xl bg-[#1a2330] border border-[#283748] text-white text-xs font-semibold flex items-center justify-center gap-2">
              <LogOut className="w-4 h-4" /> {session.isGuest ? 'Leave guest mode' : 'Sign out'}
            </button>
            <button type="button" onClick={deleteAccount} className="w-full py-3 rounded-xl bg-[#e5484d]/10 border border-[#e5484d]/40 text-[#ff7b7b] text-xs font-semibold flex items-center justify-center gap-2">
              <Trash2 className="w-4 h-4" /> {session.isGuest ? 'Erase guest data' : 'Delete account and data'}
            </button>
          </div>
        </Section>

        <CreditsFooter className="!mx-0 pb-4" />
      </div>
    </OverlayScreen>
  );
};
