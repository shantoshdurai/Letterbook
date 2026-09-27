import React, { useEffect, useMemo, useState } from 'react';
import { Heart, BookOpen, Tablet, Headphones, AlertTriangle, RefreshCw, Check, X, Search, Loader2, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Book, ReadingFormat, ReadingLogEntry, Review } from '../types';
import { useLibrary } from '../state/library';
import { useUI } from '../state/ui';
import { useDebounced } from '../hooks/useBooks';
import { searchBooks } from '../lib/openLibrary';
import { todayISO, uid } from '../lib/format';
import { RatingStars } from './RatingStars';
import { BookCover, Sheet } from './ui';

interface LogBookModalProps {
  z: number;
  bookId?: string;
  logId?: string;
}

const FORMATS: { id: ReadingFormat; label: string; icon: typeof BookOpen; tint: string }[] = [
  { id: 'physical', label: 'Print', icon: BookOpen, tint: '#00E054' },
  { id: 'ebook', label: 'E-book', icon: Tablet, tint: '#40BCF4' },
  { id: 'audiobook', label: 'Audio', icon: Headphones, tint: '#FF8000' },
];

const BookPicker: React.FC<{ onPick: (b: Book) => void }> = ({ onPick }) => {
  const lib = useLibrary();
  const [q, setQ] = useState('');
  const [remote, setRemote] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const debounced = useDebounced(q.trim(), 400);

  useEffect(() => {
    if (debounced.length < 2) {
      setRemote([]);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    searchBooks(debounced, { limit: 20, signal: ctrl.signal })
      .then(setRemote)
      .catch(() => setRemote([]))
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, [debounced]);

  const suggestions = useMemo(() => {
    const needle = q.trim().toLowerCase();
    // With no query, suggest the watchlist and recently viewed books.
    if (!needle) return lib.resolve(Array.from(new Set([...lib.watchlistIds, ...lib.recentBookIds]))).slice(0, 12);
    const local = Object.values(lib.catalog).filter((b) => b.title.toLowerCase().includes(needle) || b.author.toLowerCase().includes(needle));
    const seen = new Set(local.map((b) => b.id));
    return [...local, ...remote.filter((b) => !seen.has(b.id))];
  }, [q, remote, lib]);

  return (
    <div className="p-5 space-y-3">
      <div className="relative">
        <Search className="w-4 h-4 text-[#6c7f96] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="search"
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Which book did you read?"
          aria-label="Search for a book to log"
          className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#1a2330] border border-[#273648] text-white placeholder-[#6c7f96] text-sm focus:outline-none focus:border-[#00E054]"
        />
        {loading && <Loader2 className="w-4 h-4 text-[#8fa0b5] absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin" />}
      </div>
      {!q && suggestions.length > 0 && <p className="text-[11px] text-[#6c7f96]">From your watchlist and recent books</p>}
      <div className="space-y-1.5 max-h-[55dvh] overflow-y-auto">
        {suggestions.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => onPick(b)}
            className="w-full flex items-center gap-3 p-2 rounded-xl border border-transparent hover:border-[#00E054] hover:bg-[#1f2b3a] text-left transition-all"
          >
            <span className="w-10 aspect-[2/3] rounded overflow-hidden shrink-0 bg-[#1a2330]">
              <BookCover book={b} />
            </span>
            <span className="flex-1 min-w-0">
              <span className="text-sm font-bold text-white truncate block">{b.title}</span>
              <span className="text-xs text-[#8fa0b5] truncate block">{b.author}{b.year ? ` · ${b.year}` : ''}</span>
            </span>
          </button>
        ))}
        {q.trim().length >= 2 && !loading && suggestions.length === 0 && (
          <p className="py-6 text-center text-xs text-[#6c7f96]">No books found for “{q}”.</p>
        )}
        {!q && suggestions.length === 0 && (
          <p className="py-6 text-center text-xs text-[#6c7f96]">Start typing a title or author.</p>
        )}
      </div>
    </div>
  );
};

export const LogBookModal: React.FC<LogBookModalProps> = ({ z, bookId, logId }) => {
  const lib = useLibrary();
  const ui = useUI();
  const existing = logId ? lib.logs.find((l) => l.id === logId) : undefined;
  const [book, setBook] = useState<Book | null>(() => {
    const id = existing?.bookId || bookId;
    return id ? lib.catalog[id] || null : null;
  });
  const priorLogs = book ? lib.logs.filter((l) => l.bookId === book.id && l.id !== logId) : [];

  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [liked, setLiked] = useState(existing?.liked ?? (book ? lib.likedIds.includes(book.id) : false));
  const [format, setFormat] = useState<ReadingFormat>(existing?.format ?? 'physical');
  const [date, setDate] = useState(existing?.dateFinished ?? todayISO());
  const [review, setReview] = useState(existing?.review ?? '');
  const [spoilers, setSpoilers] = useState(Boolean(existing?.hasSpoilers));
  const [reRead, setReRead] = useState(existing?.isReRead ?? priorLogs.length > 0);
  const [tags, setTags] = useState<string[]>(existing?.tags ?? []);
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/^#/, '').replace(/\s+/g, '-');
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!book) return;
    if (date > todayISO()) {
      ui.toast("The finish date can't be in the future", { tone: 'error' });
      return;
    }
    const entry: ReadingLogEntry = {
      id: existing?.id || uid('log'),
      bookId: book.id,
      dateFinished: date,
      rating,
      liked,
      review: review.trim() || undefined,
      hasSpoilers: spoilers,
      isReRead: reRead,
      format,
      tags,
      createdAt: existing?.createdAt,
    };
    lib.actions.saveLog(entry, book);

    if (existing) {
      ui.toast('Diary entry updated');
      ui.close();
      return;
    }

    confetti({ particleCount: 70, spread: 70, origin: { y: 0.7 }, colors: ['#00E054', '#FF8000', '#40BCF4', '#ffffff'], disableForReducedMotion: true });
    if (lib.settings.showStoryAfterLog && (rating > 0 || entry.review)) {
      const storyReview: Review = {
        id: `rev-${entry.id}`,
        logId: entry.id,
        bookId: book.id,
        userId: lib.profile.id,
        userName: lib.profile.name,
        userAvatar: lib.profile.avatar,
        userHandle: lib.profile.handle,
        rating,
        liked,
        content: entry.review || '',
        date: new Date().toISOString(),
        hasSpoilers: spoilers,
        likesCount: 0,
        commentsCount: 0,
      };
      ui.replaceTop({ type: 'share', bookId: book.id, review: storyReview, justLogged: true });
    } else {
      ui.toast(`Logged "${book.title}" to your diary`);
      ui.close();
    }
  };

  const remove = async () => {
    if (!existing || !book) return;
    const ok = await ui.confirm({ title: 'Delete this diary entry?', body: `Your ${book.title} entry${existing.review ? ' and its review' : ''} will be removed.`, confirmLabel: 'Delete', destructive: true });
    if (!ok) return;
    lib.actions.deleteLog(existing.id);
    ui.toast('Diary entry deleted', {
      action: { label: 'Undo', onClick: () => lib.actions.restoreLog(existing) },
    });
    ui.close();
  };

  return (
    <Sheet z={z} onClose={ui.close} label={existing ? 'Edit diary entry' : 'Log a book'}>
      <div className="flex items-center justify-between px-5 pt-2 pb-3 border-b border-[#232f3e]">
        <h2 className="text-sm font-bold text-white">{!book ? 'Log a book' : existing ? 'Edit entry' : 'I read…'}</h2>
        <button type="button" onClick={ui.close} aria-label="Close" className="p-1.5 rounded-full text-[#8fa0b5] hover:text-white hover:bg-[#232f3e]">
          <X className="w-5 h-5" />
        </button>
      </div>

      {!book ? (
        <BookPicker
          onPick={(b) => {
            lib.actions.upsertBooks([b]);
            setBook(b);
            setLiked(lib.likedIds.includes(b.id));
            setReRead(lib.logs.some((l) => l.bookId === b.id));
          }}
        />
      ) : (
        <form onSubmit={save} className="p-5 space-y-5">
          <div className="flex items-center gap-3.5">
            <span className="w-14 aspect-[2/3] rounded-md overflow-hidden shrink-0 border border-[#334459] bg-[#1a2330]">
              <BookCover book={book} />
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-white leading-tight">{book.title}</h3>
              <p className="text-xs text-[#8fa0b5]">{book.author}{book.year ? ` · ${book.year}` : ''}</p>
              {!existing && !bookId && (
                <button type="button" onClick={() => setBook(null)} className="text-[11px] text-[#40BCF4] font-medium mt-1">Change book</button>
              )}
            </div>
          </div>

          <div className="flex items-end justify-between gap-3 p-4 rounded-xl bg-[#18212d] border border-[#233142]">
            <div>
              <span className="text-[11px] font-bold text-[#8fa0b5] uppercase tracking-wider block mb-1.5">Rating</span>
              <RatingStars rating={rating} size="lg" interactive onRatingChange={setRating} showNumber label="Your rating" />
            </div>
            <button
              type="button"
              onClick={() => setLiked(!liked)}
              aria-pressed={liked}
              aria-label={liked ? 'Unlike' : 'Like'}
              className={`p-3 rounded-full transition-all ${liked ? 'bg-[#FF8000]/20 text-[#FF8000] scale-110' : 'bg-[#222e3d] text-[#6c7f96] hover:text-white'}`}
            >
              <Heart className={`w-6 h-6 ${liked ? 'fill-[#FF8000]' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-[11px] font-bold text-[#8fa0b5] uppercase tracking-wider mb-1.5">Finished</span>
              <input
                type="date"
                value={date}
                max={todayISO()}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg bg-[#1a2330] border border-[#273648] text-white text-xs font-mono focus:outline-none focus:border-[#00E054] [color-scheme:dark]"
              />
            </label>
            <div>
              <span className="block text-[11px] font-bold text-[#8fa0b5] uppercase tracking-wider mb-1.5">Format</span>
              <div className="grid grid-cols-3 gap-1" role="radiogroup" aria-label="Format">
                {FORMATS.map(({ id, label, icon: Icon, tint }) => (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={format === id}
                    onClick={() => setFormat(id)}
                    title={label}
                    className={`flex flex-col items-center py-1.5 rounded-lg border text-[10px] font-semibold transition-all ${
                      format === id ? 'text-white' : 'border-[#273648] bg-[#1a2330] text-[#6c7f96]'
                    }`}
                    style={format === id ? { borderColor: tint, background: `${tint}1a` } : undefined}
                  >
                    <Icon className="w-3.5 h-3.5 mb-0.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <label className="block">
            <span className="block text-[11px] font-bold text-[#8fa0b5] uppercase tracking-wider mb-1.5">Review</span>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Add a review… (optional)"
              rows={4}
              maxLength={5000}
              className="w-full px-3.5 py-3 rounded-lg bg-[#1a2330] border border-[#273648] text-white placeholder-[#6c7f96] text-sm focus:outline-none focus:border-[#00E054] resize-y"
            />
          </label>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-[#a5b6c9]">
              <input type="checkbox" checked={spoilers} onChange={(e) => setSpoilers(e.target.checked)} className="accent-[#00E054] w-4 h-4" />
              <AlertTriangle className="w-3.5 h-3.5 text-[#FF8000]" /> Contains spoilers
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-[#a5b6c9]">
              <input type="checkbox" checked={reRead} onChange={(e) => setReRead(e.target.checked)} className="accent-[#00E054] w-4 h-4" />
              <RefreshCw className="w-3.5 h-3.5 text-[#40BCF4]" /> I've read this before
            </label>
          </div>

          <div>
            <span className="block text-[11px] font-bold text-[#8fa0b5] uppercase tracking-wider mb-1.5">Tags</span>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full text-[11px] bg-[#222e3d] text-[#40BCF4] border border-[#2e3f53]">
                    #{t}
                    <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))} aria-label={`Remove tag ${t}`} className="p-0.5 hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. cozy, book-club"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                aria-label="Add a tag"
                className="flex-1 px-3 py-2 rounded-lg bg-[#1a2330] border border-[#273648] text-white text-xs placeholder-[#6c7f96] focus:outline-none focus:border-[#00E054]"
              />
              <button type="button" onClick={addTag} disabled={!tagInput.trim()} className="px-3 py-2 rounded-lg bg-[#243344] text-xs font-semibold text-white disabled:opacity-40">
                Add
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            {existing && (
              <button type="button" onClick={remove} aria-label="Delete entry" className="p-3 rounded-xl border border-[#4a2a2a] text-[#ff7b7b] hover:bg-[#3a1c1c]">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-[#00E054] hover:bg-[#1cf363] text-black text-sm font-bold transition-all shadow-[0_2px_12px_rgba(0,224,84,0.3)] flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              {existing ? 'Save changes' : 'Save to diary'}
            </button>
          </div>
        </form>
      )}
    </Sheet>
  );
};
