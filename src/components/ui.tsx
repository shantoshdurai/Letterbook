import React, { useState } from 'react';
import { ArrowLeft, Bookmark, Heart, Check } from 'lucide-react';
import { Book } from '../types';
import { useLongPress } from '../hooks/useLongPress';
import { initials } from '../lib/format';

// ---------- Book cover with graceful fallback ----------

export const BookCover: React.FC<{
  book: Pick<Book, 'title' | 'author' | 'coverImage'>;
  className?: string;
  eager?: boolean;
}> = ({ book, className = '', eager }) => {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  if (!book.coverImage || failed) {
    return (
      <div className={`w-full h-full flex flex-col justify-between p-2 bg-gradient-to-br from-[#2a3a4d] to-[#141b24] ${className}`}>
        <span className="font-serif text-[11px] leading-tight font-bold text-white line-clamp-4">{book.title}</span>
        <span className="text-[9px] text-[#8fa0b5] truncate">{book.author}</span>
      </div>
    );
  }
  return (
    <img
      src={book.coverImage}
      alt={book.title}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
    />
  );
};

// ---------- Avatar with initials fallback ----------

export const Avatar: React.FC<{ src?: string; name: string; className?: string }> = ({ src, name, className = 'w-8 h-8' }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`${className} rounded-full bg-gradient-to-br from-[#15E558] to-[#40BCF4] text-[#0d1013] font-extrabold flex items-center justify-center shrink-0 select-none`} aria-hidden="true">
        <span className="text-[0.8em] leading-none" style={{ fontSize: 'min(1rem, 40%)' }}>{initials(name)}</span>
      </div>
    );
  }
  return <img src={src} alt="" onError={() => setFailed(true)} className={`${className} rounded-full object-cover shrink-0`} />;
};

// ---------- Poster tile (tap / long-press / watchlist toggle) ----------

export const BookPoster: React.FC<{
  book: Book;
  onSelect: (book: Book) => void;
  onLongPress?: (book: Book) => void;
  isWatchlisted?: boolean;
  onToggleWatchlist?: (book: Book) => void;
  isRead?: boolean;
  isLiked?: boolean;
  rating?: number;
  rank?: number;
  showTitle?: boolean;
  className?: string;
  badge?: React.ReactNode;
}> = ({ book, onSelect, onLongPress, isWatchlisted, onToggleWatchlist, isRead, isLiked, rating, rank, showTitle, className = '', badge }) => {
  const press = useLongPress({
    onLongPress: () => onLongPress?.(book),
    onClick: () => onSelect(book),
  });
  return (
    <div className={`select-none ${className}`}>
      <div
        {...press}
        role="button"
        tabIndex={0}
        aria-label={`${book.title} by ${book.author}`}
        className="group relative aspect-[2/3] rounded-md overflow-hidden bg-[#1a2330] border border-[#253342] hover:border-[#15E558]/80 transition-all cursor-pointer book-shadow active:scale-[0.97]"
      >
        <BookCover book={book} />
        <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-r from-black/50 to-transparent pointer-events-none" />
        {typeof rank === 'number' && (
          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono font-bold text-[#15E558]">#{rank}</div>
        )}
        {badge}
        {onToggleWatchlist && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatchlist(book);
            }}
            onTouchStart={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            aria-label={isWatchlisted ? `Remove ${book.title} from watchlist` : `Add ${book.title} to watchlist`}
            aria-pressed={Boolean(isWatchlisted)}
            className={`absolute top-1 right-1 p-1 rounded-md backdrop-blur-md transition-colors z-10 ${
              isWatchlisted ? 'bg-[#40BCF4] text-black' : 'bg-black/55 text-white hover:text-[#15E558]'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isWatchlisted ? 'fill-black' : ''}`} />
          </button>
        )}
        {(isRead || isLiked) && (
          <div className="absolute bottom-1 right-1 flex gap-0.5 pointer-events-none">
            {isRead && (
              <span className="p-0.5 rounded-full bg-[#15E558] text-black"><Check className="w-2.5 h-2.5 stroke-[3]" /></span>
            )}
            {isLiked && (
              <span className="p-0.5 rounded-full bg-[#FF8000] text-white"><Heart className="w-2.5 h-2.5 fill-white" /></span>
            )}
          </div>
        )}
      </div>
      {(showTitle || rating) ? (
        <div className="mt-1 px-0.5">
          {showTitle && <p className="text-[11px] font-semibold text-white truncate leading-tight">{book.title}</p>}
          {showTitle && <p className="text-[10px] text-[#8fa0b5] truncate">{book.author}</p>}
          {rating ? <p className="text-[10px] text-[#15E558] font-bold leading-tight">{'★'.repeat(Math.floor(rating))}{rating % 1 ? '½' : ''}</p> : null}
        </div>
      ) : null}
    </div>
  );
};

export const PosterSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`aspect-[2/3] rounded-md bg-[#1a2330] border border-[#222e3b] animate-pulse ${className}`} />
);

// ---------- Full-screen overlay & header ----------

export const OverlayScreen: React.FC<{ z: number; children: React.ReactNode; label: string; className?: string }> = ({ z, children, label, className = '' }) => (
  <div
    className={`fixed inset-0 flex justify-center bg-black/60 animate-fadeIn`}
    style={{ zIndex: 50 + z }}
    role="dialog"
    aria-modal="true"
    aria-label={label}
  >
    <div className={`relative w-full max-w-md bg-[#14181c] overflow-y-auto overscroll-contain shadow-2xl sm:border-x sm:border-[#1c2633] animate-slideUp ${className}`}>
      {children}
    </div>
  </div>
);

export const ScreenHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  onBack: () => void;
  right?: React.ReactNode;
}> = ({ title, subtitle, onBack, right }) => (
  <header className="sticky top-0 z-30 bg-[#14181c]/95 backdrop-blur-md border-b border-[#202934] pt-safe">
    <div className="px-2 py-2.5 flex items-center gap-1.5 min-h-[52px]">
      <button type="button" onClick={onBack} aria-label="Back" className="p-2 rounded-full text-[#cbd6e2] hover:text-white hover:bg-[#1f2834]">
        <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
      </button>
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-bold text-white tracking-tight truncate">{title}</h1>
        {subtitle && <p className="text-[10px] font-mono text-[#6c7f96] uppercase tracking-wider truncate">{subtitle}</p>}
      </div>
      {right && <div className="flex items-center gap-1 pr-1">{right}</div>}
    </div>
  </header>
);

// ---------- Bottom sheet ----------

export const Sheet: React.FC<{ z: number; onClose: () => void; label: string; children: React.ReactNode }> = ({ z, onClose, label, children }) => (
  <div
    className="fixed inset-0 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn"
    style={{ zIndex: 50 + z }}
    onClick={onClose}
    role="dialog"
    aria-modal="true"
    aria-label={label}
  >
    <div
      className="w-full max-w-md max-h-[92dvh] overflow-y-auto overscroll-contain bg-[#18212b] border border-[#273646] rounded-t-2xl sm:rounded-2xl shadow-2xl animate-slideUp pb-safe"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-10 h-1 bg-[#37495d] rounded-full mx-auto mt-2.5 mb-1 sm:hidden" />
      {children}
    </div>
  </div>
);

// ---------- Misc ----------

export const EmptyState: React.FC<{ icon?: React.ReactNode; title: string; body?: string; action?: React.ReactNode }> = ({ icon, title, body, action }) => (
  <div className="py-10 px-6 text-center flex flex-col items-center gap-2">
    {icon && <div className="text-[#3d5066] mb-1">{icon}</div>}
    <p className="text-sm font-bold text-white">{title}</p>
    {body && <p className="text-xs text-[#7d8fa3] max-w-[260px] leading-relaxed">{body}</p>}
    {action && <div className="pt-2">{action}</div>}
  </div>
);

export const SectionHeader: React.FC<{ title: string; onMore?: () => void; right?: React.ReactNode }> = ({ title, onMore, right }) => (
  <div className="px-4 flex items-center justify-between">
    {onMore ? (
      <button type="button" onClick={onMore} className="flex items-center gap-1 text-sm font-bold text-white hover:text-[#15E558] transition-colors">
        <span>{title}</span>
        <span className="text-[#6c7f96] text-base leading-none">›</span>
      </button>
    ) : (
      <h2 className="text-sm font-bold text-white">{title}</h2>
    )}
    {right}
  </div>
);

export const Pill: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
      active ? 'bg-[#2c3f58] text-white shadow-sm' : 'bg-[#1b222a] text-[#788a9e] hover:text-white'
    }`}
  >
    {children}
  </button>
);

export const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }> = ({ checked, onChange, label, description }) => (
  <label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#1a2330] border border-[#283748] cursor-pointer">
    <span>
      <span className="text-xs text-white font-semibold block">{label}</span>
      {description && <span className="text-[10px] text-[#6c7f96]">{description}</span>}
    </span>
    <span className="relative inline-flex shrink-0">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="w-9 h-5 rounded-full bg-[#2c3a4b] peer-checked:bg-[#15E558] transition-colors" />
      <span className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
    </span>
  </label>
);
