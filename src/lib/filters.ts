import { Book } from '../types';
import { bookMatchesGenre } from './openLibrary';

export interface FilterState {
  sortBy: 'relevance' | 'rating' | 'newest' | 'oldest' | 'title';
  genres: string[];
  minRating: number; // community average, 0 = any
  decade: 'all' | '2020s' | '2010s' | '2000s' | '20th' | 'classic';
  status: 'all' | 'read' | 'unread' | 'watchlist';
}

export const DEFAULT_FILTERS: FilterState = {
  sortBy: 'relevance',
  genres: [],
  minRating: 0,
  decade: 'all',
  status: 'all',
};

export const SORT_LABELS: Record<FilterState['sortBy'], string> = {
  relevance: 'Best match',
  rating: 'Highest rated',
  newest: 'Newest first',
  oldest: 'Oldest first',
  title: 'Title A–Z',
};

export const DECADE_LABELS: Record<FilterState['decade'], string> = {
  all: 'Any year',
  '2020s': '2020s',
  '2010s': '2010s',
  '2000s': '2000s',
  '20th': '1900–1999',
  classic: 'Before 1900',
};

export function activeFilterCount(f: FilterState) {
  return (f.sortBy !== 'relevance' ? 1 : 0) + f.genres.length + (f.minRating ? 1 : 0) + (f.decade !== 'all' ? 1 : 0) + (f.status !== 'all' ? 1 : 0);
}

function inDecade(year: number, decade: FilterState['decade']) {
  if (decade === 'all') return true;
  if (!year) return false;
  switch (decade) {
    case '2020s': return year >= 2020;
    case '2010s': return year >= 2010 && year < 2020;
    case '2000s': return year >= 2000 && year < 2010;
    case '20th': return year >= 1900 && year < 2000;
    case 'classic': return year < 1900;
  }
}

export function applyFilters(
  books: Book[],
  f: FilterState,
  ctx: { readIds: Set<string>; watchlistIds: Set<string> },
) {
  const out = books.filter((b) => {
    if (f.genres.length && !f.genres.some((g) => bookMatchesGenre(b, g))) return false;
    if (f.minRating && b.averageRating < f.minRating) return false;
    if (!inDecade(b.year, f.decade)) return false;
    if (f.status === 'read' && !ctx.readIds.has(b.id)) return false;
    if (f.status === 'unread' && ctx.readIds.has(b.id)) return false;
    if (f.status === 'watchlist' && !ctx.watchlistIds.has(b.id)) return false;
    return true;
  });
  switch (f.sortBy) {
    case 'rating': return out.sort((a, b) => b.averageRating - a.averageRating);
    case 'newest': return out.sort((a, b) => b.year - a.year);
    case 'oldest': return out.sort((a, b) => (a.year || 9999) - (b.year || 9999));
    case 'title': return out.sort((a, b) => a.title.localeCompare(b.title));
    default: return out;
  }
}
