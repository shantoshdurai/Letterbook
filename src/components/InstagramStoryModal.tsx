import React, { useEffect, useRef, useState } from 'react';
import { Review } from '../types';
import { X, Download, Copy, Check, Camera, Loader2, Share2, Quote } from 'lucide-react';
import { renderStoryCard, canvasToBlob, storyFileName, StoryTheme } from '../lib/storyCard';
import { downloadBlob, shareFile } from '../lib/share';
import { useLibrary } from '../state/library';
import { useUI } from '../state/ui';

interface InstagramStoryModalProps {
  z: number;
  bookId: string;
  review?: Review | null;
  // Shown right after logging a book, Letterboxd-style
  justLogged?: boolean;
}

const THEMES: { id: StoryTheme; label: string }[] = [
  { id: 'poster', label: 'Poster' },
  { id: 'review', label: 'Review' },
  { id: 'minimal', label: 'Minimal' },
];

export const InstagramStoryModal: React.FC<InstagramStoryModalProps> = ({ z, bookId, review, justLogged }) => {
  const lib = useLibrary();
  const ui = useUI();
  const book = lib.catalog[bookId];
  const profile = lib.profile;
  const onClose = ui.close;
  const onShowToast = (msg: string) => ui.toast(msg);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [storyTheme, setStoryTheme] = useState<StoryTheme>(review?.content && !review.hasSpoilers ? 'review' : 'poster');
  const [includeReviewText, setIncludeReviewText] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!book) return;
    let cancelled = false;
    let url: string | null = null;
    // Fresh canvas per render so a slow, superseded render can't overwrite a newer one.
    const canvas = document.createElement('canvas');
    setIsRendering(true);
    renderStoryCard(canvas, { book, review, profile, theme: storyTheme, includeReviewText })
      .then(() => canvasToBlob(canvas))
      .then((blob) => {
        if (cancelled) return;
        canvasRef.current = canvas;
        url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      })
      .catch(() => {
        if (!cancelled) onShowToast('Could not render story card');
      })
      .finally(() => {
        if (!cancelled) setIsRendering(false);
      });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [book, review, profile, storyTheme, includeReviewText]);

  if (!book) return null;

  const getFile = async () => {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error('No canvas');
    const blob = await canvasToBlob(canvas);
    return new File([blob], storyFileName(book), { type: 'image/png' });
  };

  const downloadFile = (file: File) => downloadBlob(file, file.name);

  // On phones the native share sheet lists Instagram (Stories / Feed / Direct).
  // Browsers without file sharing get the PNG downloaded instead.
  const handleShare = async () => {
    if (isRendering || isSharing) return;
    setIsSharing(true);
    try {
      const file = await getFile();
      const result = await shareFile(file, book.title, `${book.title} by ${book.author} — on Letterbook`);
      if (result === 'unsupported') {
        await downloadFile(file);
        onShowToast('Story saved — add it from your camera roll in Instagram');
      }
    } catch (err) {
      if ((err as DOMException)?.name !== 'AbortError') {
        onShowToast('Sharing failed — try Save instead');
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownload = async () => {
    if (isRendering) return;
    try {
      const result = await downloadFile(await getFile());
      if (result === 'saved') onShowToast('Story image saved (1080 × 1920)');
    } catch {
      onShowToast('Could not save image');
    }
  };

  const handleCopy = async () => {
    if (isRendering) return;
    try {
      const canvas = canvasRef.current;
      if (!canvas || typeof ClipboardItem === 'undefined') throw new Error('unsupported');
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': canvasToBlob(canvas) })]);
      setCopied(true);
      onShowToast('Story image copied to clipboard');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      onShowToast('Copying images is not supported here — use Save');
    }
  };

  const hasReviewText = Boolean(review?.content);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn" style={{ zIndex: 50 + z }} id="instagram-story-modal" role="dialog" aria-modal="true" aria-label="Share to Instagram Story">
      <div className="w-full max-w-sm bg-[#161c22] border border-[#273544] rounded-2xl flex flex-col shadow-2xl overflow-hidden max-h-[94vh]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#232f3e] flex items-center justify-between bg-[#121820]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white">
              <Camera className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-bold text-white tracking-wide">
                {justLogged ? 'Logged! Share it to your Story' : 'Share to Instagram Story'}
              </span>
              {justLogged && (
                <span className="text-[10px] text-[#8fa0b5] truncate max-w-[220px]">{book.title}</span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-full text-[#8fa0b5] hover:text-white hover:bg-[#222e3d]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Theme Picker */}
        <div className="px-4 py-2 bg-[#12171c] border-b border-[#222c38] flex items-center justify-center gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setStoryTheme(t.id)}
              className={`px-3 py-1 rounded-full text-[10px] font-mono transition-all ${
                storyTheme === t.id
                  ? 'bg-[#00E054] text-black font-bold'
                  : 'bg-[#1b232c] text-[#8fa0b5] hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
          {hasReviewText && (
            <button
              type="button"
              onClick={() => setIncludeReviewText((v) => !v)}
              title="Include review text"
              className={`ml-1 p-1.5 rounded-full transition-all ${
                includeReviewText ? 'bg-[#40BCF4]/20 text-[#40BCF4]' : 'bg-[#1b232c] text-[#6c7f96] hover:text-white'
              }`}
            >
              <Quote className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Preview of the exact 1080×1920 image that will be shared */}
        <div className="p-4 flex-1 overflow-y-auto flex items-center justify-center bg-[#0d1014]">
          <div className="relative w-full max-w-[250px] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border border-[#2b3b4f] bg-[#14181c]">
            {previewUrl && (
              <img
                src={previewUrl}
                alt={`Instagram story card for ${book.title}`}
                className={`w-full h-full object-cover transition-opacity duration-200 ${isRendering ? 'opacity-40' : 'opacity-100'}`}
              />
            )}
            {isRendering && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-[#00E054] animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-[#121820] border-t border-[#232f3e] space-y-2">
          <button
            type="button"
            onClick={handleShare}
            disabled={isRendering || isSharing}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            {isSharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
            Share to Instagram
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={isRendering}
              className="flex-1 py-2.5 rounded-xl bg-[#202c3a] hover:bg-[#28384a] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Save
            </button>
            <button
              type="button"
              onClick={handleCopy}
              disabled={isRendering}
              className="flex-1 py-2.5 rounded-xl bg-[#202c3a] hover:bg-[#28384a] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {copied ? <Check className="w-4 h-4 text-[#00E054]" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            {justLogged && (
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2.5 rounded-xl text-[#8fa0b5] hover:text-white text-xs font-semibold transition-colors"
              >
                Not now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
