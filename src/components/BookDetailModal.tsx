import React, { useEffect, useMemo, useState } from 'react';
import {
  Eye, Heart, BookMarked, Plus, Share2, ExternalLink, Camera, Quote, AlertCircle, ArrowLeft,
  MoreHorizontal, Pencil, ChevronDown, Loader2,
} from 'lucide-react';
import { Book, Review } from '../types';
import { useLibrary } from '../state/library';
import { useUI } from '../state/ui';
import { fetchWorkDetails, openLibraryUrl } from '../lib/openLibrary';
import { compactNumber, relativeTime, shortDate, starText } from '../lib/format';
import { shareOrCopy } from '../lib/share';
import { RatingStars } from './RatingStars';
import { Avatar, BookCover, OverlayScreen } from './ui';

interface BookDetailProps {
  z: number;
  book: Book;
}

function reviewTime(r: Review) {
  const t = Date.parse(r.date);
  return Number.isNaN(t) ? 0 : t;
}

export const BookDetailModal: React.FC<BookDetailProps> = ({ z, book: initial }) => {
  const lib = useLibrary();
  const ui = useUI();
  const book = lib.catalog[initial.id] || initial;
  const [tab, setTab] = useState<'reviews' | 'quotes' | 'details'>('reviews');
  const [sort, setSort] = useState<'popular' | 'recent'>('popular');
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Enrich with Open Library data (description, genres, community stats).
  useEffect(() => {
    if (!book.olKey) return;
    const ctrl = new AbortController();
    setLoadingDetails(true);
    fetchWorkDetails(book.olKey, ctrl.signal)
      .then((d) => {
        const patch: Partial<Book> = {};
        if (d.synopsis && (!book.synopsis || book.synopsis.length < 40)) patch.synopsis = d.synopsis;
        if (d.genres?.length && !book.genres.length) patch.genres = d.genres;
        if (d.averageRating) patch.averageRating = d.averageRating;
        if (d.ratingsCount) patch.ratingsCount = d.ratingsCount;
        if (d.ratingDistribution) patch.ratingDistribution = d.ratingDistribution;
        if (d.readersCount !== undefined) patch.readersCount = d.readersCount;
        if (d.watchlistCount !== undefined) patch.watchlistCount = d.watchlistCount;
        if (d.quotes?.length && !book.quotes?.length) patch.quotes = d.quotes;
        if (Object.keys(patch).length) lib.actions.upsertBooks([{ ...book, ...patch }]);
      })
      .catch(() => {
        // Offline or Open Library hiccup: the page still works with what we have.
      })
      .finally(() => setLoadingDetails(false));
    return () => ctrl.abort();
    // Only refetch when switching books.
  }, [book.id]);

  const isRead = lib.readIds.includes(book.id);
  const isLiked = lib.likedIds.includes(book.id);
  const isWatchlisted = lib.watchlistIds.includes(book.id);
  const myLogs = lib.logs.filter((l) => l.bookId === book.id).sort((a, b) => b.dateFinished.localeCompare(a.dateFinished));
  const myRating = lib.ratingFor(book.id);
  const latestLog = myLogs[0];
  const storyReview = latestLog
    ? lib.myReviews.find((r) => r.logId === latestLog.id) || syntheticReview(lib, latestLog.rating, latestLog.liked, book.id)
    : null;

  const reviews = useMemo(() => {
    const list = lib.allReviews.filter((r) => r.bookId === book.id);
    return sort === 'popular'
      ? list.sort((a, b) => b.likesCount - a.likesCount || reviewTime(b) - reviewTime(a))
      : list.sort((a, b) => reviewTime(b) - reviewTime(a));
  }, [lib.allReviews, book.id, sort]);

  const dist = book.ratingDistribution || [];
  const maxBar = Math.max(1, ...dist);
  const hasDist = dist.some((n) => n > 0);

  const searchQ = encodeURIComponent(`${book.title} ${book.author}`);
  const links = [
    { label: 'Open Library', hint: 'Borrow or preview', href: openLibraryUrl(book) },
    { label: 'Bookshop.org', hint: 'Buy from indie shops', href: `https://bookshop.org/search?keywords=${searchQ}` },
    { label: 'Libby', hint: 'Borrow from your library', href: `https://libbyapp.com/search/query-${searchQ}/page-1` },
    { label: 'Google Books', hint: 'Previews & editions', href: `https://www.google.com/search?tbm=bks&q=${searchQ}` },
  ];

  const toast = ui.toast;
  const act = {
    read: () => toast(lib.actions.toggleRead(book) ? `Marked "${book.title}" as read` : `Unmarked "${book.title}" as read`),
    like: () => toast(lib.actions.toggleLike(book) ? `Liked "${book.title}"` : `Removed like from "${book.title}"`),
    watch: () => toast(lib.actions.toggleWatchlist(book) ? `Added "${book.title}" to your watchlist` : `Removed "${book.title}" from your watchlist`),
    log: () => ui.open({ type: 'log', bookId: book.id }),
    share: async () => {
      const r = await shareOrCopy({
        title: book.title,
        text: myRating ? `${book.title} by ${book.author} — I rated it ${starText(myRating)} on Letterbook` : `${book.title} by ${book.author}`,
        url: openLibraryUrl(book),
      });
      if (r === 'copied') toast('Link copied to clipboard');
    },
  };

  return (
    <OverlayScreen z={z} label={book.title} className="pb-safe">
      {/* Hero */}
      <div className="relative h-60 w-full overflow-hidden bg-[#18222f]">
        <img
          src={book.backdropImage || book.coverImage}
          crossOrigin="anonymous"
          alt=""
          aria-hidden="true"
          className={`w-full h-full object-cover ${book.backdropImage ? 'opacity-50' : 'opacity-40 blur-2xl scale-125'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#14181c] via-[#14181c]/50 to-transparent" />
        <div className="absolute top-0 inset-x-0 pt-safe">
          <div className="px-3 pt-3 flex items-center justify-between">
            <button type="button" onClick={ui.close} aria-label="Back" className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/10">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => ui.open({ type: 'share', bookId: book.id, review: storyReview })}
                aria-label="Share to Instagram Story"
                className="p-2 rounded-full bg-black/50 backdrop-blur-md text-[#f09433] border border-white/10"
              >
                <Camera className="w-5 h-5" />
              </button>
              <button type="button" onClick={act.share} aria-label="Share book" className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/10">
                <Share2 className="w-5 h-5" />
              </button>
              <button type="button" onClick={() => ui.open({ type: 'quickMenu', bookId: book.id })} aria-label="More actions" className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/10">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative px-5 -mt-32 space-y-6 pb-10">
        {/* Title block */}
        <div className="flex gap-4 items-end">
          <div className="w-28 shrink-0 aspect-[2/3] rounded-lg overflow-hidden border-2 border-[#2b3b4f] bg-[#1a2330] book-shadow-lg">
            <BookCover book={book} eager />
          </div>
          <div className="flex-1 min-w-0 space-y-1 pb-1">
            <h1 className="text-xl font-extrabold text-white tracking-tight leading-tight">{book.title}</h1>
            <p className="text-xs text-[#8fa0b5]">
              {book.year ? <span>{book.year} · </span> : null}
              <button
                type="button"
                onClick={() => ui.open({ type: 'grid', title: book.author, subtitle: 'Books by this author', source: 'author', authorOf: book })}
                className="font-semibold text-[#00E054] hover:underline"
              >
                {book.author}
              </button>
            </p>
            <p className="text-[11px] text-[#6c7f96]">
              {[book.pageCount ? `${book.pageCount} pages` : '', book.audioLength ? `${book.audioLength} audio` : ''].filter(Boolean).join(' · ')}
            </p>
            {book.averageRating > 0 && (
              <div className="flex items-center gap-1.5 pt-1">
                <RatingStars rating={Math.round(book.averageRating * 2) / 2} size="sm" />
                <span className="text-xs font-mono font-bold text-white">{book.averageRating.toFixed(1)}</span>
                {book.ratingsCount > 0 && <span className="text-[10px] text-[#6c7f96]">({compactNumber(book.ratingsCount)})</span>}
              </div>
            )}
          </div>
        </div>

        {book.tagline && <p className="text-sm italic text-[#95a8be] font-serif">“{book.tagline}”</p>}

        {/* Actions */}
        <div className="grid grid-cols-4 gap-2 p-2 rounded-xl bg-[#18222e] border border-[#263445]">
          <button type="button" onClick={act.read} aria-pressed={isRead} className={`flex flex-col items-center py-2.5 rounded-lg transition-all ${isRead ? 'bg-[#00E054]/15 text-[#00E054]' : 'text-[#8fa0b5] hover:bg-[#222f3e]'}`}>
            <Eye className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-semibold">{isRead ? 'Read' : 'Read?'}</span>
          </button>
          <button type="button" onClick={act.like} aria-pressed={isLiked} className={`flex flex-col items-center py-2.5 rounded-lg transition-all ${isLiked ? 'bg-[#FF8000]/15 text-[#FF8000]' : 'text-[#8fa0b5] hover:bg-[#222f3e]'}`}>
            <Heart className={`w-5 h-5 mb-1 ${isLiked ? 'fill-[#FF8000]' : ''}`} />
            <span className="text-[10px] font-semibold">{isLiked ? 'Liked' : 'Like'}</span>
          </button>
          <button type="button" onClick={act.watch} aria-pressed={isWatchlisted} className={`flex flex-col items-center py-2.5 rounded-lg transition-all ${isWatchlisted ? 'bg-[#40BCF4]/15 text-[#40BCF4]' : 'text-[#8fa0b5] hover:bg-[#222f3e]'}`}>
            <BookMarked className={`w-5 h-5 mb-1 ${isWatchlisted ? 'fill-[#40BCF4]/40' : ''}`} />
            <span className="text-[10px] font-semibold">Watchlist</span>
          </button>
          <button type="button" onClick={act.log} className="flex flex-col items-center py-2.5 rounded-lg bg-[#00E054] text-black active:scale-95 transition-transform">
            <Plus className="w-5 h-5 mb-1 stroke-[3]" />
            <span className="text-[10px] font-bold">{myLogs.length ? 'Log again' : 'Log / Rate'}</span>
          </button>
        </div>

        {/* Your activity */}
        {myLogs.length > 0 && (
          <section className="p-3.5 rounded-xl bg-[#161f2b] border border-[#253344] space-y-2.5" aria-label="Your diary entries">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-[#8fa0b5] uppercase tracking-wider">Your diary</h2>
              {myRating > 0 && <span className="text-sm text-[#00E054] font-bold">{starText(myRating)}</span>}
            </div>
            {myLogs.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => ui.open({ type: 'log', logId: l.id })}
                className="w-full flex items-center justify-between gap-2 text-left text-xs py-1.5 border-t border-[#223044] first:border-t-0 first:pt-0"
              >
                <span className="text-[#cbd6e2]">
                  {l.isReRead ? 'Re-read' : 'Read'} {shortDate(l.dateFinished)}
                  {l.review ? <span className="text-[#6c7f96]"> · reviewed</span> : null}
                </span>
                <span className="flex items-center gap-1.5">
                  {l.rating > 0 && <span className="text-[#00E054] font-bold">{starText(l.rating)}</span>}
                  {l.liked && <Heart className="w-3 h-3 fill-[#FF8000] text-[#FF8000]" />}
                  <Pencil className="w-3 h-3 text-[#6c7f96]" />
                </span>
              </button>
            ))}
          </section>
        )}

        {/* Synopsis */}
        {book.synopsis ? (
          <section className="space-y-2">
            <p className={`text-sm leading-relaxed text-[#c3d0df] whitespace-pre-line ${expanded ? '' : 'line-clamp-5'}`}>{book.synopsis}</p>
            {book.synopsis.length > 280 && (
              <button type="button" onClick={() => setExpanded((v) => !v)} className="text-xs text-[#40BCF4] font-semibold flex items-center gap-1">
                {expanded ? 'Show less' : 'Read more'} <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </button>
            )}
          </section>
        ) : loadingDetails ? (
          <div className="flex items-center gap-2 text-xs text-[#6c7f96]"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading description…</div>
        ) : null}

        {book.genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {book.genres.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => ui.open({ type: 'genre', name: g })}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#1c2633] text-[#a9b8c9] border border-[#273648] hover:border-[#00E054] hover:text-white"
              >
                {g}
              </button>
            ))}
          </div>
        )}

        {/* Community numbers */}
        {(book.readersCount > 0 || book.watchlistCount > 0 || book.ratingsCount > 0) && (
          <div className="grid grid-cols-3 py-3 rounded-xl bg-[#151d27] border border-[#222e3e] text-center">
            <div>
              <span className="block text-sm font-mono font-bold text-white">{compactNumber(book.readersCount)}</span>
              <span className="text-[10px] text-[#6c7f96]">have read</span>
            </div>
            <div className="border-x border-[#263546]">
              <span className="block text-sm font-mono font-bold text-white">{compactNumber(book.watchlistCount)}</span>
              <span className="text-[10px] text-[#6c7f96]">want to read</span>
            </div>
            <div>
              <span className="block text-sm font-mono font-bold text-white">{compactNumber(book.ratingsCount)}</span>
              <span className="text-[10px] text-[#6c7f96]">ratings</span>
            </div>
          </div>
        )}

        {hasDist && (
          <section className="space-y-2" aria-label="Ratings distribution">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-[#8fa0b5] uppercase tracking-wider">Ratings</h2>
              <span className="text-xs font-mono text-[#00E054]">{book.averageRating.toFixed(1)} avg</span>
            </div>
            <div className="h-16 flex items-end gap-1" role="img" aria-label={`Rating distribution for ${book.title}`}>
              {dist.map((count, i) => (
                <div key={i} className="flex-1 h-full flex items-end" title={`${(i + 1) / 2}★: ${count}`}>
                  <div className="w-full rounded-t bg-[#2a3c50]" style={{ height: `${Math.max(count ? 6 : 2, (count / maxBar) * 100)}%` }} />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-[#6c7f96]">
              <span className="text-[#00E054]">★</span>
              <span className="text-[#00E054]">★★★★★</span>
            </div>
          </section>
        )}

        {/* Where to read */}
        <section className="space-y-2.5" aria-label="Where to read">
          <h2 className="text-xs font-bold text-[#8fa0b5] uppercase tracking-wider">Where to read</h2>
          <div className="grid grid-cols-2 gap-2">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg bg-[#18222e] border border-[#273648] hover:border-[#40BCF4] transition-colors flex items-center justify-between gap-2"
              >
                <span className="min-w-0">
                  <span className="text-xs font-bold text-white block">{l.label}</span>
                  <span className="text-[10px] text-[#6c7f96] block truncate">{l.hint}</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-[#6c7f96] shrink-0" />
              </a>
            ))}
          </div>
        </section>

        {/* Tabs */}
        <div className="border-b border-[#232f3e] flex items-center gap-5" role="tablist">
          {([['reviews', `Reviews (${reviews.length})`], ['quotes', 'Quotes'], ['details', 'Details']] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`pb-2 text-xs font-bold uppercase tracking-wide relative ${tab === id ? 'text-white' : 'text-[#6c7f96] hover:text-white'}`}
            >
              {label}
              {tab === id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00E054]" />}
            </button>
          ))}
        </div>

        {tab === 'reviews' && (
          <div className="space-y-3">
            {reviews.length > 1 && (
              <div className="flex justify-end gap-1 text-xs">
                {(['popular', 'recent'] as const).map((s) => (
                  <button key={s} type="button" onClick={() => setSort(s)} aria-pressed={sort === s} className={`px-2 py-1 rounded capitalize ${sort === s ? 'bg-[#222e3d] text-[#00E054]' : 'text-[#6c7f96]'}`}>
                    {s}
                  </button>
                ))}
              </div>
            )}
            {reviews.length === 0 ? (
              <div className="p-6 text-center bg-[#18222e] rounded-xl border border-[#232f3e] space-y-3">
                <p className="text-xs text-[#8fa0b5]">No reviews yet. Be the first to review {book.title}.</p>
                <button type="button" onClick={act.log} className="px-4 py-2 rounded-lg bg-[#00E054] text-black text-xs font-bold">Write a review</button>
              </div>
            ) : (
              reviews.map((rev) => {
                const mine = rev.userId === lib.profile.id;
                const hidden = rev.hasSpoilers && lib.settings.spoilerShield && !revealed[rev.id] && !mine;
                return (
                  <article key={rev.id} className="p-4 rounded-xl bg-[#17202b] border border-[#253344] space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar src={rev.userAvatar} name={rev.userName} className="w-8 h-8" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs">
                          <span className="font-bold text-white">{mine ? 'You' : rev.userName}</span>{' '}
                          <span className="text-[#6c7f96]">{rev.userHandle}</span>
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {rev.rating > 0 && <span className="text-[11px] text-[#00E054] font-bold">{starText(rev.rating)}</span>}
                          {rev.liked && <Heart className="w-3 h-3 fill-[#FF8000] text-[#FF8000]" />}
                          <span className="text-[10px] text-[#6c7f96]">{relativeTime(rev.date)}</span>
                        </div>
                      </div>
                      {mine && rev.logId && (
                        <button type="button" onClick={() => ui.open({ type: 'log', logId: rev.logId })} aria-label="Edit your review" className="p-1.5 rounded-full text-[#8fa0b5] hover:text-white hover:bg-[#222e3d]">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    {hidden ? (
                      <button
                        type="button"
                        onClick={() => setRevealed((p) => ({ ...p, [rev.id]: true }))}
                        className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#332211] border border-[#664422] text-[11px] text-[#ffaa44]"
                      >
                        <span className="flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> This review contains spoilers</span>
                        <span className="font-semibold underline">Show</span>
                      </button>
                    ) : (
                      <p className="text-[13px] text-[#cbd6e2] leading-relaxed whitespace-pre-line">{rev.content}</p>
                    )}
                    <div className="flex items-center gap-4 pt-1 text-xs text-[#6c7f96]">
                      {!mine && (
                        <button
                          type="button"
                          onClick={() => lib.actions.toggleReviewLike(rev.id)}
                          aria-pressed={Boolean(rev.isUserLiked)}
                          className={`flex items-center gap-1 transition-colors ${rev.isUserLiked ? 'text-[#FF8000]' : 'hover:text-white'}`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${rev.isUserLiked ? 'fill-[#FF8000]' : ''}`} />
                          <span className="font-mono">{rev.likesCount}</span>
                        </button>
                      )}
                      <button type="button" onClick={() => ui.open({ type: 'share', bookId: book.id, review: rev })} className="flex items-center gap-1 hover:text-white">
                        <Camera className="w-3.5 h-3.5 text-[#f09433]" /> Story
                      </button>
                      {rev.tags && rev.tags.length > 0 && (
                        <span className="ml-auto flex gap-1.5 overflow-hidden">
                          {rev.tags.slice(0, 3).map((t) => <span key={t} className="text-[10px] text-[#40BCF4] truncate">#{t}</span>)}
                        </span>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        )}

        {tab === 'quotes' && (
          <div className="space-y-3">
            {book.quotes?.length ? (
              book.quotes.map((q, idx) => (
                <blockquote key={idx} className="p-4 rounded-xl bg-[#17202b] border border-[#253344] flex items-start gap-3">
                  <Quote className="w-4 h-4 text-[#00E054] shrink-0 mt-0.5" />
                  <p className="text-sm italic font-serif text-[#cbd6e2] leading-relaxed">{q}</p>
                </blockquote>
              ))
            ) : (
              <p className="p-6 text-center text-[#6c7f96] text-xs">No quotes for this book yet.</p>
            )}
          </div>
        )}

        {tab === 'details' && (
          <dl className="p-4 rounded-xl bg-[#17202b] border border-[#253344] text-xs divide-y divide-[#243343]">
            {[
              ['Author', book.author],
              ['First published', book.year ? String(book.year) : '—'],
              ['Pages', book.pageCount ? String(book.pageCount) : '—'],
              ['Publisher', book.publisher || '—'],
              ['ISBN', book.isbn || '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2">
                <dt className="text-[#6c7f96]">{k}</dt>
                <dd className="text-white text-right">{v}</dd>
              </div>
            ))}
            <div className="pt-2">
              <a href={openLibraryUrl(book)} target="_blank" rel="noopener noreferrer" className="text-[#40BCF4] inline-flex items-center gap-1">
                View on Open Library <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </dl>
        )}
      </div>
    </OverlayScreen>
  );
};

// A minimal review object for sharing a rating that has no written review.
function syntheticReview(lib: ReturnType<typeof useLibrary>, rating: number, liked: boolean, bookId: string): Review {
  return {
    id: `rating-${bookId}`,
    bookId,
    userId: lib.profile.id,
    userName: lib.profile.name,
    userAvatar: lib.profile.avatar,
    userHandle: lib.profile.handle,
    rating,
    liked,
    content: '',
    date: new Date().toISOString(),
    hasSpoilers: false,
    likesCount: 0,
    commentsCount: 0,
  };
}
