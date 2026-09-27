import React, { useState } from 'react';
import {
  Bookmark, Plus, List as ListIcon, Edit3, Image as ImageIcon, Share2, Check, Heart, Eye, Camera, Loader2, ChevronLeft,
} from 'lucide-react';
import { useLibrary } from '../state/library';
import { useUI } from '../state/ui';
import { fetchEditionCovers, openLibraryUrl } from '../lib/openLibrary';
import { seedBooks } from '../data/seed';
import { shareOrCopy } from '../lib/share';
import { RatingStars } from './RatingStars';
import { BookCover, Sheet } from './ui';

interface BookQuickMenuProps {
  z: number;
  bookId: string;
}

const Row: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; right?: React.ReactNode }> = ({ icon, label, onClick, right }) => (
  <button type="button" onClick={onClick} className="w-full px-5 py-3.5 flex items-center gap-3.5 text-left text-[#d2deeb] hover:bg-[#202c3a] hover:text-white transition-colors">
    {icon}
    <span className="flex-1 font-medium text-sm">{label}</span>
    {right}
  </button>
);

export const BookQuickMenuModal: React.FC<BookQuickMenuProps> = ({ z, bookId }) => {
  const lib = useLibrary();
  const ui = useUI();
  const book = lib.catalog[bookId];
  const [view, setView] = useState<'main' | 'lists' | 'covers'>('main');
  const [covers, setCovers] = useState<string[] | null>(null);
  const [coversError, setCoversError] = useState(false);

  if (!book) return null;

  const isWatchlisted = lib.watchlistIds.includes(book.id);
  const isLiked = lib.likedIds.includes(book.id);
  const isRead = lib.readIds.includes(book.id);
  const rating = lib.ratingFor(book.id);
  const original = seedBooks.find((b) => b.id === book.id)?.coverImage;

  const openCovers = () => {
    setView('covers');
    if (covers || !book.olKey) return;
    setCoversError(false);
    fetchEditionCovers(book.olKey)
      .then((c) => setCovers(c))
      .catch(() => setCoversError(true));
  };

  const rate = (r: number) => {
    lib.actions.quickRate(book, r);
    ui.toast(r ? `Rated "${book.title}" ${r}★` : `Removed your rating for "${book.title}"`);
  };

  const header = (
    <div className="p-4 flex items-center gap-3.5 border-b border-[#233140]">
      <span className="w-14 aspect-[2/3] rounded-md overflow-hidden shrink-0 border border-[#2b3d52] bg-[#10151c]">
        <BookCover book={book} />
      </span>
      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-bold text-white truncate">{book.title}</h2>
        <p className="text-[11px] text-[#798da3]">{book.author}{book.year ? ` · ${book.year}` : ''}</p>
        <div className="mt-1.5">
          <RatingStars rating={rating} size="lg" interactive onRatingChange={rate} label={`Rate ${book.title}`} />
        </div>
      </div>
    </div>
  );

  return (
    <Sheet z={z} onClose={ui.close} label={`Actions for ${book.title}`}>
      {header}

      {view === 'main' && (
        <>
          <div className="grid grid-cols-3 gap-2 p-3 border-b border-[#233140]">
            <button
              type="button"
              aria-pressed={isRead}
              onClick={() => ui.toast(lib.actions.toggleRead(book) ? 'Marked as read' : 'Unmarked as read')}
              className={`py-2.5 rounded-xl flex flex-col items-center gap-1 text-[11px] font-semibold ${isRead ? 'bg-[#00E054]/15 text-[#00E054]' : 'bg-[#1c2734] text-[#8fa0b5]'}`}
            >
              <Eye className="w-5 h-5" /> {isRead ? 'Read' : 'Read?'}
            </button>
            <button
              type="button"
              aria-pressed={isLiked}
              onClick={() => ui.toast(lib.actions.toggleLike(book) ? 'Liked' : 'Like removed')}
              className={`py-2.5 rounded-xl flex flex-col items-center gap-1 text-[11px] font-semibold ${isLiked ? 'bg-[#FF8000]/15 text-[#FF8000]' : 'bg-[#1c2734] text-[#8fa0b5]'}`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-[#FF8000]' : ''}`} /> Like
            </button>
            <button
              type="button"
              aria-pressed={isWatchlisted}
              onClick={() => ui.toast(lib.actions.toggleWatchlist(book) ? 'Added to watchlist' : 'Removed from watchlist')}
              className={`py-2.5 rounded-xl flex flex-col items-center gap-1 text-[11px] font-semibold ${isWatchlisted ? 'bg-[#40BCF4]/15 text-[#40BCF4]' : 'bg-[#1c2734] text-[#8fa0b5]'}`}
            >
              <Bookmark className={`w-5 h-5 ${isWatchlisted ? 'fill-[#40BCF4]' : ''}`} /> Watchlist
            </button>
          </div>
          <div className="py-1 divide-y divide-[#202c3a]/60">
            <Row icon={<Plus className="w-4 h-4 text-[#00E054]" />} label="Log to diary" onClick={() => ui.replaceTop({ type: 'log', bookId: book.id })} />
            <Row icon={<Edit3 className="w-4 h-4 text-[#FF8000]" />} label="Write a review" onClick={() => ui.replaceTop({ type: 'log', bookId: book.id })} />
            <Row icon={<ListIcon className="w-4 h-4 text-[#40BCF4]" />} label="Add to a list" onClick={() => setView('lists')} right={<span className="text-[#6c7f96]">›</span>} />
            <Row icon={<ImageIcon className="w-4 h-4 text-[#a8b8cc]" />} label="Change cover" onClick={openCovers} right={<span className="text-[#6c7f96]">›</span>} />
            <Row icon={<Camera className="w-4 h-4 text-[#f09433]" />} label="Share to Instagram Story" onClick={() => ui.replaceTop({ type: 'share', bookId: book.id, review: lib.myReviews.find((r) => r.bookId === book.id) || null })} />
            <Row
              icon={<Share2 className="w-4 h-4 text-[#a8b8cc]" />}
              label="Share link"
              onClick={async () => {
                const r = await shareOrCopy({ title: book.title, text: `${book.title} by ${book.author}`, url: openLibraryUrl(book) });
                if (r === 'copied') ui.toast('Link copied to clipboard');
              }}
            />
          </div>
        </>
      )}

      {view === 'lists' && (
        <div className="p-4 space-y-2">
          <button type="button" onClick={() => setView('main')} className="flex items-center gap-1 text-xs text-[#8fa0b5] hover:text-white mb-1">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button
            type="button"
            onClick={() => ui.replaceTop({ type: 'createList', initialBookId: book.id })}
            className="w-full px-3 py-3 rounded-xl border border-dashed border-[#2f4054] text-left text-sm text-[#00E054] font-semibold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New list with this book
          </button>
          {lib.lists.length === 0 && <p className="text-xs text-[#6c7f96] px-1 py-2">You haven't made any lists yet.</p>}
          <div className="max-h-64 overflow-y-auto space-y-1">
            {lib.lists.map((lst) => {
              const inList = lst.bookIds.includes(book.id);
              return (
                <button
                  key={lst.id}
                  type="button"
                  aria-pressed={inList}
                  onClick={() => {
                    const added = lib.actions.toggleBookInList(lst.id, book);
                    ui.toast(added ? `Added to "${lst.title}"` : `Removed from "${lst.title}"`);
                  }}
                  className="w-full px-3 py-3 rounded-xl bg-[#1c2734] hover:bg-[#253446] flex items-center justify-between text-left text-sm text-[#cbd6e2]"
                >
                  <span className="truncate">{lst.title} <span className="text-[11px] text-[#6c7f96]">· {lst.bookIds.length}</span></span>
                  {inList && <Check className="w-4 h-4 text-[#00E054] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {view === 'covers' && (
        <div className="p-4 space-y-3">
          <button type="button" onClick={() => setView('main')} className="flex items-center gap-1 text-xs text-[#8fa0b5] hover:text-white">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <p className="text-xs text-[#8fa0b5]">Pick the edition cover you want to see across Letterbook.</p>
          {!book.olKey ? (
            <p className="text-xs text-[#6c7f96]">No other editions available for this book.</p>
          ) : coversError ? (
            <p className="text-xs text-[#ff9b9b]">Couldn't load editions. Check your connection.</p>
          ) : !covers ? (
            <div className="py-6 flex justify-center"><Loader2 className="w-5 h-5 text-[#8fa0b5] animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-4 gap-2 max-h-72 overflow-y-auto">
              {Array.from(new Set([...(original ? [original] : []), ...covers])).map((url) => {
                const active = url === book.coverImage;
                return (
                  <button
                    key={url}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      lib.actions.setCover(book, url);
                      ui.toast('Cover updated');
                    }}
                    className={`relative aspect-[2/3] rounded-md overflow-hidden border-2 transition-all ${active ? 'border-[#00E054]' : 'border-transparent hover:border-[#40BCF4]'}`}
                  >
                    <img src={url.replace('-L.jpg', '-M.jpg')} crossOrigin="anonymous" alt="" loading="lazy" className="w-full h-full object-cover bg-[#10151c]" />
                    {active && <span className="absolute top-1 right-1 p-0.5 rounded-full bg-[#00E054] text-black"><Check className="w-3 h-3 stroke-[3]" /></span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="p-3 border-t border-[#202d3d]">
        <button type="button" onClick={ui.close} className="w-full py-3 rounded-xl bg-[#1c2734] hover:bg-[#253446] text-sm font-semibold text-[#8fa0b5] hover:text-white">
          Close
        </button>
      </div>
    </Sheet>
  );
};
