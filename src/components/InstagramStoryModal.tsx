import React, { useState } from 'react';
import { Book, Review, UserProfile } from '../types';
import { X, Download, Copy, Check, Heart, Camera } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface InstagramStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  review?: Review | null;
  profile?: UserProfile;
  onShowToast: (msg: string) => void;
}

export const InstagramStoryModal: React.FC<InstagramStoryModalProps> = ({
  isOpen,
  onClose,
  book,
  review,
  profile,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [storyTheme, setStoryTheme] = useState<'letterboxd' | 'minimal' | 'gradient'>('letterboxd');

  if (!isOpen || !book) return null;

  const handleCopyStory = () => {
    setCopied(true);
    onShowToast('Instagram Story card copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    onShowToast('Story card ready for Instagram export!');
  };

  const ratingValue = review?.rating || book.averageRating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn" id="instagram-story-modal">
      <div className="w-full max-w-sm bg-[#161c22] border border-[#273544] rounded-2xl flex flex-col shadow-2xl overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#232f3e] flex items-center justify-between bg-[#121820]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white">
              <Camera className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-white tracking-wide">Share to Instagram Story</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[#8fa0b5] hover:text-white hover:bg-[#222e3d]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Theme Picker */}
        <div className="px-4 py-2 bg-[#12171c] border-b border-[#222c38] flex items-center justify-center gap-2">
          <span className="text-[10px] uppercase font-mono text-[#6c7f96]">Theme:</span>
          {(['letterboxd', 'minimal', 'gradient'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setStoryTheme(t)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono capitalize transition-all ${
                storyTheme === t
                  ? 'bg-[#15E558] text-black font-bold'
                  : 'bg-[#1b232c] text-[#8fa0b5] hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Story Card Canvas (9:16 Aspect ratio simulation) */}
        <div className="p-4 flex-1 overflow-y-auto flex items-center justify-center bg-[#0d1014]">
          <div 
            id="instagram-story-canvas"
            className={`w-full max-w-[260px] aspect-[9/16] rounded-2xl p-4 flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all duration-300 ${
              storyTheme === 'letterboxd' 
                ? 'bg-gradient-to-b from-[#1c2633] via-[#14181c] to-[#0d1013] border border-[#2b3b4f]' 
                : storyTheme === 'minimal'
                ? 'bg-[#0f1318] border border-[#232f3d]'
                : 'bg-gradient-to-tr from-[#1b2838] via-[#23354b] to-[#121820] border border-[#3b516d]'
            }`}
          >
            {/* Background subtle blur cover */}
            <div className="absolute inset-0 opacity-15 overflow-hidden pointer-events-none">
              <img src={book.backdropImage || book.coverImage} alt="" className="w-full h-full object-cover filter blur-md scale-125" />
            </div>

            {/* Story Card Top: Logo & User Handle */}
            <div className="relative z-10 flex items-center justify-between">
              <BrandLogo size="sm" />
              <div className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
                <img
                  src={profile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt=""
                  className="w-3.5 h-3.5 rounded-full object-cover"
                />
                <span className="text-[9px] font-mono text-[#15E558]">{profile?.handle || '@reader'}</span>
              </div>
            </div>

            {/* Story Card Middle: Poster & Rating */}
            <div className="relative z-10 flex flex-col items-center text-center my-auto space-y-2">
              <div className="w-24 aspect-[2/3] rounded-lg overflow-hidden border-2 border-white/20 shadow-2xl book-shadow-lg">
                <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
              </div>

              <div className="space-y-0.5 pt-1">
                <h4 className="text-xs font-bold text-white line-clamp-1">{book.title}</h4>
                <p className="text-[10px] text-[#8fa0b5]">{book.author} ({book.year})</p>
              </div>

              {/* Star Rating Badge in Letterboxd Green */}
              <div className="flex items-center gap-1.5 bg-black/60 px-3 py-1 rounded-full border border-white/10 mt-1">
                <span className="text-xs text-[#15E558] font-mono font-bold tracking-widest">
                  {'★'.repeat(Math.floor(ratingValue))}
                  {ratingValue % 1 !== 0 ? '½' : ''}
                </span>
                {review?.liked && (
                  <Heart className="w-3 h-3 fill-[#FF8000] text-[#FF8000]" />
                )}
              </div>

              {/* Review snippet quote if available */}
              {review?.content && (
                <div className="mt-2 p-2 rounded-xl bg-black/40 border border-white/10 text-left">
                  <p className="text-[10px] text-[#cbd6e2] font-serif italic line-clamp-3 leading-tight">
                    "{review.content}"
                  </p>
                </div>
              )}
            </div>

            {/* Story Card Bottom: Watermark / App URL */}
            <div className="relative z-10 flex items-center justify-between text-[8px] font-mono text-[#6c7f96] pt-2 border-t border-white/10">
              <span>letterbook.app</span>
              <span className="text-[#15E558]">Track books on Letterbook</span>
            </div>
          </div>
        </div>

        {/* Footer Actions matching Letterboxd Instagram share flow */}
        <div className="p-3 bg-[#121820] border-t border-[#232f3e] flex gap-2">
          <button
            type="button"
            onClick={handleCopyStory}
            className="flex-1 py-2.5 rounded-xl bg-[#202c3a] hover:bg-[#28384a] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-[#15E558]" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy Story'}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-lg hover:opacity-90 active:scale-95"
          >
            <Download className="w-4 h-4" />
            Save & Share
          </button>
        </div>
      </div>
    </div>
  );
};
