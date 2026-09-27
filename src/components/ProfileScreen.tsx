import React, { useMemo, useState } from 'react';
import { Settings, MapPin, Target, Plus, ChevronRight, BookOpen, Heart, MessageSquareText, Bookmark, NotebookPen, List as ListIcon, Pencil, Check, X, Camera } from 'lucide-react';
import { Book } from '../types';
import { useLibrary } from '../state/library';
import { useUI } from '../state/ui';
import { BookCover, Avatar, Sheet } from './ui';

const FavoritesPicker: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const lib = useLibrary();
  const ui = useUI();
  const [picked, setPicked] = useState<string[]>(lib.profile.favoriteBookIds);
  const candidates = lib.resolve(Array.from(new Set([...lib.profile.favoriteBookIds, ...lib.logs.map((l) => l.bookId), ...lib.likedIds, ...lib.readIds])));

  return (
    <Sheet z={1} onClose={onClose} label="Choose favourite books">
      <div className="px-5 pt-2 pb-3 border-b border-[#233140] flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white">Favourite books</h2>
          <p className="text-[11px] text-[#6c7f96]">Pick up to 4 · {picked.length}/4</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded-full text-[#8fa0b5]"><X className="w-5 h-5" /></button>
      </div>
      <div className="p-4">
        {candidates.length === 0 ? (
          <p className="py-8 text-center text-xs text-[#6c7f96]">Log or like some books first, then pick your favourites here.</p>
        ) : (
          <div className="grid grid-cols-4 gap-2 max-h-[55dvh] overflow-y-auto">
            {candidates.map((b) => {
              const idx = picked.indexOf(b.id);
              const on = idx >= 0;
              return (
                <button
                  key={b.id}
                  type="button"
                  aria-pressed={on}
                  aria-label={b.title}
                  onClick={() => {
                    if (on) setPicked(picked.filter((x) => x !== b.id));
                    else if (picked.length < 4) setPicked([...picked, b.id]);
                    else ui.toast('You can pick up to 4 favourites', { tone: 'error' });
                  }}
                  className={`relative aspect-[2/3] rounded-md overflow-hidden border-2 transition-all ${on ? 'border-[#15E558]' : 'border-transparent opacity-80'}`}
                >
                  <BookCover book={b} />
                  {on && <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#15E558] text-black text-[10px] font-bold flex items-center justify-center">{idx + 1}</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={() => {
            lib.actions.updateProfile({ favoriteBookIds: picked });
            ui.toast('Favourites updated');
            onClose();
          }}
          className="w-full py-3 rounded-xl bg-[#15E558] text-black text-sm font-bold"
        >
          Save favourites
        </button>
      </div>
    </Sheet>
  );
};

export const ProfileScreen: React.FC<{ active: boolean; onOpenDiary: () => void; onOpenLists: () => void }> = ({ active, onOpenDiary, onOpenLists }) => {
  const lib = useLibrary();
  const ui = useUI();
  const { profile } = lib;
  const [pickingFavs, setPickingFavs] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(profile.readingGoal.target));

  const favorites = profile.favoriteBookIds.map((id) => lib.catalog[id]).filter((b): b is Book => Boolean(b));
  const target = profile.readingGoal.target;
  const pct = target ? Math.min(100, Math.round((lib.thisYearCount / target) * 100)) : 0;
  const readIds = Array.from(new Set([...lib.logs.map((l) => l.bookId), ...lib.readIds]));
  const recent = [...lib.logs].sort((a, b) => b.dateFinished.localeCompare(a.dateFinished)).slice(0, 4);

  const ratingBars = useMemo(() => {
    const bars = new Array(10).fill(0);
    lib.logs.forEach((l) => {
      if (l.rating > 0) bars[Math.round(l.rating * 2) - 1] += 1;
    });
    return bars;
  }, [lib.logs]);
  const maxBar = Math.max(1, ...ratingBars);
  const rated = ratingBars.reduce((a, b) => a + b, 0);

  const saveGoal = () => {
    const n = Math.max(1, Math.min(1000, parseInt(goalInput, 10) || target));
    lib.actions.updateProfile({ readingGoal: { year: new Date().getFullYear(), target: n } });
    setEditingGoal(false);
    ui.toast(`Goal set to ${n} books this year`);
  };

  const Row: React.FC<{ icon: React.ReactNode; label: string; count: number; onClick: () => void }> = ({ icon, label, count, onClick }) => (
    <button type="button" onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#182028] text-left">
      {icon}
      <span className="flex-1 text-sm text-white">{label}</span>
      <span className="text-xs font-mono text-[#6c7f96]">{count}</span>
      <ChevronRight className="w-4 h-4 text-[#455669]" />
    </button>
  );

  return (
    <div className="min-h-[100dvh] bg-[#14181c] text-white screen-bottom-pad" hidden={!active}>
      <header className="sticky top-0 z-30 bg-[#14181c]/95 backdrop-blur-md border-b border-[#202934] pt-safe">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-base font-bold tracking-tight">{profile.handle}</h1>
          <button type="button" onClick={() => ui.open({ type: 'settings' })} aria-label="Settings" className="p-2 rounded-full text-[#8fa0b5] hover:text-white hover:bg-[#202934]">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="px-4 py-5 space-y-6">
        <div className="flex items-start gap-4">
          <button type="button" onClick={() => ui.open({ type: 'settings' })} aria-label="Edit profile" className="relative shrink-0 rounded-full border-2 border-[#15E558] p-0.5">
            <Avatar src={profile.avatar} name={profile.name} className="w-18 h-18 text-2xl" />
            {!profile.avatar && (
              <span className="absolute -bottom-0.5 -right-0.5 p-1 rounded-full bg-[#243140] border border-[#14181c] text-white"><Camera className="w-3 h-3" /></span>
            )}
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-extrabold tracking-tight leading-tight">{profile.name}</h2>
            <p className="flex items-center gap-2 text-[11px] text-[#6c7f96] mt-0.5 flex-wrap">
              {profile.location && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {profile.location}</span>}
              <span>Joined {profile.joinedYear}</span>
              {lib.session.isGuest && <span className="px-1.5 rounded bg-[#2a2415] text-[#f2c66d]">Guest</span>}
            </p>
            {profile.bio ? (
              <p className="text-xs text-[#a0b0c0] mt-2 leading-relaxed">{profile.bio}</p>
            ) : (
              <button type="button" onClick={() => ui.open({ type: 'settings' })} className="text-xs text-[#40BCF4] mt-2">Add a bio</button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 py-3 border-y border-[#202934] text-center">
          {[
            { n: readIds.length, label: 'Books', onClick: () => ui.open({ type: 'grid', title: 'Books you have read', bookIds: readIds, emptyText: 'Books you mark as read or log will appear here.' }) },
            { n: lib.thisYearCount, label: 'This year', onClick: onOpenDiary },
            { n: lib.lists.length, label: 'Lists', onClick: onOpenLists },
            { n: lib.myReviews.length, label: 'Reviews', onClick: () => ui.open({ type: 'reviews' }) },
          ].map((s) => (
            <button key={s.label} type="button" onClick={s.onClick} className="space-y-0.5">
              <span className="block text-base font-bold font-mono text-white">{s.n}</span>
              <span className="block text-[10px] text-[#748393] uppercase font-medium">{s.label}</span>
            </button>
          ))}
        </div>

        <section className="space-y-2.5" aria-label="Favourite books">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#8fa0b5] uppercase tracking-wider">Favourite books</h2>
            <button type="button" onClick={() => setPickingFavs(true)} className="text-[11px] text-[#40BCF4] flex items-center gap-1"><Pencil className="w-3 h-3" /> Edit</button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }, (_, i) => {
              const b = favorites[i];
              return b ? (
                <button key={b.id} type="button" onClick={() => ui.open({ type: 'book', book: b })} aria-label={b.title} className="aspect-[2/3] rounded-md overflow-hidden border border-[#253342] book-shadow bg-[#1a2330]">
                  <BookCover book={b} />
                </button>
              ) : (
                <button key={i} type="button" onClick={() => setPickingFavs(true)} aria-label="Add a favourite" className="aspect-[2/3] rounded-md border border-dashed border-[#2f4054] flex items-center justify-center text-[#455669] hover:text-[#15E558] hover:border-[#15E558]">
                  <Plus className="w-5 h-5" />
                </button>
              );
            })}
          </div>
        </section>

        <section className="p-4 rounded-xl bg-[#1a222c] border border-[#273545] space-y-2.5" aria-label="Reading goal">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-xs font-bold">
              <Target className="w-4 h-4 text-[#15E558]" /> {profile.readingGoal.year} reading goal
            </span>
            {editingGoal ? (
              <span className="flex items-center gap-1">
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={1000}
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveGoal()}
                  aria-label="Books to read this year"
                  className="w-16 px-2 py-1 rounded-md bg-[#12161a] border border-[#2f4054] text-xs text-white font-mono"
                  autoFocus
                />
                <button type="button" onClick={saveGoal} aria-label="Save goal" className="p-1 rounded-md bg-[#15E558] text-black"><Check className="w-3.5 h-3.5" /></button>
              </span>
            ) : (
              <button type="button" onClick={() => { setGoalInput(String(target)); setEditingGoal(true); }} className="text-xs font-mono font-bold text-[#15E558] flex items-center gap-1">
                {lib.thisYearCount} / {target} <Pencil className="w-3 h-3 text-[#6c7f96]" />
              </button>
            )}
          </div>
          <div className="w-full h-2 rounded-full bg-[#12161a] overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-gradient-to-r from-[#15E558] to-[#40BCF4] transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-[11px] text-[#6c7f96]">
            {pct >= 100 ? 'Goal reached. Nicely done!' : `${Math.max(0, target - lib.thisYearCount)} to go · ${pct}% there`}
          </p>
        </section>

        {recent.length > 0 && (
          <section className="space-y-2.5" aria-label="Recent activity">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-[#8fa0b5] uppercase tracking-wider">Recently read</h2>
              <button type="button" onClick={onOpenDiary} className="text-[11px] text-[#40BCF4]">Diary</button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {recent.map((l) => {
                const b = lib.catalog[l.bookId];
                if (!b) return null;
                return (
                  <button key={l.id} type="button" onClick={() => ui.open({ type: 'book', book: b })} className="text-left">
                    <span className="block aspect-[2/3] rounded-md overflow-hidden border border-[#253342] bg-[#1a2330]"><BookCover book={b} /></span>
                    <span className="block text-[10px] text-[#15E558] font-bold mt-1 h-3">{l.rating ? '★'.repeat(Math.floor(l.rating)) + (l.rating % 1 ? '½' : '') : ''}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {rated > 0 && (
          <section className="space-y-2" aria-label="Your ratings">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-[#8fa0b5] uppercase tracking-wider">Your ratings</h2>
              <span className="text-[10px] font-mono text-[#6c7f96]">{rated} rated</span>
            </div>
            <div className="h-14 flex items-end gap-1">
              {ratingBars.map((n, i) => (
                <div key={i} className="flex-1 h-full flex items-end" title={`${(i + 1) / 2}★: ${n}`}>
                  <div className="w-full rounded-t bg-[#2a3c50]" style={{ height: `${n ? Math.max(8, (n / maxBar) * 100) : 3}%` }} />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-[#15E558]"><span>★</span><span>★★★★★</span></div>
          </section>
        )}

        <nav className="rounded-xl bg-[#171e26] border border-[#232f3d] divide-y divide-[#202934] overflow-hidden" aria-label="Your library">
          <Row icon={<BookOpen className="w-4 h-4 text-[#15E558]" />} label="Books" count={readIds.length} onClick={() => ui.open({ type: 'grid', title: 'Books you have read', bookIds: readIds, emptyText: 'Books you mark as read or log will appear here.' })} />
          <Row icon={<NotebookPen className="w-4 h-4 text-[#15E558]" />} label="Diary" count={lib.logs.length} onClick={onOpenDiary} />
          <Row icon={<MessageSquareText className="w-4 h-4 text-[#40BCF4]" />} label="Reviews" count={lib.myReviews.length} onClick={() => ui.open({ type: 'reviews' })} />
          <Row icon={<ListIcon className="w-4 h-4 text-[#40BCF4]" />} label="Lists" count={lib.lists.length} onClick={onOpenLists} />
          <Row icon={<Bookmark className="w-4 h-4 text-[#40BCF4]" />} label="Watchlist" count={lib.watchlistIds.length} onClick={() => ui.open({ type: 'grid', title: 'Your Watchlist', bookIds: lib.watchlistIds, emptyText: 'Tap the bookmark on any book to save it for later.' })} />
          <Row icon={<Heart className="w-4 h-4 text-[#FF8000]" />} label="Likes" count={lib.likedIds.length} onClick={() => ui.open({ type: 'grid', title: 'Liked books', bookIds: lib.likedIds, emptyText: 'Books you like will appear here.' })} />
        </nav>
      </div>

      {pickingFavs && <FavoritesPicker onClose={() => setPickingFavs(false)} />}
    </div>
  );
};
