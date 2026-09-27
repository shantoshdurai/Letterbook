import React, { useMemo, useState } from 'react';
import { Plus, Bookmark, List as ListIcon, Calendar as CalendarIcon, Heart, ChevronLeft, ChevronRight, MessageSquareText, RefreshCw, Lock, NotebookPen } from 'lucide-react';
import { Book, BookList, ReadingLogEntry } from '../types';
import { useLibrary } from '../state/library';
import { useUI } from '../state/ui';
import { useLongPress } from '../hooks/useLongPress';
import { monthKey, monthLabel, parseISODate, relativeTime, starText, todayISO } from '../lib/format';
import { BookCover, EmptyState, Pill } from './ui';

const DiaryRow: React.FC<{ log: ReadingLogEntry; book: Book }> = ({ log, book }) => {
  const ui = useUI();
  const press = useLongPress({
    onLongPress: () => ui.open({ type: 'quickMenu', bookId: book.id }),
    onClick: () => ui.open({ type: 'log', logId: log.id }),
  });
  const date = parseISODate(log.dateFinished);
  return (
    <div {...press} role="button" tabIndex={0} aria-label={`${book.title}, read ${log.dateFinished}. Tap to edit.`} className="py-2.5 flex items-center gap-3 hover:bg-[#182028] px-1 rounded-lg cursor-pointer select-none">
      <div className="w-9 text-center shrink-0">
        <span className="block font-mono font-bold text-base text-white leading-none">{date.getDate()}</span>
        <span className="block text-[9px] uppercase text-[#6c7f96]">{date.toLocaleDateString(undefined, { weekday: 'short' })}</span>
      </div>
      <span className="w-9 aspect-[2/3] rounded overflow-hidden border border-[#273545] shrink-0 bg-[#1a2330]">
        <BookCover book={book} />
      </span>
      <div className="flex-1 min-w-0">
        <h3 className="text-xs font-bold text-white truncate">
          {book.title} {book.year ? <span className="text-[#6c7f96] font-normal">{book.year}</span> : null}
        </h3>
        <div className="flex items-center gap-1.5 mt-1 text-[#6c7f96]">
          {log.rating > 0 && <span className="text-[11px] text-[#15E558] font-bold">{starText(log.rating)}</span>}
          {log.liked && <Heart className="w-3 h-3 text-[#FF8000] fill-[#FF8000]" />}
          {log.isReRead && <RefreshCw className="w-3 h-3" aria-label="Re-read" />}
          {log.review && <MessageSquareText className="w-3 h-3" aria-label="Reviewed" />}
        </div>
      </div>
    </div>
  );
};

const DiaryCalendar: React.FC<{ logs: { log: ReadingLogEntry; book: Book }[] }> = ({ logs }) => {
  const ui = useUI();
  const months = useMemo(() => Array.from(new Set([monthKey(todayISO()), ...logs.map((l) => monthKey(l.log.dateFinished))])).sort().reverse(), [logs]);
  const [idx, setIdx] = useState(() => {
    const latest = logs[0] ? monthKey(logs[0].log.dateFinished) : monthKey(todayISO());
    return Math.max(0, months.indexOf(latest));
  });
  const key = months[Math.min(idx, months.length - 1)];
  const [y, m] = key.split('-').map(Number);
  const first = new Date(y, m - 1, 1);
  const daysInMonth = new Date(y, m, 0).getDate();
  const offset = (first.getDay() + 6) % 7; // Monday-first grid
  const byDay = new Map<number, { log: ReadingLogEntry; book: Book }[]>();
  logs.filter((l) => monthKey(l.log.dateFinished) === key).forEach((l) => {
    const d = parseISODate(l.log.dateFinished).getDate();
    byDay.set(d, [...(byDay.get(d) || []), l]);
  });
  const count = Array.from(byDay.values()).reduce((n, a) => n + a.length, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => setIdx((i) => Math.min(months.length - 1, i + 1))} disabled={idx >= months.length - 1} aria-label="Previous month" className="p-1.5 rounded-full text-[#8fa0b5] hover:text-white disabled:opacity-30">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="text-sm font-bold text-white">{monthLabel(key)}</p>
          <p className="text-[10px] font-mono text-[#6c7f96]">{count} {count === 1 ? 'book' : 'books'}</p>
        </div>
        <button type="button" onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0} aria-label="Next month" className="p-1.5 rounded-full text-[#8fa0b5] hover:text-white disabled:opacity-30">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono font-bold text-[#6c7f96]">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: offset }, (_, i) => <div key={`pad-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const entries = byDay.get(day);
          if (entries?.length) {
            const { log, book } = entries[0];
            return (
              <button
                key={day}
                type="button"
                onClick={() => ui.open({ type: 'log', logId: log.id })}
                aria-label={`${monthLabel(key)} ${day}: ${entries.map((e) => e.book.title).join(', ')}`}
                className="relative aspect-[2/3] rounded overflow-hidden bg-[#1a2330] border border-[#2d3b4c] hover:border-[#15E558]"
              >
                <BookCover book={book} />
                <span className="absolute top-0.5 left-0.5 px-1 rounded bg-black/80 font-mono text-[9px] font-bold text-white">{day}</span>
                {entries.length > 1 && (
                  <span className="absolute bottom-0.5 right-0.5 px-1 rounded bg-[#15E558] text-black font-mono text-[9px] font-bold">+{entries.length - 1}</span>
                )}
              </button>
            );
          }
          return (
            <div key={day} className="aspect-[2/3] rounded bg-[#161c23] border border-[#202934] p-1">
              <span className="font-mono text-[10px] text-[#455669]">{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ListCard: React.FC<{ list: BookList; onOpen: () => void; liked?: boolean }> = ({ list, onOpen, liked }) => {
  const lib = useLibrary();
  const covers = lib.resolve(list.bookIds.slice(0, 3));
  return (
    <button type="button" onClick={onOpen} className="p-3 rounded-xl bg-[#1a222c] border border-[#273545] hover:border-[#15E558]/70 transition-all text-left flex flex-col">
      <div className="relative h-24 flex items-end justify-center">
        {covers.length ? (
          covers.map((b, i) => (
            <span
              key={b.id}
              className="absolute w-14 aspect-[2/3] rounded overflow-hidden shadow-lg border border-black/50 bg-[#141b24]"
              style={{ transform: `translateX(${(i - (covers.length - 1) / 2) * 34}px) rotate(${(i - (covers.length - 1) / 2) * 7}deg)`, zIndex: i === 1 ? 3 : 2 - i }}
            >
              <BookCover book={b} />
            </span>
          ))
        ) : (
          <span className="w-14 aspect-[2/3] rounded border border-dashed border-[#34465a] flex items-center justify-center text-[#34465a]">
            <ListIcon className="w-5 h-5" />
          </span>
        )}
      </div>
      <h3 className="mt-3 text-xs font-bold text-white line-clamp-2 flex items-start gap-1">
        {list.isPrivate && <Lock className="w-3 h-3 mt-0.5 shrink-0 text-[#6c7f96]" />}
        {list.title}
      </h3>
      <p className="text-[10px] text-[#6c7f96] mt-0.5 font-mono flex items-center gap-1.5">
        {list.bookIds.length} {list.bookIds.length === 1 ? 'book' : 'books'}
        {liked && <Heart className="w-3 h-3 fill-[#FF8000] text-[#FF8000]" />}
      </p>
    </button>
  );
};

export const ListsScreen: React.FC<{ active: boolean; initialTab?: 'lists' | 'diary' | 'discover' }> = ({ active, initialTab = 'lists' }) => {
  const lib = useLibrary();
  const ui = useUI();
  const [tab, setTab] = useState<'lists' | 'diary' | 'discover'>(initialTab);
  const [mode, setMode] = useState<'list' | 'calendar'>('list');

  const watchlist = lib.resolve(lib.watchlistIds);
  const diary = useMemo(
    () =>
      lib.logs
        .map((log) => ({ log, book: lib.catalog[log.bookId] }))
        .filter((x): x is { log: ReadingLogEntry; book: Book } => Boolean(x.book))
        .sort((a, b) => b.log.dateFinished.localeCompare(a.log.dateFinished) || (b.log.createdAt || '').localeCompare(a.log.createdAt || '')),
    [lib.logs, lib.catalog],
  );
  const groups = useMemo(() => {
    const map = new Map<string, typeof diary>();
    diary.forEach((d) => {
      const k = monthKey(d.log.dateFinished);
      map.set(k, [...(map.get(k) || []), d]);
    });
    return Array.from(map.entries());
  }, [diary]);

  const community = lib.allLists.filter((l) => l.creatorId !== lib.profile.id);

  return (
    <div className="min-h-[100dvh] bg-[#14181c] text-white screen-bottom-pad" hidden={!active}>
      <header className="sticky top-0 z-30 bg-[#14181c]/95 backdrop-blur-md pt-safe">
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Lists</h1>
          <button type="button" onClick={() => ui.open({ type: 'createList' })} aria-label="Create a new list" className="p-2 rounded-full text-white hover:bg-[#202934]">
            <Plus className="w-6 h-6" />
          </button>
        </div>
        <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Pill active={tab === 'lists'} onClick={() => setTab('lists')}>Your Lists</Pill>
          <Pill active={tab === 'diary'} onClick={() => setTab('diary')}>Diary</Pill>
          <Pill active={tab === 'discover'} onClick={() => setTab('discover')}>Discover</Pill>
        </div>
      </header>

      {tab === 'lists' && (
        <div className="space-y-6 pt-2 px-4">
          <section className="space-y-2.5" aria-label="Watchlist">
            <button
              type="button"
              onClick={() => ui.open({ type: 'grid', title: 'Your Watchlist', bookIds: lib.watchlistIds, emptyText: 'Tap the bookmark on any book to save it for later.' })}
              className="w-full flex items-center justify-between group"
            >
              <span className="text-sm font-bold text-white group-hover:text-[#15E558] flex items-center gap-1">Your Watchlist <ChevronRight className="w-4 h-4 text-[#6c7f96]" /></span>
              <span className="text-[10px] font-mono text-[#6c7f96] uppercase tracking-wider">{watchlist.length} books</span>
            </button>
            <button
              type="button"
              onClick={() => ui.open({ type: 'grid', title: 'Your Watchlist', bookIds: lib.watchlistIds, emptyText: 'Tap the bookmark on any book to save it for later.' })}
              className="w-full grid grid-cols-4 gap-2 p-2 rounded-xl bg-[#1a222c] border border-[#273545] hover:border-[#40BCF4] transition-all"
            >
              {watchlist.slice(0, 4).map((book) => (
                <span key={book.id} className="relative aspect-[2/3] rounded-md overflow-hidden bg-[#14181c]">
                  <BookCover book={book} />
                </span>
              ))}
              {watchlist.length === 0 && (
                <span className="col-span-4 py-5 text-center text-xs text-[#6c7f96] flex flex-col items-center gap-1.5">
                  <Bookmark className="w-5 h-5" /> Books you want to read will show up here.
                </span>
              )}
            </button>
          </section>

          <section className="space-y-3" aria-label="Your lists">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">Your lists</h2>
              <span className="text-[10px] font-mono text-[#6c7f96] uppercase">{lib.lists.length}</span>
            </div>
            {lib.lists.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#2a3848]">
                <EmptyState
                  icon={<ListIcon className="w-8 h-8" />}
                  title="Make your first list"
                  body="Favourite fantasy, books for the beach, your all-time top 10…"
                  action={
                    <button type="button" onClick={() => ui.open({ type: 'createList' })} className="px-4 py-2 rounded-lg bg-[#15E558] text-black text-xs font-bold">
                      New list
                    </button>
                  }
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {lib.lists.map((list) => (
                  <ListCard key={list.id} list={list} onOpen={() => ui.open({ type: 'list', listId: list.id })} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {tab === 'diary' && (
        <div className="space-y-4 px-4 pt-2">
          <div className="flex items-center justify-between border-b border-[#202934] pb-2">
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Reading diary</h2>
              <span className="text-[10px] text-[#6c7f96] block">{diary.length} {diary.length === 1 ? 'entry' : 'entries'}</span>
            </div>
            <div className="flex items-center gap-1 bg-[#1a222c] p-1 rounded-lg border border-[#273545]" role="radiogroup" aria-label="Diary view">
              <button type="button" role="radio" aria-checked={mode === 'list'} onClick={() => setMode('list')} aria-label="List view" className={`p-1.5 rounded-md ${mode === 'list' ? 'bg-[#2c3f58] text-white' : 'text-[#6c7f96]'}`}>
                <ListIcon className="w-4 h-4" />
              </button>
              <button type="button" role="radio" aria-checked={mode === 'calendar'} onClick={() => setMode('calendar')} aria-label="Calendar view" className={`p-1.5 rounded-md ${mode === 'calendar' ? 'bg-[#2c3f58] text-white' : 'text-[#6c7f96]'}`}>
                <CalendarIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {diary.length === 0 ? (
            <EmptyState
              icon={<NotebookPen className="w-10 h-10" />}
              title="Your diary is empty"
              body="Every book you log shows up here, by the date you finished it."
              action={
                <button type="button" onClick={() => ui.open({ type: 'log' })} className="px-4 py-2 rounded-lg bg-[#15E558] text-black text-xs font-bold">
                  Log a book
                </button>
              }
            />
          ) : mode === 'list' ? (
            <div className="space-y-6">
              {groups.map(([key, entries]) => (
                <section key={key} className="space-y-1" aria-label={monthLabel(key)}>
                  <div className="flex items-center justify-between text-xs text-[#8fa0b5] font-bold border-b border-[#202934] pb-1">
                    <span>{monthLabel(key)}</span>
                    <span className="text-[10px] font-mono text-[#556677]">{entries.length}</span>
                  </div>
                  <div className="divide-y divide-[#1e2632]">
                    {entries.map(({ log, book }) => <DiaryRow key={log.id} log={log} book={book} />)}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <DiaryCalendar logs={diary} />
          )}
        </div>
      )}

      {tab === 'discover' && (
        <div className="space-y-3 pt-2 px-4">
          <h2 className="text-sm font-bold text-white">Popular lists from the community</h2>
          {community.map((list) => {
            const liked = lib.likedListIds.includes(list.id);
            const covers = lib.resolve(list.bookIds.slice(0, 4));
            return (
              <button
                key={list.id}
                type="button"
                onClick={() => ui.open({ type: 'list', listId: list.id })}
                className="w-full p-3 rounded-xl bg-[#1a222c] border border-[#273545] hover:border-[#15E558] transition-colors flex gap-3 items-center text-left"
              >
                <span className="flex -space-x-5 shrink-0">
                  {covers.map((b, i) => (
                    <span key={b.id} className="w-10 aspect-[2/3] rounded overflow-hidden border border-black shadow-md bg-[#141b24]" style={{ zIndex: 10 - i }}>
                      <BookCover book={b} />
                    </span>
                  ))}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-white line-clamp-1 block">{list.title}</span>
                  <span className="text-[11px] text-[#8fa0b5] line-clamp-1 block mt-0.5">by {list.creatorName}</span>
                  <span className="flex items-center gap-2 mt-1 text-[10px] font-mono text-[#6c7f96]">
                    <span>{list.bookIds.length} books</span>
                    <span className={`flex items-center gap-0.5 ${liked ? 'text-[#FF8000]' : ''}`}>
                      <Heart className={`w-3 h-3 ${liked ? 'fill-[#FF8000]' : ''}`} /> {list.likesCount + (liked ? 1 : 0)}
                    </span>
                    <span>{relativeTime(list.updatedAt)}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
