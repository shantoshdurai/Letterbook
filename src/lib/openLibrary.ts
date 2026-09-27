// Thin client for the Open Library API (https://openlibrary.org/developers/api).
// It's free, needs no key and serves CORS-enabled covers, which the story card
// renderer relies on. Results are mapped onto the app's Book shape.
import { Book } from '../types';
import { readJSON, writeJSON, storageKey } from './storage';

const API = 'https://openlibrary.org';
const COVERS = 'https://covers.openlibrary.org';
const SEARCH_FIELDS = [
  'key', 'title', 'author_name', 'author_key', 'first_publish_year', 'cover_i', 'isbn',
  'number_of_pages_median', 'ratings_average', 'ratings_count', 'want_to_read_count',
  'already_read_count', 'subject', 'publisher',
].join(',');

export interface Genre {
  name: string;
  query: string; // Open Library search clause
  keywords: string[]; // for matching local/seed book genres and OL subjects
}

export const GENRES: Genre[] = [
  { name: 'Sci-Fi', query: 'subject_key:science_fiction', keywords: ['sci-fi', 'science fiction', 'space opera', 'dystopian', 'cyberpunk'] },
  { name: 'Fantasy', query: 'subject_key:fantasy', keywords: ['fantasy', 'magical realism', 'epic fantasy', 'historical fantasy'] },
  { name: 'Literary Fiction', query: 'subject_key:literary_fiction', keywords: ['literary fiction', 'contemporary', 'literary'] },
  { name: 'Mystery & Thriller', query: 'subject_key:(mystery OR thriller OR suspense)', keywords: ['mystery', 'thriller', 'suspense', 'detective', 'crime'] },
  { name: 'Romance', query: 'subject_key:romance', keywords: ['romance', 'love stories'] },
  { name: 'Dark Academia', query: 'subject_key:dark_academia', keywords: ['dark academia'] },
  { name: 'Historical Fiction', query: 'subject_key:historical_fiction', keywords: ['historical fiction', 'alternate history'] },
  { name: 'Horror', query: 'subject_key:horror', keywords: ['horror', 'ghost stories', 'gothic'] },
  { name: 'Classics', query: 'subject_key:classic_literature', keywords: ['classic', 'classics', 'classic literature'] },
  { name: 'Young Adult', query: 'subject_key:young_adult_fiction', keywords: ['young adult', 'coming of age', 'juvenile fiction'] },
  { name: 'Memoir & Biography', query: 'subject_key:(memoir OR autobiography OR biography)', keywords: ['memoir', 'biography', 'autobiography'] },
  { name: 'History', query: 'subject_key:history', keywords: ['history'] },
  { name: 'Philosophy', query: 'subject_key:philosophy', keywords: ['philosophy', 'philosophical'] },
  { name: 'Humor & Satire', query: 'subject_key:(humor OR satire)', keywords: ['humor', 'humour', 'satire', 'comedy'] },
  { name: 'Poetry', query: 'subject_key:poetry', keywords: ['poetry', 'poems'] },
  { name: 'Self-Help', query: 'subject_key:self-help', keywords: ['self-help', 'personal development', 'habits'] },
];

export function findGenre(name: string) {
  return GENRES.find((g) => g.name.toLowerCase() === name.toLowerCase());
}

export function bookMatchesGenre(book: Book, genreName: string) {
  const genre = findGenre(genreName);
  const needles = genre ? genre.keywords : [genreName.toLowerCase()];
  return book.genres.some((g) => {
    const hay = g.toLowerCase();
    return needles.some((n) => hay.includes(n));
  });
}

export function coverUrl(coverId: number, size: 'S' | 'M' | 'L' = 'L') {
  return `${COVERS}/b/id/${coverId}-${size}.jpg`;
}

export function workIdFromKey(key: string) {
  return key.replace('/works/', '');
}

export function bookIdForWork(key: string) {
  return `ol-${workIdFromKey(key)}`;
}

export function openLibraryUrl(book: Book) {
  if (book.olKey) return `${API}${book.olKey}`;
  return `${API}/search?q=${encodeURIComponent(`${book.title} ${book.author}`)}`;
}

// Turn noisy Open Library subjects into a few readable genre labels.
function genresFromSubjects(subjects: string[] = []): string[] {
  const out: string[] = [];
  for (const g of GENRES) {
    if (subjects.some((s) => g.keywords.some((k) => s.toLowerCase().includes(k)))) out.push(g.name);
    if (out.length >= 4) break;
  }
  if (out.length === 0) {
    const plain = subjects.find((s) => /^[A-Za-z ,&'-]{3,30}$/.test(s) && !/fiction, general|nyt:|accessible|protected/i.test(s));
    if (plain) out.push(plain.replace(/\b\w/g, (c) => c.toUpperCase()));
  }
  return out;
}

function distributionFromCounts(counts?: Record<string, number>): number[] {
  const dist = new Array(10).fill(0);
  if (!counts) return dist;
  for (let s = 1; s <= 5; s++) dist[s * 2 - 1] = counts[String(s)] || 0;
  return dist;
}

interface SearchDoc {
  key: string;
  title: string;
  author_name?: string[];
  author_key?: string[];
  first_publish_year?: number;
  cover_i?: number;
  isbn?: string[];
  number_of_pages_median?: number;
  ratings_average?: number;
  ratings_count?: number;
  want_to_read_count?: number;
  already_read_count?: number;
  subject?: string[];
  publisher?: string[];
}

export function docToBook(doc: SearchDoc): Book | null {
  if (!doc.key || !doc.title || !doc.cover_i) return null;
  const rating = doc.ratings_average ? Math.round(doc.ratings_average * 100) / 100 : 0;
  return {
    id: bookIdForWork(doc.key),
    olKey: doc.key,
    title: doc.title,
    author: doc.author_name?.[0] || 'Unknown author',
    authorKey: doc.author_key?.[0],
    year: doc.first_publish_year || 0,
    coverImage: coverUrl(doc.cover_i, 'L'),
    synopsis: '',
    pageCount: doc.number_of_pages_median || 0,
    genres: genresFromSubjects(doc.subject),
    averageRating: rating,
    ratingsCount: doc.ratings_count || 0,
    reviewsCount: 0,
    readersCount: doc.already_read_count || 0,
    watchlistCount: doc.want_to_read_count || 0,
    likedCount: 0,
    ratingDistribution: new Array(10).fill(0),
    isbn: doc.isbn?.find((i) => i.length === 13) || doc.isbn?.[0],
    publisher: doc.publisher?.[0],
  };
}

// ---------- fetching + caching ----------

const memory = new Map<string, Promise<unknown>>();

async function getJSON<T>(url: string, signal?: AbortSignal, timeoutMs = 15000): Promise<T> {
  const cached = memory.get(url);
  if (cached) return cached as Promise<T>;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  const onAbort = () => ctrl.abort();
  signal?.addEventListener('abort', onAbort);
  const p = fetch(url, { signal: ctrl.signal, headers: { Accept: 'application/json' } })
    .then((res) => {
      if (!res.ok) throw new Error(`Open Library responded ${res.status}`);
      return res.json() as Promise<T>;
    })
    .finally(() => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    });
  memory.set(url, p);
  p.catch(() => memory.delete(url));
  return p;
}

interface CacheEntry<T> {
  at: number;
  data: T;
}

// Book shelves (trending, genres) change slowly: keep them on disk so the home
// screen renders instantly and works offline, refreshing in the background.
async function cachedBooks(cacheId: string, maxAgeMs: number, load: () => Promise<Book[]>): Promise<Book[]> {
  const key = storageKey('cache', cacheId);
  const entry = readJSON<CacheEntry<Book[]> | null>(key, null);
  if (entry && Date.now() - entry.at < maxAgeMs && entry.data.length) return entry.data;
  try {
    const data = await load();
    if (data.length) writeJSON(key, { at: Date.now(), data });
    return data;
  } catch (err) {
    if (entry?.data.length) return entry.data; // stale is better than nothing offline
    throw err;
  }
}

export function peekCachedBooks(cacheId: string): Book[] | null {
  const entry = readJSON<CacheEntry<Book[]> | null>(storageKey('cache', cacheId), null);
  return entry?.data.length ? entry.data : null;
}

function uniqueBooks(books: (Book | null)[]) {
  const seen = new Set<string>();
  const out: Book[] = [];
  for (const b of books) {
    if (b && !seen.has(b.id)) {
      seen.add(b.id);
      out.push(b);
    }
  }
  return out;
}

export async function searchBooks(query: string, opts: { limit?: number; signal?: AbortSignal; sort?: string } = {}) {
  const params = new URLSearchParams({ q: query, limit: String(opts.limit ?? 30), fields: SEARCH_FIELDS });
  if (opts.sort) params.set('sort', opts.sort);
  const data = await getJSON<{ docs: SearchDoc[] }>(`${API}/search.json?${params}`, opts.signal);
  return uniqueBooks(data.docs.map(docToBook));
}

export function fetchGenreBooks(genreName: string, limit = 30) {
  const genre = findGenre(genreName);
  const q = genre ? genre.query : `subject:"${genreName}"`;
  return cachedBooks(`genre:${genreName}:${limit}`, 12 * 3600_000, () => searchBooks(q, { limit, sort: 'readinglog' }));
}

export function fetchTrending(limit = 18) {
  return cachedBooks(`trending:${limit}`, 6 * 3600_000, async () => {
    const data = await getJSON<{ works: SearchDoc[] }>(`${API}/trending/weekly.json?limit=${limit + 10}`);
    return uniqueBooks(data.works.map(docToBook)).slice(0, limit);
  });
}

export function fetchNewReleases(limit = 18) {
  const year = new Date().getFullYear();
  const q = `first_publish_year:[${year - 1} TO ${year}] subject_key:fiction`;
  return cachedBooks(`new:${year}:${limit}`, 12 * 3600_000, () => searchBooks(q, { limit, sort: 'readinglog' }));
}

export function fetchForGenres(genres: string[], limit = 18) {
  const clauses = genres.map((g) => findGenre(g)?.query).filter(Boolean);
  if (!clauses.length) return fetchGenreBooks('Literary Fiction', limit);
  const q = clauses.length === 1 ? clauses[0]! : clauses.map((c) => `(${c})`).join(' OR ');
  return cachedBooks(`foryou:${genres.slice().sort().join('|')}:${limit}`, 12 * 3600_000, () =>
    searchBooks(q, { limit, sort: 'rating' }),
  );
}

export function fetchAuthorBooks(book: Book, limit = 24) {
  const q = book.authorKey ? `author_key:${book.authorKey}` : `author:"${book.author}"`;
  return searchBooks(q, { limit, sort: 'readinglog' });
}

export interface WorkDetails {
  synopsis?: string;
  genres?: string[];
  averageRating?: number;
  ratingsCount?: number;
  ratingDistribution?: number[];
  readersCount?: number;
  watchlistCount?: number;
  quotes?: string[];
}

// Extra detail for the book page. Every part is optional: a failed sub-request
// just leaves the existing values in place.
export async function fetchWorkDetails(olKey: string, signal?: AbortSignal): Promise<WorkDetails> {
  const [work, ratings, shelves] = await Promise.allSettled([
    getJSON<{ description?: string | { value: string }; subjects?: string[]; excerpts?: { excerpt: string }[] }>(`${API}${olKey}.json`, signal),
    getJSON<{ summary?: { average?: number; count?: number }; counts?: Record<string, number> }>(`${API}${olKey}/ratings.json`, signal),
    getJSON<{ counts?: { want_to_read?: number; already_read?: number } }>(`${API}${olKey}/bookshelves.json`, signal),
  ]);
  const out: WorkDetails = {};
  if (work.status === 'fulfilled') {
    const d = work.value.description;
    const text = typeof d === 'string' ? d : d?.value;
    if (text) out.synopsis = cleanDescription(text);
    if (work.value.subjects?.length) out.genres = genresFromSubjects(work.value.subjects);
    const quotes = work.value.excerpts?.map((e) => e.excerpt).filter((e) => e && e.length < 400);
    if (quotes?.length) out.quotes = quotes.slice(0, 3);
  }
  if (ratings.status === 'fulfilled' && ratings.value.summary?.count) {
    out.averageRating = Math.round((ratings.value.summary.average || 0) * 100) / 100;
    out.ratingsCount = ratings.value.summary.count;
    out.ratingDistribution = distributionFromCounts(ratings.value.counts);
  }
  if (shelves.status === 'fulfilled' && shelves.value.counts) {
    out.readersCount = shelves.value.counts.already_read;
    out.watchlistCount = shelves.value.counts.want_to_read;
  }
  return out;
}

function cleanDescription(text: string) {
  return text
    .replace(/\r/g, '')
    .split(/\n-{3,}|\n\*{3,}|\(\[source\]|\[source\]/i)[0] // drop trailing "----------" link blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // markdown links -> text
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Covers from other editions of the same work, for the "Change cover" picker.
export async function fetchEditionCovers(olKey: string, limit = 12): Promise<string[]> {
  const data = await getJSON<{ entries: { covers?: number[] }[] }>(`${API}${olKey}/editions.json?limit=60`);
  const ids = new Set<number>();
  for (const e of data.entries) {
    for (const c of e.covers || []) if (c > 0) ids.add(c);
    if (ids.size >= limit) break;
  }
  return Array.from(ids).map((id) => coverUrl(id, 'L'));
}
