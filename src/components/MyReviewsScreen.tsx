import React from 'react';
import { MessageSquareText, Heart, Pencil, Camera } from 'lucide-react';
import { useLibrary } from '../state/library';
import { useUI } from '../state/ui';
import { shortDate, starText } from '../lib/format';
import { BookCover, EmptyState, OverlayScreen, ScreenHeader } from './ui';

export const MyReviewsScreen: React.FC<{ z: number }> = ({ z }) => {
  const lib = useLibrary();
  const ui = useUI();
  const reviews = [...lib.myReviews].sort((a, b) => (b.readDate || '').localeCompare(a.readDate || ''));

  return (
    <OverlayScreen z={z} label="Your reviews">
      <ScreenHeader title="Your reviews" subtitle={`${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'}`} onBack={ui.close} />
      {reviews.length === 0 ? (
        <EmptyState
          icon={<MessageSquareText className="w-10 h-10" />}
          title="No reviews yet"
          body="When you log a book, add a few words about it. Your reviews collect here."
          action={<button type="button" onClick={() => ui.open({ type: 'log' })} className="px-4 py-2 rounded-lg bg-[#15E558] text-black text-xs font-bold">Log a book</button>}
        />
      ) : (
        <div className="p-4 space-y-3 pb-safe">
          {reviews.map((r) => {
            const book = lib.catalog[r.bookId];
            if (!book) return null;
            return (
              <article key={r.id} className="p-3.5 rounded-xl bg-[#17202b] border border-[#253344] flex gap-3">
                <button type="button" onClick={() => ui.open({ type: 'book', book })} aria-label={book.title} className="w-14 shrink-0 aspect-[2/3] rounded overflow-hidden bg-[#1a2330] self-start">
                  <BookCover book={book} />
                </button>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="text-sm font-bold text-white truncate">{book.title}</h2>
                      <p className="text-[11px] text-[#6c7f96] flex items-center gap-1.5">
                        {r.rating > 0 && <span className="text-[#15E558] font-bold">{starText(r.rating)}</span>}
                        {r.liked && <Heart className="w-3 h-3 fill-[#FF8000] text-[#FF8000]" />}
                        {r.readDate && <span>{shortDate(r.readDate)}</span>}
                      </p>
                    </div>
                    <div className="flex items-center shrink-0">
                      <button type="button" onClick={() => ui.open({ type: 'share', bookId: book.id, review: r })} aria-label="Share to Story" className="p-1.5 rounded-full text-[#f09433] hover:bg-[#222e3d]">
                        <Camera className="w-4 h-4" />
                      </button>
                      {r.logId && (
                        <button type="button" onClick={() => ui.open({ type: 'log', logId: r.logId })} aria-label="Edit review" className="p-1.5 rounded-full text-[#8fa0b5] hover:bg-[#222e3d]">
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  {r.hasSpoilers && <p className="text-[10px] text-[#ffaa44]">Contains spoilers</p>}
                  <p className="text-xs text-[#cbd6e2] leading-relaxed whitespace-pre-line line-clamp-6">{r.content}</p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </OverlayScreen>
  );
};
