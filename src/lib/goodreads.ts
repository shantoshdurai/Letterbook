// Import a Goodreads library export (My Books → Import/Export → Export Library).
import { Book, ReadingFormat, ReadingLogEntry } from '../types';
import { todayISO, uid } from './format';

// RFC 4180-ish CSV parser: quoted fields, escaped quotes, embedded newlines.
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((f) => f.trim()));
}

const clean = (v = '') => v.replace(/^="?|"$/g, '').trim(); // Goodreads wraps ISBNs as ="0441013597"

function toISODate(v: string): string | null {
  const m = v.trim().match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (!m) return null;
  return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
}

function formatFromBinding(binding: string): ReadingFormat {
  const b = binding.toLowerCase();
  if (/audio|audible|mp3/.test(b)) return 'audiobook';
  if (/kindle|ebook|e-book|nook|digital/.test(b)) return 'ebook';
  return 'physical';
}

function stripHtml(s: string) {
  return s.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

export interface GoodreadsImport {
  books: Book[];
  logs: ReadingLogEntry[];
  toRead: string[];
  skipped: number;
}

export function parseGoodreadsCSV(text: string): GoodreadsImport {
  const rows = parseCSV(text.replace(/^﻿/, ''));
  if (rows.length < 2) throw new Error('That file looks empty.');
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const col = (name: string) => header.indexOf(name);
  const need = ['title', 'author', 'exclusive shelf'];
  if (need.some((n) => col(n) < 0)) throw new Error("This doesn't look like a Goodreads export. Export it from Goodreads → My Books → Import and export.");

  const get = (r: string[], name: string) => (col(name) >= 0 ? r[col(name)] || '' : '');
  const books: Book[] = [];
  const logs: ReadingLogEntry[] = [];
  const toRead: string[] = [];
  let skipped = 0;

  for (const r of rows.slice(1)) {
    const title = get(r, 'title').trim();
    const author = get(r, 'author').trim();
    if (!title) {
      skipped++;
      continue;
    }
    const isbn13 = clean(get(r, 'isbn13'));
    const isbn10 = clean(get(r, 'isbn'));
    const isbn = isbn13 || isbn10;
    const grId = get(r, 'book id').trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const year = parseInt(get(r, 'original publication year') || get(r, 'year published'), 10) || 0;
    const book: Book = {
      id: `gr-${grId}`,
      title: title.replace(/\s*\([^)]*#\d+(\.\d+)?\)\s*$/, ''), // drop "(Series, #1)" suffixes
      author: author || 'Unknown author',
      year,
      coverImage: isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false` : '',
      synopsis: '',
      pageCount: parseInt(get(r, 'number of pages'), 10) || 0,
      genres: [],
      averageRating: parseFloat(get(r, 'average rating')) || 0,
      ratingsCount: 0,
      reviewsCount: 0,
      readersCount: 0,
      watchlistCount: 0,
      likedCount: 0,
      ratingDistribution: new Array(10).fill(0),
      isbn: isbn || undefined,
      publisher: get(r, 'publisher').trim() || undefined,
    };
    books.push(book);

    const shelf = get(r, 'exclusive shelf').trim().toLowerCase();
    if (shelf === 'to-read' || shelf === 'currently-reading') {
      toRead.push(book.id);
      continue;
    }
    if (shelf !== 'read') continue;
    const review = stripHtml(get(r, 'my review'));
    const readCount = parseInt(get(r, 'read count'), 10) || 1;
    logs.push({
      id: uid('log'),
      bookId: book.id,
      dateFinished: toISODate(get(r, 'date read')) || toISODate(get(r, 'date added')) || todayISO(),
      rating: Math.max(0, Math.min(5, parseInt(get(r, 'my rating'), 10) || 0)),
      liked: false,
      review: review || undefined,
      hasSpoilers: /true|yes/i.test(get(r, 'spoiler')),
      isReRead: readCount > 1,
      format: formatFromBinding(get(r, 'binding')),
      tags: get(r, 'bookshelves').split(',').map((t) => t.trim()).filter((t) => t && !['read', 'to-read', 'currently-reading'].includes(t)),
      createdAt: new Date().toISOString(),
    });
  }
  return { books, logs, toRead, skipped };
}
