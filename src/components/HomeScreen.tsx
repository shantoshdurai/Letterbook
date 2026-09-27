import React, { useState } from 'react';
import { Bell, Heart, RefreshCw, WifiOff } from 'lucide-react';
import { Book } from '../types';
import { useLibrary } from '../state/library';
import { useUI } from '../state/ui';
import { useAsyncBooks, useOnline } from '../hooks/useBooks';
import { fetchTrending, fetchNewReleases, fetchForGenres, peekCachedBooks } from '../lib/openLibrary';
import { communityActivity, journalArticles, seedBooks } from '../data/seed';
import { relativeTime, starText } from '../lib/format';
import { BrandLogo } from './BrandLogo';
import { Avatar, BookCover, BookPoster, Pill, PosterSkeleton, SectionHeader } from './ui';

const DEFAULT_GENRES = ['Literary Fiction', 'Fantasy'];

const Shelf: React.FC<{
  title: string;
  subtitle?: string;
  books: Book[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onMore?: () => void;
}> = ({ title, subtitle, books, loading, error, onRetry, onMore }) => {
  const lib = useLibrary();
  const ui = useUI();
  const toggleWatchlist = (b: Book) => {
    const added = lib.actions.toggleWatchlist(b);
    ui.toast(added ? `Added "${b.title}" to your watchlist` : `Removed "${b.title}" from your watchlist`);
  };
  return (
    <section className="space-y-2.5" aria-label={title}>
      <SectionHeader
        title={title}
        onMore={books.length ? onMore : undefined}
        right={subtitle ? <span className="text-[10px] text-[#6c7f96] truncate max-w-[45%]">{subtitle}</span> : undefined}
      />
      <div className="flex gap-2.5 overflow-x-auto px-4 pb-1 no-scrollbar snap-x">
        {books.map((book) => (
          <BookPoster
            key={book.id}
            book={book}
            className="w-[6.5rem] shrink-0 snap-start"
            onSelect={(b) => ui.open({ type: 'book', book: b })}
            onLongPress={(b) => {
              lib.actions.upsertBooks([b]);
              ui.open({ type: 'quickMenu', bookId: b.id });
            }}
            isWatchlisted={lib.watchlistIds.includes(book.id)}
            onToggleWatchlist={toggleWatchlist}
            isRead={lib.readIds.includes(book.id)}
          />
        ))}
        {loading && books.length === 0 && Array.from({ length: 5 }, (_, i) => <PosterSkeleton key={i} className="w-[6.5rem] shrink-0" />)}
        {!loading && error && books.length === 0 && (
          <div className="w-full py-6 rounded-xl border border-dashed border-[#2a3848] text-center text-xs text-[#7d8fa3] space-y-2">
            <p>{error}</p>
            {onRetry && (
              <button type="button" onClick={onRetry} className="inline-flex items-center gap-1 text-[#40BCF4] font-semibold">
                <RefreshCw className="w-3 h-3" /> Try again
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export const HomeScreen: React.FC<{ active: boolean }> = ({ active }) => {
  const lib = useLibrary();
  const ui = useUI();
  const online = useOnline();
  const [tab, setTab] = useState<'foryou' | 'community' | 'journal'>('foryou');
  const [memberFilter, setMemberFilter] = useState<string | null>(null);

  const genres = lib.profile.favoriteGenres.length ? lib.profile.favoriteGenres : DEFAULT_GENRES;
  const trending = useAsyncBooks('trending', () => fetchTrending(18), peekCachedBooks('trending:18'));
  const forYou = useAsyncBooks(`foryou:${genres.join('|')}`, () => fetchForGenres(genres, 18));
  const releases = useAsyncBooks('new', () => fetchNewReleases(18));

  const watchlist = lib.resolve(lib.watchlistIds).slice(0, 12);

  const members = Array.from(new Map(communityActivity.map((a) => [a.user.id, a.user])).values());
  const feed = communityActivity.filter((a) => !memberFilter || a.user.id === memberFilter);

  return (
    <div className="min-h-[100dvh] bg-[#14181c] text-white screen-bottom-pad" hidden={!active}>
      <header className="sticky top-0 z-30 bg-[#14181c]/95 backdrop-blur-md pt-safe">
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <BrandLogo size="sm" />
          <button
            type="button"
            onClick={() => ui.open({ type: 'notifications' })}
            aria-label={lib.unreadNotifications ? `Notifications, ${lib.unreadNotifications} unread` : 'Notifications'}
            className="relative p-2 rounded-full text-white hover:bg-[#202934] transition-colors"
          >
            <Bell className="w-6 h-6" />
            {lib.unreadNotifications > 0 && (
              <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-[#40BCF4] text-[#14181c] font-mono text-[9px] font-extrabold flex items-center justify-center border-2 border-[#14181c]">
                {lib.unreadNotifications > 9 ? '9+' : lib.unreadNotifications}
              </span>
            )}
          </button>
        </div>
        <div className="px-4 pb-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Pill active={tab === 'foryou'} onClick={() => setTab('foryou')}>For You</Pill>
          <Pill active={tab === 'community'} onClick={() => setTab('community')}>Community</Pill>
          <Pill active={tab === 'journal'} onClick={() => setTab('journal')}>Journal</Pill>
        </div>
      </header>

      {!online && (
        <div className="mx-4 mt-2 px-3 py-2 rounded-lg bg-[#2a2415] border border-[#4a3d1c] text-[11px] text-[#f2c66d] flex items-center gap-2">
          <WifiOff className="w-3.5 h-3.5" /> You're offline. Your diary still works; new books will load when you reconnect.
        </div>
      )}

      {tab === 'foryou' && (
        <div className="space-y-6 pt-3">
          {watchlist.length > 0 && (
            <Shelf
              title="Up next from your watchlist"
              books={watchlist}
              onMore={() => ui.open({ type: 'grid', title: 'Your Watchlist', bookIds: lib.watchlistIds })}
            />
          )}
          <Shelf
            title="Popular this week"
            books={trending.books}
            loading={trending.loading}
            error={trending.error}
            onRetry={trending.retry}
            onMore={() => ui.open({ type: 'grid', title: 'Popular this week', source: 'trending' })}
          />
          <Shelf
            title="Picked for you"
            subtitle={genres.join(' · ')}
            books={forYou.books}
            loading={forYou.loading}
            error={forYou.error}
            onRetry={forYou.retry}
            onMore={() => ui.open({ type: 'grid', title: 'Picked for you', subtitle: genres.join(' · '), source: 'foryou' })}
          />
          <Shelf
            title="New releases"
            books={releases.books}
            loading={releases.loading}
            error={releases.error}
            onRetry={releases.retry}
            onMore={() => ui.open({ type: 'grid', title: 'New releases', source: 'new' })}
          />
          <Shelf
            title="Letterbook staff picks"
            books={seedBooks}
            onMore={() => ui.open({ type: 'grid', title: 'Staff picks', bookIds: seedBooks.map((b) => b.id) })}
          />
        </div>
      )}

      {tab === 'community' && (
        <div className="space-y-6 pt-3">
          <section className="space-y-2" aria-label="Members">
            <h2 className="px-4 text-xs font-bold text-[#8fa0b5] uppercase tracking-wider">Recent activity from members</h2>
            <div className="flex gap-4 overflow-x-auto px-4 pb-1 no-scrollbar">
              {members.map((m) => {
                const active = memberFilter === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMemberFilter(active ? null : m.id)}
                    aria-pressed={active}
                    className="flex flex-col items-center gap-1 shrink-0"
                  >
                    <span className={`w-14 h-14 rounded-full p-0.5 border-2 transition-colors ${active ? 'border-[#40BCF4]' : 'border-[#15E558]'}`}>
                      <Avatar src={m.avatar} name={m.name} className="w-full h-full" />
                    </span>
                    <span className={`text-[11px] font-medium truncate max-w-[64px] ${active ? 'text-white' : 'text-[#b0c0d0]'}`}>{m.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-3 px-4" aria-label="Activity">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">{memberFilter ? `${members.find((m) => m.id === memberFilter)?.name}'s activity` : 'Latest activity'}</h2>
              {memberFilter && (
                <button type="button" onClick={() => setMemberFilter(null)} className="text-[11px] text-[#40BCF4]">Show all</button>
              )}
            </div>
            {feed.map((act) => {
              const book = act.bookId ? lib.catalog[act.bookId] : undefined;
              const liked = lib.likedActivityIds.includes(act.id) !== Boolean(act.isLiked);
              const likes = act.likesCount + (liked === Boolean(act.isLiked) ? 0 : liked ? 1 : -1);
              const verb = act.type === 'reviewed' ? 'reviewed' : act.type === 'added_watchlist' ? 'wants to read' : act.type === 'liked' ? 'liked' : 'read';
              return (
                <article key={act.id} className="p-3.5 rounded-xl bg-[#182028] border border-[#232f3d] flex gap-3">
                  {book && (
                    <button type="button" onClick={() => ui.open({ type: 'book', book })} className="w-14 shrink-0 aspect-[2/3] rounded overflow-hidden border border-[#2c3a4a]" aria-label={book.title}>
                      <BookCover book={book} />
                    </button>
                  )}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Avatar src={act.user.avatar} name={act.user.name} className="w-5 h-5" />
                      <p className="text-[11px] text-[#8fa0b5] truncate">
                        <span className="font-bold text-white">{act.user.name}</span> {verb}
                      </p>
                      <span className="ml-auto text-[10px] text-[#6c7f96] shrink-0">{relativeTime(act.timestamp)}</span>
                    </div>
                    {book && (
                      <button type="button" onClick={() => ui.open({ type: 'book', book })} className="text-left text-xs font-bold text-white hover:text-[#15E558]">
                        {book.title} <span className="font-normal text-[#6c7f96]">{book.year || ''}</span>
                      </button>
                    )}
                    {act.rating ? <p className="text-xs text-[#15E558] font-bold">{starText(act.rating)}</p> : null}
                    {act.review && (
                      <p className="text-xs text-[#cad5e0] leading-relaxed line-clamp-3">{act.review.content}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => lib.actions.toggleActivityLike(act.id)}
                      aria-pressed={liked}
                      className={`flex items-center gap-1 text-[11px] pt-0.5 transition-colors ${liked ? 'text-[#FF8000]' : 'text-[#6c7f96] hover:text-white'}`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-[#FF8000]' : ''}`} />
                      {likes} {likes === 1 ? 'like' : 'likes'}
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        </div>
      )}

      {tab === 'journal' && (
        <div className="space-y-5 px-4 pt-3">
          {journalArticles[0] && (
            <button
              type="button"
              onClick={() => ui.open({ type: 'article', articleId: journalArticles[0].id })}
              className="group relative block w-full text-left rounded-2xl overflow-hidden aspect-[16/10] border border-[#273545] shadow-xl"
            >
              <img src={journalArticles[0].coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-[#40BCF4] text-black font-mono text-[9px] font-extrabold uppercase">Featured</span>
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h2 className="text-lg font-extrabold text-white leading-tight">{journalArticles[0].title}</h2>
                <p className="text-xs text-[#a0b0c0] line-clamp-2 mt-1">{journalArticles[0].subtitle}</p>
              </div>
            </button>
          )}
          <section className="space-y-2" aria-label="Articles">
            <h2 className="text-xs font-bold text-[#8fa0b5] uppercase tracking-wider">Latest from the journal</h2>
            <div className="divide-y divide-[#202934]">
              {journalArticles.map((art) => (
                <button
                  key={art.id}
                  type="button"
                  onClick={() => ui.open({ type: 'article', articleId: art.id })}
                  className="w-full py-3 flex gap-3.5 items-center text-left group"
                >
                  <img src={art.coverImage} alt="" className="w-20 h-14 rounded-lg object-cover border border-[#253342] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-[#6c7f96] mb-0.5">{art.author} · {art.readTime}</p>
                    <h3 className="text-xs font-bold text-white group-hover:text-[#15E558] line-clamp-2">{art.title}</h3>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
