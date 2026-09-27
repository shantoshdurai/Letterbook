import React, { useMemo, useState } from 'react';
import { SlidersHorizontal, Search, RefreshCw, BookOpen } from 'lucide-react';
import { Book } from '../types';
import { useLibrary } from '../state/library';
import { useUI } from '../state/ui';
import { useAsyncBooks } from '../hooks/useBooks';
import {
  fetchGenreBooks, fetchTrending, fetchNewReleases, fetchForGenres, fetchAuthorBooks, bookMatchesGenre, peekCachedBooks,
} from '../lib/openLibrary';
import { applyFilters, activeFilterCount, DEFAULT_FILTERS, FilterState } from '../lib/filters';
import { FilterModal } from './FilterModal';
import { BookPoster, EmptyState, OverlayScreen, PosterSkeleton, ScreenHeader } from './ui';

interface BookGridScreenProps {
  z: number;
  title: string;
  subtitle?: string;
  bookIds?: string[];
  source?: 'trending' | 'new' | 'foryou' | 'author';
  authorOf?: Book;
  genre?: string;
  emptyText?: string;
}

export const BookGridScreen: React.FC<BookGridScreenProps> = ({ z, title, subtitle, bookIds, source, authorOf, genre, emptyText }) => {
  const lib = useLibrary();
  const ui = useUI();
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [q, setQ] = useState('');

  const favGenres = lib.profile.favoriteGenres.length ? lib.profile.favoriteGenres : ['Literary Fiction', 'Fantasy'];
  const remoteKey = genre ? `genre:${genre}` : source ? `${source}:${authorOf?.id || ''}` : null;
  const remote = useAsyncBooks(
    remoteKey,
    () => {
      if (genre) return fetchGenreBooks(genre, 60);
      switch (source) {
        case 'trending': return fetchTrending(48);
        case 'new': return fetchNewReleases(48);
        case 'foryou': return fetchForGenres(favGenres, 48);
        case 'author': return authorOf ? fetchAuthorBooks(authorOf, 40) : Promise.resolve([]);
        default: return Promise.resolve([]);
      }
    },
    genre ? peekCachedBooks(`genre:${genre}:60`) : null,
  );

  const books = useMemo(() => {
    let list: Book[];
    if (bookIds) list = lib.resolve(bookIds);
    else if (genre) {
      const local = Object.values(lib.catalog).filter((b) => bookMatchesGenre(b, genre));
      const seen = new Set(local.map((b) => b.id));
      list = [...local, ...remote.books.filter((b) => !seen.has(b.id))];
    } else list = remote.books;
    list = list.map((b) => lib.catalog[b.id] || b);
    const needle = q.trim().toLowerCase();
    if (needle) list = list.filter((b) => b.title.toLowerCase().includes(needle) || b.author.toLowerCase().includes(needle));
    return applyFilters(list, filters, { readIds: new Set(lib.readIds), watchlistIds: new Set(lib.watchlistIds) });
  }, [bookIds, genre, remote.books, lib, q, filters]);

  const filterCount = activeFilterCount(filters);
  const loading = remote.loading && books.length === 0;

  return (
    <OverlayScreen z={z} label={title}>
      <ScreenHeader
        title={title}
        subtitle={subtitle || (loading ? 'Loading…' : `${books.length} ${books.length === 1 ? 'book' : 'books'}`)}
        onBack={ui.close}
        right={
          <button
            type="button"
            onClick={() => setShowFilters(true)}
            aria-label={filterCount ? `Filters, ${filterCount} active` : 'Filters'}
            className="relative p-2 rounded-full text-[#8fa0b5] hover:text-white hover:bg-[#1f2834]"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {filterCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[#15E558] text-black text-[8px] font-bold flex items-center justify-center">{filterCount}</span>
            )}
          </button>
        }
      />
      {(bookIds ? bookIds.length > 8 : true) && (
        <div className="px-4 pt-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#6c7f96] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Search in ${title.toLowerCase()}…`}
              aria-label={`Search in ${title}`}
              className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#182028] border border-[#273545] text-xs text-white placeholder-[#6c7f96] focus:outline-none focus:border-[#15E558]"
            />
          </div>
        </div>
      )}
      <div className="p-4 pb-safe">
        {remote.error && !books.length ? (
          <EmptyState
            title="Couldn't load books"
            body={remote.error}
            action={
              <button type="button" onClick={remote.retry} className="px-4 py-2 rounded-lg bg-[#243140] text-xs font-semibold text-white flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" /> Try again
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {books.map((book) => (
              <BookPoster
                key={book.id}
                book={book}
                showTitle
                onSelect={(b) => ui.open({ type: 'book', book: b })}
                onLongPress={(b) => {
                  lib.actions.upsertBooks([b]);
                  ui.open({ type: 'quickMenu', bookId: b.id });
                }}
                isWatchlisted={lib.watchlistIds.includes(book.id)}
                onToggleWatchlist={(b) => {
                  const added = lib.actions.toggleWatchlist(b);
                  ui.toast(added ? `Added "${b.title}" to your watchlist` : `Removed "${b.title}" from your watchlist`);
                }}
                isRead={lib.readIds.includes(book.id)}
                rating={lib.ratingFor(book.id) || undefined}
              />
            ))}
            {loading && Array.from({ length: 12 }, (_, i) => <PosterSkeleton key={i} />)}
          </div>
        )}
        {!loading && !remote.error && books.length === 0 && (
          <EmptyState
            icon={<BookOpen className="w-10 h-10" />}
            title={q || filterCount ? 'Nothing matches' : 'Nothing here yet'}
            body={q || filterCount ? 'Try a different search or clear your filters.' : emptyText}
          />
        )}
      </div>
      {showFilters && <FilterModal z={z + 1} filters={filters} onApply={setFilters} onClose={() => setShowFilters(false)} />}
    </OverlayScreen>
  );
};
