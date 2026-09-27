import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Search, X, Loader2, Plus } from 'lucide-react';
import { Book } from '../types';
import { useLibrary } from '../state/library';
import { useUI } from '../state/ui';
import { useDebounced } from '../hooks/useBooks';
import { searchBooks } from '../lib/openLibrary';
import { BookCover, OverlayScreen, ScreenHeader, Toggle } from './ui';

// Create a new list, or edit one of the reader's own lists.
export const ListEditor: React.FC<{ z: number; editListId?: string; initialBookId?: string }> = ({ z, editListId, initialBookId }) => {
  const lib = useLibrary();
  const ui = useUI();
  const editing = editListId ? lib.lists.find((l) => l.id === editListId) : undefined;

  const [title, setTitle] = useState(editing?.title || '');
  const [description, setDescription] = useState(editing?.description || '');
  const [isRanked, setIsRanked] = useState(Boolean(editing?.isRanked));
  const [isPrivate, setIsPrivate] = useState(Boolean(editing?.isPrivate));
  const [bookIds, setBookIds] = useState<string[]>(editing?.bookIds || (initialBookId ? [initialBookId] : []));
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
    searchBooks(debounced, { limit: 15, signal: ctrl.signal })
      .then(setRemote)
      .catch(() => setRemote([]))
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, [debounced]);

  const suggestions = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) {
      // Books the reader has touched are the most likely picks.
      const ids = Array.from(new Set([...lib.logs.map((l) => l.bookId), ...lib.watchlistIds, ...lib.likedIds, ...lib.recentBookIds]));
      return lib.resolve(ids).filter((b) => !bookIds.includes(b.id)).slice(0, 12);
    }
    const local = Object.values(lib.catalog).filter((b) => b.title.toLowerCase().includes(needle) || b.author.toLowerCase().includes(needle));
    const seen = new Set(local.map((b) => b.id));
    return [...local, ...remote.filter((b) => !seen.has(b.id))].filter((b) => !bookIds.includes(b.id));
  }, [q, remote, lib, bookIds]);

  const add = (b: Book) => {
    lib.actions.upsertBooks([b]);
    setBookIds((ids) => [...ids, b.id]);
  };
  const move = (i: number, d: -1 | 1) =>
    setBookIds((ids) => {
      const next = [...ids];
      const j = i + d;
      if (j < 0 || j >= next.length) return ids;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (editing) {
      lib.actions.updateList(editing.id, { title: title.trim(), description: description.trim(), isRanked, isPrivate, bookIds });
      ui.toast('List saved');
      ui.close();
    } else {
      const list = lib.actions.createList({ title, description, isRanked, isPrivate, bookIds });
      ui.toast(`Created "${list.title}"`);
      ui.replaceTop({ type: 'list', listId: list.id });
    }
  };

  const selected = lib.resolve(bookIds);

  return (
    <OverlayScreen z={z} label={editing ? 'Edit list' : 'New list'}>
      <form onSubmit={save}>
        <ScreenHeader
          title={editing ? 'Edit list' : 'New list'}
          onBack={ui.close}
          right={
            <button type="submit" disabled={!title.trim()} className="px-4 py-1.5 rounded-lg bg-[#00E054] text-black text-xs font-bold disabled:opacity-40">
              Save
            </button>
          }
        />
        <div className="p-4 space-y-4 pb-safe">
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8fa0b5]">Name</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Books that made me cry on a train"
              maxLength={120}
              required
              autoFocus={!editing}
              className="mt-1 w-full px-3.5 py-3 rounded-xl bg-[#1a2330] border border-[#273545] text-white text-sm focus:outline-none focus:border-[#00E054]"
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8fa0b5]">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What ties these books together?"
              rows={3}
              maxLength={1000}
              className="mt-1 w-full px-3.5 py-3 rounded-xl bg-[#1a2330] border border-[#273545] text-white text-sm focus:outline-none focus:border-[#00E054] resize-y"
            />
          </label>
          <div className="grid gap-2">
            <Toggle checked={isRanked} onChange={setIsRanked} label="Ranked list" description="Show numbers next to each book" />
            <Toggle checked={isPrivate} onChange={setIsPrivate} label="Private" description="Only visible to you" />
          </div>

          <section className="space-y-2" aria-label="Books in this list">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#8fa0b5]">Books ({selected.length})</h2>
            {selected.length === 0 && <p className="text-xs text-[#6c7f96]">Add books using the search below.</p>}
            <ol className="space-y-1.5">
              {selected.map((b, i) => (
                <li key={b.id} className="flex items-center gap-2.5 p-2 rounded-xl bg-[#18212c] border border-[#243142]">
                  {isRanked && <span className="w-5 text-center font-mono text-xs text-[#00E054] font-bold">{i + 1}</span>}
                  <span className="w-8 aspect-[2/3] rounded overflow-hidden shrink-0 bg-[#10151c]"><BookCover book={b} /></span>
                  <span className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-white truncate block">{b.title}</span>
                    <span className="text-[10px] text-[#8fa0b5] truncate block">{b.author}</span>
                  </span>
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${b.title} up`} className="p-1.5 text-[#8fa0b5] disabled:opacity-25">
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === selected.length - 1} aria-label={`Move ${b.title} down`} className="p-1.5 text-[#8fa0b5] disabled:opacity-25">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => setBookIds((ids) => ids.filter((x) => x !== b.id))} aria-label={`Remove ${b.title}`} className="p-1.5 text-[#ff7b7b]">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ol>
          </section>

          <section className="space-y-2" aria-label="Add books">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#8fa0b5]">Add books</h2>
            <div className="relative">
              <Search className="w-4 h-4 text-[#6c7f96] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by title or author"
                aria-label="Search books to add"
                className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-[#1a2330] border border-[#273545] text-white text-sm focus:outline-none focus:border-[#00E054]"
              />
              {loading && <Loader2 className="w-4 h-4 text-[#8fa0b5] absolute right-3 top-1/2 -translate-y-1/2 animate-spin" />}
            </div>
            <div className="space-y-1">
              {suggestions.map((b) => (
                <button key={b.id} type="button" onClick={() => add(b)} className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#1f2b3a] text-left">
                  <span className="w-8 aspect-[2/3] rounded overflow-hidden shrink-0 bg-[#10151c]"><BookCover book={b} /></span>
                  <span className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-white truncate block">{b.title}</span>
                    <span className="text-[10px] text-[#8fa0b5] truncate block">{b.author}{b.year ? ` · ${b.year}` : ''}</span>
                  </span>
                  <Plus className="w-4 h-4 text-[#00E054]" />
                </button>
              ))}
            </div>
          </section>
        </div>
      </form>
    </OverlayScreen>
  );
};
