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
import { Avatar, BookCover, BookPoster, PosterSkeleton, SectionHeader, TabBar } from './ui';
import { CreditsFooter } from './CreditsFooter';

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
    <section className="space-y-3" aria-label={title}>
      <SectionHeader
        title={title}
        onMore={books.length ? onMore : undefined}
        right={subtitle ? <span className="hidden sm:inline text-[10px] text-[#678] truncate">{subtitle}</span> : undefined}
      />
      <div className="grid grid-flow-col auto-cols-[calc((100%-1.5rem)/4.3)] md:auto-cols-[calc((100%-3.75rem)/6)] gap-2 md:gap-3 overflow-x-auto px-4 scroll-px-4 md:px-0 md:mx-4 md:scroll-px-0 no-scrollbar snap-x">
        {books.map((book) => (
          <BookPoster
            key={book.id}
            book={book}
            className="snap-start"
            onSelect={(b) => ui.open({ type: 'book', book: b })}
            onLongPress={(b) => {
              lib.actions.upsertBooks([b]);
              ui.open({ type: 'quickMenu', bookId: b.id });
            }}
            isWatchlisted={lib.watchlistIds.includes(book.id)}
            onToggleWatchlist={toggleWatchlist}
          />
        ))}
        {loading && books.length === 0 && Array.from({ length: 6 }, (_, i) => <PosterSkeleton key={i} />)}
      </div>
      {!loading && error && books.length === 0 && (
        <div className="mx-4 py-5 rounded border border-dashed border-[#2c3440] text-center text-xs text-[#678] space-y-2">
          <p>{error}</p>
          {onRetry && (
            <button type="button" onClick={onRetry} className="inline-flex items-center gap-1 text-[#40BCF4] font-semibold">
              <RefreshCw className="w-3 h-3" /> Try again
            </button>
          )}
        </div>
      )}
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
  const firstName = lib.profile.name.split(' ')[0];

  const members = Array.from(new Map(communityActivity.map((a) => [a.user.id, a.user])).values());
  const feed = communityActivity.filter((a) => !memberFilter || a.user.id === memberFilter);

  return (
    <div className="min-h-[calc(100dvh-var(--app-top))] bg-[#14181c] text-white screen-bottom-pad" hidden={!active}>
      <header className="sticky-top z-30 bg-[#14181c]/95 backdrop-blur-md pt-safe">
        <div className="px-4 pt-3 pb-1 flex items-center justify-between md:hidden">
          <BrandLogo size="sm" />
          <button
            type="button"
            onClick={() => ui.open({ type: 'notifications' })}
            aria-label={lib.unreadNotifications ? `Notifications, ${lib.unreadNotifications} unread` : 'Notifications'}
            className="relative p-2 -mr-2 rounded-full text-[#9ab] hover:text-white transition-colors"
          >
            <Bell className="w-5 h-5" />
            {lib.unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#40BCF4] ring-2 ring-[#14181c]" />
            )}
          </button>
        </div>
        <TabBar
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'foryou', label: 'Books' },
            { id: 'community', label: 'Activity' },
            { id: 'journal', label: 'Journal' },
          ]}
        />
      </header>

      {!online && (
        <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-[#2a2415] border border-[#4a3d1c] text-[11px] text-[#f2c66d] flex items-center gap-2">
          <WifiOff className="w-3.5 h-3.5" /> You're offline. Your diary still works; new books will load when you reconnect.
        </div>
      )}

      {tab === 'foryou' && (
        <div className="space-y-8 pt-4">
          <p className="px-4 text-[13px] text-[#9ab] leading-relaxed">
            {lib.session.isGuest ? 'Welcome to Letterbook.' : <>Welcome back, <span className="text-white font-semibold">{firstName}</span>.</>}{' '}
            Here&rsquo;s what readers are opening this week.
          </p>
          {watchlist.length > 0 && (
            <Shelf
              title="From your watchlist"
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
            title="Staff picks"
            books={seedBooks}
            onMore={() => ui.open({ type: 'grid', title: 'Staff picks', bookIds: seedBooks.map((b) => b.id) })}
          />
          <CreditsFooter />
        </div>
      )}

      {tab === 'community' && (
        <div className="space-y-6 pt-4">
          <section className="space-y-3" aria-label="Members">
            <SectionHeader title="Members" />
            <div className="flex gap-4 overflow-x-auto px-4 no-scrollbar">
              {members.map((m) => {
                const active = memberFilter === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMemberFilter(active ? null : m.id)}
                    aria-pressed={active}
                    className="flex flex-col items-center gap-1.5 shrink-0"
                  >
                    <span className={`w-12 h-12 rounded-full p-0.5 ring-1 transition-colors ${active ? 'ring-2 ring-[#00E054]' : 'ring-[#2c3440]'}`}>
                      <Avatar src={m.avatar} name={m.name} className="w-full h-full" />
                    </span>
                    <span className={`text-[11px] truncate max-w-[64px] ${active ? 'text-white' : 'text-[#9ab]'}`}>{m.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-1" aria-label="Activity">
            <SectionHeader
              title={memberFilter ? `${members.find((m) => m.id === memberFilter)?.name}` : 'Recent activity'}
              right={memberFilter ? (
                <button type="button" onClick={() => setMemberFilter(null)} className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#40BCF4]">All</button>
              ) : undefined}
            />
            <div className="divide-y divide-[#2c3440]/70">
              {feed.map((act) => {
                const book = act.bookId ? lib.catalog[act.bookId] : undefined;
                const liked = lib.likedActivityIds.includes(act.id) !== Boolean(act.isLiked);
                const likes = act.likesCount + (liked === Boolean(act.isLiked) ? 0 : liked ? 1 : -1);
                const verb = act.type === 'reviewed' ? 'reviewed' : act.type === 'added_watchlist' ? 'wants to read' : act.type === 'liked' ? 'liked' : 'read';
                return (
                  <article key={act.id} className="px-4 py-4 flex gap-3.5">
                    {book && (
                      <button type="button" onClick={() => ui.open({ type: 'book', book })} className="poster-frame w-16 shrink-0 aspect-[2/3] self-start" aria-label={book.title}>
                        <BookCover book={book} />
                      </button>
                    )}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      {book && (
                        <button type="button" onClick={() => ui.open({ type: 'book', book })} className="block text-left text-[15px] font-bold text-white leading-snug hover:text-[#40BCF4]">
                          {book.title} <span className="font-normal text-[#678] text-sm">{book.year || ''}</span>
                        </button>
                      )}
                      <div className="flex items-center gap-2 text-[11px] text-[#678]">
                        <Avatar src={act.user.avatar} name={act.user.name} className="w-4 h-4" />
                        <span className="truncate">
                          <span className="font-semibold text-[#9ab]">{act.user.name}</span> {verb}
                        </span>
                        {act.rating ? <span className="text-[#00E054] shrink-0">{starText(act.rating)}</span> : null}
                        <span className="ml-auto shrink-0">{relativeTime(act.timestamp)}</span>
                      </div>
                      {act.review && (
                        <p className="text-[13px] text-[#9ab] leading-relaxed line-clamp-3">{act.review.content}</p>
                      )}
                      <button
                        type="button"
                        onClick={() => lib.actions.toggleActivityLike(act.id)}
                        aria-pressed={liked}
                        className={`flex items-center gap-1 text-[11px] transition-colors ${liked ? 'text-[#FF8000]' : 'text-[#678] hover:text-white'}`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-[#FF8000]' : ''}`} />
                        {likes} {likes === 1 ? 'like' : 'likes'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {tab === 'journal' && (
        <div className="space-y-6 pt-4">
          {journalArticles[0] && (
            <button
              type="button"
              onClick={() => ui.open({ type: 'article', articleId: journalArticles[0].id })}
              className="group relative block mx-4 w-[calc(100%-2rem)] text-left rounded overflow-hidden aspect-[16/9] md:aspect-[21/9]"
            >
              <img src={journalArticles[0].coverImage} alt="" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#14181c] via-[#14181c]/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#00E054] mb-1">Featured</p>
                <h2 className="font-serif text-xl md:text-2xl font-bold text-white leading-tight">{journalArticles[0].title}</h2>
                <p className="text-xs text-[#9ab] line-clamp-2 mt-1">{journalArticles[0].subtitle}</p>
              </div>
            </button>
          )}
          <section className="space-y-1" aria-label="Articles">
            <SectionHeader title="Latest from the journal" />
            <div className="divide-y divide-[#2c3440]/70">
              {journalArticles.map((art) => (
                <button
                  key={art.id}
                  type="button"
                  onClick={() => ui.open({ type: 'article', articleId: art.id })}
                  className="w-full px-4 py-3.5 flex gap-3.5 items-center text-left group"
                >
                  <img src={art.coverImage} alt="" className="w-24 h-16 rounded object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white group-hover:text-[#40BCF4] line-clamp-2 leading-snug">{art.title}</h3>
                    <p className="text-[11px] text-[#678] mt-0.5">{art.author} · {art.readTime}</p>
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
