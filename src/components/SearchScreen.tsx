import React, { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X, Loader2, RefreshCw, SearchX } from 'lucide-react';
import { Book } from '../types';
import { useLibrary } from '../state/library';
import { useUI } from '../state/ui';
import { useDebounced } from '../hooks/useBooks';
import { searchBooks, GENRES, peekCachedBooks, bookMatchesGenre } from '../lib/openLibrary';
import { applyFilters, activeFilterCount, DEFAULT_FILTERS, FilterState } from '../lib/filters';
import { seedBooks } from '../data/seed';
import { FilterModal } from './FilterModal';
import { BookPoster, EmptyState, PosterSkeleton, SectionHeader } from './ui';

const GENRE_TINTS = ['#00E054', '#40BCF4', '#FF8000', '#c084fc', '#f472b6', '#facc15'];

export const SearchScreen: React.FC<{ active: boolean }> = ({ active }) => {
  const lib = useLibrary();
  const ui = useUI();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [remote, setRemote] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const debounced = useDebounced(query.trim(), 400);

  useEffect(() => {
    if (debounced.length < 2) {
      setRemote([]);
      setError(null);
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    searchBooks(debounced, { limit: 40, signal: ctrl.signal })
      .then(setRemote)
      .catch((err: Error) => {
        if (err.name !== 'AbortError') setError(navigator.onLine === false ? "You're offline. Showing books already on your device." : 'Search is unavailable right now.');
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, [debounced, attempt]);

  const ctx = useMemo(() => ({ readIds: new Set(lib.readIds), watchlistIds: new Set(lib.watchlistIds) }), [lib.readIds, lib.watchlistIds]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const local = Object.values(lib.catalog).filter(
      (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.genres.some((g) => g.toLowerCase().includes(q)),
    );
    const seen = new Set(local.map((b) => b.id));
    // Prefer the catalog copy (it may carry a custom cover) for remote hits too.
    const merged = [...local, ...remote.filter((b) => !seen.has(b.id)).map((b) => lib.catalog[b.id] || b)];
    return applyFilters(merged, filters, ctx);
  }, [query, remote, lib.catalog, filters, ctx]);

  const recent = lib.resolve(lib.recentBookIds);
  const filterCount = activeFilterCount(filters);

  const openBook = (b: Book) => {
    lib.actions.addRecent(b);
    ui.open({ type: 'book', book: b });
  };
  const longPress = (b: Book) => {
    lib.actions.upsertBooks([b]);
    ui.open({ type: 'quickMenu', bookId: b.id });
  };
  const toggleWatchlist = (b: Book) => {
    const added = lib.actions.toggleWatchlist(b);
    ui.toast(added ? `Added "${b.title}" to your watchlist` : `Removed "${b.title}" from your watchlist`);
  };

  return (
    <div className="min-h-[calc(100dvh-var(--app-top))] bg-[#14181c] text-white screen-bottom-pad" hidden={!active}>
      <header className="sticky-top z-30 bg-[#14181c]/95 backdrop-blur-md border-b border-[#202934] pt-safe">
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Search</h1>
          <button
            type="button"
            onClick={() => setShowFilters(true)}
            aria-label={filterCount ? `Filters, ${filterCount} active` : 'Filters'}
            className="relative p-2 rounded-full text-[#8fa0b5] hover:text-white hover:bg-[#202934]"
          >
            <SlidersHorizontal className="w-5 h-5" />
            {filterCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-[#00E054] text-black text-[9px] font-bold flex items-center justify-center">{filterCount}</span>
            )}
          </button>
        </div>
        <div className="px-4 pt-1 pb-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#748393] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search books, authors, genres…"
              aria-label="Search books"
              enterKeyHint="search"
              className="w-full pl-10 pr-10 py-2.5 rounded-full bg-[#242e3a] border border-[#313e4e] text-sm text-white placeholder-[#748393] focus:outline-none focus:border-[#00E054] [&::-webkit-search-cancel-button]:hidden"
            />
            {loading ? (
              <Loader2 className="w-4 h-4 text-[#8fa0b5] absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin" />
            ) : query ? (
              <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full bg-[#313e4e] text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {query.trim() ? (
        <div className="px-4 py-3 space-y-3">
          <div className="flex items-center justify-between text-xs text-[#8fa0b5]">
            <span aria-live="polite">
              {loading && !results.length ? 'Searching…' : `${results.length} ${results.length === 1 ? 'book' : 'books'}`}
              {filterCount ? ' · filtered' : ''}
            </span>
            {filterCount > 0 && (
              <button type="button" onClick={() => setFilters(DEFAULT_FILTERS)} className="text-[#40BCF4]">Clear filters</button>
            )}
          </div>
          {error && (
            <div className="px-3 py-2 rounded-lg bg-[#1f2630] border border-[#2c3a4a] text-[11px] text-[#9fb0c3] flex items-center justify-between gap-2">
              <span>{error}</span>
              <button type="button" onClick={() => setAttempt((a) => a + 1)} className="text-[#40BCF4] font-semibold flex items-center gap-1 shrink-0">
                <RefreshCw className="w-3 h-3" /> Retry
              </button>
            </div>
          )}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
            {results.map((book) => (
              <BookPoster
                key={book.id}
                book={book}
                showTitle
                onSelect={openBook}
                onLongPress={longPress}
                isWatchlisted={lib.watchlistIds.includes(book.id)}
                onToggleWatchlist={toggleWatchlist}
                isRead={lib.readIds.includes(book.id)}
              />
            ))}
            {loading && !results.length && Array.from({ length: 9 }, (_, i) => <PosterSkeleton key={i} />)}
          </div>
          {!loading && !results.length && debounced === query.trim() && (
            <EmptyState
              icon={<SearchX className="w-10 h-10" />}
              title="No books found"
              body={filterCount ? 'Try removing some filters.' : 'Check the spelling, or search by author instead.'}
            />
          )}
        </div>
      ) : (
        <div className="space-y-6 pt-4">
          {recent.length > 0 && (
            <section className="space-y-2.5" aria-label="Recently viewed">
              <SectionHeader
                title="Recently viewed"
                right={<button type="button" onClick={lib.actions.clearRecent} className="text-[11px] text-[#6c7f96] hover:text-white">Clear</button>}
              />
              <div className="flex gap-2.5 overflow-x-auto px-4 pb-1 no-scrollbar">
                {recent.map((book) => (
                  <BookPoster key={book.id} book={book} className="w-24 shrink-0" onSelect={openBook} onLongPress={longPress} isRead={lib.readIds.includes(book.id)} />
                ))}
              </div>
            </section>
          )}

          <section className="space-y-3 px-4" aria-label="Browse by genre">
            <h2 className="text-sm font-bold text-white">Browse by genre</h2>
            <div className="grid grid-cols-2 gap-3">
              {GENRES.map((genre, i) => {
                const covers = (peekCachedBooks(`genre:${genre.name}:30`) || seedBooks.filter((b) => bookMatchesGenre(b, genre.name))).slice(0, 3);
                const tint = GENRE_TINTS[i % GENRE_TINTS.length];
                return (
                  <button
                    key={genre.name}
                    type="button"
                    onClick={() => ui.open({ type: 'genre', name: genre.name })}
                    className="relative h-28 p-3 rounded-xl bg-[#1a222c] border border-[#273545] hover:border-[#00E054]/70 transition-all overflow-hidden text-left group"
                  >
                    <div className="absolute inset-0 opacity-25" style={{ background: `radial-gradient(circle at 85% 20%, ${tint}, transparent 60%)` }} />
                    <div className="absolute right-2 bottom-2 flex">
                      {covers.map((b, j) => (
                        <img
                          key={b.id}
                          src={b.coverImage}
                          alt=""
                          loading="lazy"
                          className="w-10 aspect-[2/3] object-cover rounded shadow-lg border border-black/40 -ml-4 first:ml-0 group-hover:-translate-y-1 transition-transform"
                          style={{ transform: `rotate(${(j - 1) * 8}deg)`, zIndex: 3 - j }}
                        />
                      ))}
                    </div>
                    <span className="relative text-sm font-bold text-white leading-tight block max-w-[60%]">{genre.name}</span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {showFilters && <FilterModal z={1} filters={filters} onApply={setFilters} onClose={() => setShowFilters(false)} />}
    </div>
  );
};
