import React, { useState } from 'react';
import { Book, FriendActivity, Article, BookList, UserProfile } from '../types';
import { Bell, ChevronRight, Bookmark, Heart, MoreHorizontal } from 'lucide-react';
import { useLongPress } from '../hooks/useLongPress';

interface HomeScreenProps {
  books: Book[];
  friendActivities: FriendActivity[];
  articles: Article[];
  lists?: BookList[];
  watchlistBookIds: string[];
  readBookIds?: string[];
  likedBookIds?: string[];
  profile?: UserProfile;
  unreadNotifsCount?: number;
  onOpenNotifications: () => void;
  onSelectBook: (book: Book) => void;
  onSelectArticle: (article: Article) => void;
  onSelectList?: (list: BookList) => void;
  onToggleWatchlist: (book: Book, e: React.MouseEvent) => void;
  onToggleActivityLike: (activityId: string) => void;
  onNavigateToSearch: () => void;
  onOpenLogModal?: (book?: Book) => void;
  onNavigateToProfile?: () => void;
  onLongPressBook?: (book: Book) => void;
}

// Internal reusable Home Poster Item supporting touch & mouse long-press quick actions
const HomePosterItem: React.FC<{
  book: Book;
  isWatchlisted: boolean;
  onSelect: (book: Book) => void;
  onLongPress?: (book: Book) => void;
  onToggleWatchlist: (book: Book, e: React.MouseEvent) => void;
}> = ({ book, isWatchlisted, onSelect, onLongPress, onToggleWatchlist }) => {
  const [isPressing, setIsPressing] = useState(false);

  const longPressProps = useLongPress({
    onLongPress: () => {
      setIsPressing(false);
      onLongPress?.(book);
    },
    onClick: () => {
      setIsPressing(false);
      onSelect(book);
    },
    threshold: 380,
  });

  return (
    <div
      {...longPressProps}
      onTouchStart={(e) => {
        setIsPressing(true);
        longPressProps.onTouchStart(e);
      }}
      onTouchEnd={(e) => {
        setIsPressing(false);
        longPressProps.onTouchEnd(e);
      }}
      onMouseDown={(e) => {
        setIsPressing(true);
        longPressProps.onMouseDown(e);
      }}
      onMouseUp={(e) => {
        setIsPressing(false);
        longPressProps.onMouseUp(e);
      }}
      className={`group relative w-28 sm:w-32 shrink-0 aspect-[2/3] rounded-md overflow-hidden bg-[#1a2330] border border-[#253342] hover:border-[#15E558] transition-all cursor-pointer shadow-md select-none ${
        isPressing ? 'scale-95 border-[#40BCF4] shadow-[0_0_15px_rgba(64,188,244,0.4)]' : ''
      }`}
    >
      <img
        src={book.coverImage}
        alt={book.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 pointer-events-none"
        loading="lazy"
      />

      {/* Left spine gradient */}
      <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-r from-black/50 to-transparent pointer-events-none" />

      {/* Step 1 Long Press Ripple Highlight (Blue Touch Ring) */}
      {isPressing && (
        <div className="absolute inset-0 bg-[#40BCF4]/20 backdrop-blur-[1px] flex items-center justify-center pointer-events-none animate-pulse">
          <div className="w-12 h-12 rounded-full border-2 border-[#40BCF4] bg-[#40BCF4]/30 animate-ping" />
        </div>
      )}

      {/* Bookmark Badge in top-right corner of poster */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleWatchlist(book, e);
        }}
        title={isWatchlisted ? 'In Watchlist' : 'Add to Watchlist'}
        className={`absolute top-1.5 right-1.5 p-1 rounded-md backdrop-blur-md transition-colors z-10 ${
          isWatchlisted
            ? 'bg-[#40BCF4] text-black shadow-md'
            : 'bg-black/60 text-white hover:text-[#15E558]'
        }`}
      >
        <Bookmark className={`w-3.5 h-3.5 ${isWatchlisted ? 'fill-black' : ''}`} />
      </button>

      {/* Quick Menu Hint Button on Hover for Desktop */}
      {onLongPress && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onLongPress(book);
          }}
          title="Quick Action Menu"
          className="absolute bottom-1.5 right-1.5 p-1 rounded bg-black/70 text-[#cbd6e2] hover:text-[#00E054] opacity-0 group-hover:opacity-100 transition-opacity z-10 hidden sm:block"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  books = [],
  friendActivities = [],
  articles = [],
  watchlistBookIds = [],
  unreadNotifsCount = 3,
  onOpenNotifications,
  onSelectBook,
  onSelectArticle,
  onToggleWatchlist,
  onToggleActivityLike,
  onNavigateToSearch,
  onLongPressBook,
}) => {
  const [activeHomeTab, setActiveHomeTab] = useState<'foryou' | 'friends' | 'news'>('foryou');

  // Categorized books
  const popularThisWeek = books.slice(0, 6);
  const handpicked = [books[1], books[3], books[6] || books[0], books[2], books[4]];
  const newReleases = books.slice(4).concat(books.slice(0, 2));

  // Friends story list matching Screenshot 2
  const friendStories = [
    { id: 'f1', name: 'BeHaind', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', unreadCount: 5 },
    { id: 'f2', name: 'Robert', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', unreadCount: 3 },
    { id: 'f3', name: 'Dave Vis', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', unreadCount: 1 },
    { id: 'f4', name: 'Rebecca', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', unreadCount: 4 },
    { id: 'f5', name: 'Joseph', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', unreadCount: 2 },
  ];

  // Recently read by friends
  const recentlyReadByFriends = [
    {
      book: books[0], // Dune
      friend: friendStories[0],
      rating: 4.5,
      liked: true
    },
    {
      book: books[1], // Tomorrow
      friend: friendStories[1],
      rating: 5.0,
      liked: true
    },
    {
      book: books[2], // The Secret History
      friend: friendStories[2],
      rating: 4.0,
      liked: false
    },
    {
      book: books[3], // Yellowface
      friend: friendStories[3],
      rating: 3.5,
      liked: true
    },
  ];

  return (
    <div className="min-h-screen bg-[#14181c] text-white select-none pb-24" id="letterboxd-home-screen">
      {/* Top Bar matching Screenshot 1 & 2: Large 'Home' header + Notification Bell with badge */}
      <header className="px-4 pt-3 pb-2 flex items-center justify-between sticky top-0 z-30 bg-[#14181c]/95 backdrop-blur-md">
        <h1 className="text-2xl font-bold text-white tracking-tight">Home</h1>

        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative p-2 rounded-full text-white hover:bg-[#202934] transition-colors"
          title="Notifications"
        >
          <Bell className="w-6 h-6 stroke-[2]" />
          {unreadNotifsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#40BCF4] text-[#14181c] font-mono text-[9px] font-extrabold flex items-center justify-center border-2 border-[#14181c]">
              {unreadNotifsCount}
            </span>
          )}
        </button>
      </header>

      {/* Segmented Filter Pills: [ For You ] [ Friends ] [ News ] */}
      <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveHomeTab('foryou')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeHomeTab === 'foryou'
              ? 'bg-[#2c3f58] text-white shadow-sm'
              : 'bg-[#1b222a] text-[#788a9e] hover:text-white'
          }`}
        >
          For You
        </button>

        <button
          type="button"
          onClick={() => setActiveHomeTab('friends')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeHomeTab === 'friends'
              ? 'bg-[#2c3f58] text-white shadow-sm'
              : 'bg-[#1b222a] text-[#788a9e] hover:text-white'
          }`}
        >
          Friends
        </button>

        <button
          type="button"
          onClick={() => setActiveHomeTab('news')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeHomeTab === 'news'
              ? 'bg-[#2c3f58] text-white shadow-sm'
              : 'bg-[#1b222a] text-[#788a9e] hover:text-white'
          }`}
        >
          News
        </button>
      </div>

      {/* ===================== TAB 1: FOR YOU (Screenshot 1) ===================== */}
      {activeHomeTab === 'foryou' && (
        <div className="space-y-6 pt-2">
          {/* Section: Popular this Week */}
          <section className="space-y-2.5">
            <div className="px-4 flex items-center justify-between">
              <button 
                type="button"
                onClick={onNavigateToSearch}
                className="flex items-center gap-1 text-sm font-bold text-white hover:text-[#15E558] transition-colors"
              >
                <span>Popular this Week</span>
                <ChevronRight className="w-4 h-4 text-[#6c7f96]" />
              </button>
            </div>

            {/* Horizontal Poster Scroll matching Screenshot 1 */}
            <div className="flex gap-2.5 overflow-x-auto px-4 pb-2 no-scrollbar">
              {popularThisWeek.map((book) => (
                <HomePosterItem
                  key={book.id}
                  book={book}
                  isWatchlisted={watchlistBookIds.includes(book.id)}
                  onSelect={onSelectBook}
                  onLongPress={onLongPressBook}
                  onToggleWatchlist={onToggleWatchlist}
                />
              ))}
            </div>
          </section>

          {/* Section: Handpicked for You */}
          <section className="space-y-2.5">
            <div className="px-4 flex items-center justify-between">
              <button 
                type="button"
                onClick={onNavigateToSearch}
                className="flex items-center gap-1 text-sm font-bold text-white hover:text-[#15E558] transition-colors"
              >
                <span>Handpicked for You</span>
                <ChevronRight className="w-4 h-4 text-[#6c7f96]" />
              </button>
            </div>

            <div className="flex gap-2.5 overflow-x-auto px-4 pb-2 no-scrollbar">
              {handpicked.map((book) => {
                if (!book) return null;
                return (
                  <HomePosterItem
                    key={book.id}
                    book={book}
                    isWatchlisted={watchlistBookIds.includes(book.id)}
                    onSelect={onSelectBook}
                    onLongPress={onLongPressBook}
                    onToggleWatchlist={onToggleWatchlist}
                  />
                );
              })}
            </div>
          </section>

          {/* Section: New Releases / Trending */}
          <section className="space-y-2.5">
            <div className="px-4 flex items-center justify-between">
              <button 
                type="button"
                onClick={onNavigateToSearch}
                className="flex items-center gap-1 text-sm font-bold text-white hover:text-[#15E558] transition-colors"
              >
                <span>New Releases</span>
                <ChevronRight className="w-4 h-4 text-[#6c7f96]" />
              </button>
            </div>

            <div className="flex gap-2.5 overflow-x-auto px-4 pb-2 no-scrollbar">
              {newReleases.map((book) => (
                <HomePosterItem
                  key={book.id}
                  book={book}
                  isWatchlisted={watchlistBookIds.includes(book.id)}
                  onSelect={onSelectBook}
                  onLongPress={onLongPressBook}
                  onToggleWatchlist={onToggleWatchlist}
                />
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ===================== TAB 2: FRIENDS (Screenshot 2) ===================== */}
      {activeHomeTab === 'friends' && (
        <div className="space-y-6 pt-2">
          {/* Activity of Friends Story Row matching Screenshot 2 */}
          <section className="space-y-2">
            <h3 className="px-4 text-xs font-bold text-[#8fa0b5] uppercase tracking-wider">
              Activity of Friends
            </h3>

            <div className="flex gap-4 overflow-x-auto px-4 pb-1 no-scrollbar">
              {friendStories.map((friend) => (
                <div key={friend.id} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full p-0.5 border-2 border-[#15E558] group-hover:border-[#40BCF4] transition-colors">
                      <img
                        src={friend.avatar}
                        alt={friend.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    {/* Badge number in top right */}
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#40BCF4] text-[#14181c] font-mono text-[9px] font-extrabold flex items-center justify-center border-2 border-[#14181c]">
                      {friend.unreadCount}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-[#b0c0d0] group-hover:text-white truncate max-w-[64px] text-center">
                    {friend.name}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Recently Read by Friends matching Screenshot 2 */}
          <section className="space-y-2.5">
            <div className="px-4 flex items-center justify-between">
              <span className="text-sm font-bold text-white">Recently Read by Friends</span>
              <ChevronRight className="w-4 h-4 text-[#6c7f96]" />
            </div>

            <div className="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar">
              {recentlyReadByFriends.map(({ book, friend, rating, liked }) => {
                const isWatchlisted = watchlistBookIds.includes(book.id);
                return (
                  <div
                    key={book.id}
                    className="w-28 sm:w-32 shrink-0 flex flex-col gap-1.5 cursor-pointer select-none"
                    onClick={() => onSelectBook(book)}
                  >
                    {/* Book Poster */}
                    <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-[#1a2330] border border-[#253342] shadow-md group">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <button
                        type="button"
                        onClick={(e) => onToggleWatchlist(book, e)}
                        className={`absolute top-1 right-1 p-1 rounded backdrop-blur-md ${
                          isWatchlisted ? 'bg-[#40BCF4] text-black' : 'bg-black/60 text-white'
                        }`}
                      >
                        <Bookmark className={`w-3 h-3 ${isWatchlisted ? 'fill-black' : ''}`} />
                      </button>
                    </div>

                    {/* Friend Rating Footer under poster matching screenshot 2 */}
                    <div className="flex items-center justify-between px-0.5">
                      <div className="flex items-center gap-1 min-w-0">
                        <img
                          src={friend.avatar}
                          alt={friend.name}
                          className="w-4 h-4 rounded-full object-cover border border-[#253342]"
                        />
                        <span className="text-[10px] text-[#9ab] truncate max-w-[40px] font-medium">{friend.name}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <span className="text-[10px] text-[#15E558] font-bold">
                          {'★'.repeat(Math.floor(rating))}
                          {rating % 1 !== 0 ? '½' : ''}
                        </span>
                        {liked && <Heart className="w-2.5 h-2.5 text-[#FF8000] fill-[#FF8000]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section: Activity Feed Reviews */}
          <section className="space-y-3 px-4">
            <h3 className="text-sm font-bold text-white">Community Reviews</h3>

            <div className="space-y-3">
              {friendActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 rounded-xl bg-[#182028] border border-[#232f3d] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={act.user.avatar}
                        alt={act.user.name}
                        className="w-8 h-8 rounded-full object-cover border border-[#2c3a4a]"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-white">{act.user.name}</span>
                          <span className="text-[10px] text-[#6c7f96]">{act.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-[#8fa0b5]">
                          {act.type === 'reviewed' ? 'reviewed' : 'logged'}{' '}
                          <span 
                            onClick={() => act.book && onSelectBook(act.book)}
                            className="text-white font-semibold hover:text-[#15E558] cursor-pointer"
                          >
                            {act.book?.title}
                          </span>
                        </p>
                      </div>
                    </div>

                    {act.rating && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-[#15E558] font-bold">
                          {'★'.repeat(Math.floor(act.rating))}
                          {act.rating % 1 !== 0 ? '½' : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {act.review && (
                    <p className="text-xs text-[#cad5e0] leading-relaxed italic bg-[#13181e] p-2.5 rounded-lg border border-[#1f2832]">
                      "{act.review.content}"
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-[#6c7f96] pt-1">
                    <button
                      type="button"
                      onClick={() => onToggleActivityLike(act.id)}
                      className={`flex items-center gap-1 transition-colors ${
                        act.isLiked ? 'text-[#FF8000]' : 'hover:text-white'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${act.isLiked ? 'fill-[#FF8000]' : ''}`} />
                      <span>{act.likesCount} likes</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => act.book && onSelectBook(act.book)}
                      className="text-[#40BCF4] hover:underline"
                    >
                      View book details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ===================== TAB 3: NEWS (Screenshot 2) ===================== */}
      {activeHomeTab === 'news' && (
        <div className="space-y-5 px-4 pt-2">
          {/* Hero Article matching Screenshot 2 ("Hello, Gorgeous") */}
          <div
            onClick={() => articles[0] && onSelectArticle(articles[0])}
            className="group relative rounded-2xl overflow-hidden aspect-[16/9] border border-[#273545] cursor-pointer shadow-xl"
          >
            <img
              src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80"
              alt="Editorial Cover"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-[#40BCF4] text-black font-mono text-[9px] font-extrabold uppercase">
              Deep Impact
            </div>

            <div className="absolute inset-x-0 bottom-0 p-4">
              <h2 className="text-lg font-extrabold text-white leading-tight group-hover:text-[#15E558] transition-colors">
                Hello, Gorgeous: The Renaissance of Physical Print
              </h2>
              <p className="text-xs text-[#a0b0c0] line-clamp-1 mt-1">
                How modern typography and independent book clubs revitalized reading culture.
              </p>
            </div>
          </div>

          {/* Article List matching Screenshot 2 */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#8fa0b5] uppercase tracking-wider">
              Latest Articles
            </h3>

            <div className="divide-y divide-[#202934]">
              {articles.map((art) => (
                <div
                  key={art.id}
                  onClick={() => onSelectArticle(art)}
                  className="py-3 flex gap-3.5 items-center group cursor-pointer hover:bg-[#182028]/50 transition-colors px-1 rounded-lg"
                >
                  <img
                    src={art.coverImage}
                    alt={art.title}
                    className="w-20 h-14 rounded-lg object-cover border border-[#253342] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9px] font-mono font-bold text-[#15E558] uppercase">
                        {art.category || 'Journal'}
                      </span>
                      <span className="text-[10px] text-[#556677]">• {art.readTime}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white group-hover:text-[#15E558] line-clamp-1">
                      {art.title}
                    </h4>
                    <p className="text-[11px] text-[#788a9e] line-clamp-1 mt-0.5">
                      {art.summary || art.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
