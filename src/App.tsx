import React, { useState } from 'react';
import { 
  Book, Review, BookList, Article, UserProfile, 
  FriendActivity, ActiveTab, ReadingLogEntry, NotificationItem 
} from './types';
import { 
  initialBooks, initialReviews, initialLists, 
  initialArticles, currentUserProfile, initialFriendActivities, initialNotifications 
} from './data/mockData';
import { StatusBar } from './components/StatusBar';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { SearchScreen } from './components/SearchScreen';
import { ListsScreen } from './components/ListsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { BookDetailModal } from './components/BookDetailModal';
import { LogBookModal } from './components/LogBookModal';
import { FilterModal, FilterState } from './components/FilterModal';
import { ListDetailModal } from './components/ListDetailModal';
import { ArticleModal } from './components/ArticleModal';
import { NotificationsScreen } from './components/NotificationsScreen';
import { InstagramStoryModal } from './components/InstagramStoryModal';
import { SettingsModal } from './components/SettingsModal';
import { WatchlistGridModal } from './components/WatchlistGridModal';
import { GenreBooksModal } from './components/GenreBooksModal';
import { BookQuickMenuModal } from './components/BookQuickMenuModal';
import { LoginScreen } from './components/LoginScreen';
import { CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  // Authentication State (with working Logout & Login)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  // Primary State
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [lists, setLists] = useState<BookList[]>(initialLists);
  const [articles] = useState<Article[]>(initialArticles);
  const [friendActivities, setFriendActivities] = useState<FriendActivity[]>(initialFriendActivities);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [profile, setProfile] = useState<UserProfile>(currentUserProfile);

  // User Interaction State
  const [watchlistBookIds, setWatchlistBookIds] = useState<string[]>([
    'dune', 'tomorrow-and-tomorrow', 'the-secret-history', 'piranesi', 'intermezzo', 'babel'
  ]);
  const [readBookIds, setReadBookIds] = useState<string[]>(['the-secret-history', 'dune', 'piranesi']);
  const [likedBookIds, setLikedBookIds] = useState<string[]>(['the-secret-history', 'dune']);
  const [likedListIds, setLikedListIds] = useState<string[]>(['list-dark-academia']);
  const [readingLogs, setReadingLogs] = useState<ReadingLogEntry[]>([
    {
      id: 'log-1',
      bookId: 'the-secret-history',
      dateFinished: '2026-08-18',
      rating: 5.0,
      liked: true,
      review: 'A spiritual necessity every autumn.',
      format: 'physical',
      tags: ['dark-academia', 're-read']
    },
    {
      id: 'log-2',
      bookId: 'dune',
      dateFinished: '2026-08-10',
      rating: 4.5,
      liked: true,
      review: 'Tactile worldbuilding that stands the test of time.',
      format: 'ebook',
      tags: ['sci-fi', 'epic']
    }
  ]);

  // Navigation & Modals State
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedList, setSelectedList] = useState<BookList | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [quickMenuBook, setQuickMenuBook] = useState<Book | null>(null);
  
  // Dedicated Screen overlays
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isWatchlistGridOpen, setIsWatchlistGridOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  
  // Interactive modals
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [logPreselectedBook, setLogPreselectedBook] = useState<Book | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [instagramStoryData, setInstagramStoryData] = useState<{ book: Book; review?: Review; justLogged?: boolean } | null>(null);

  // Filter State matching Screenshot 7
  const [filters, setFilters] = useState<FilterState>({
    sortBy: 'newest',
    genres: [],
    minRating: 0,
    availableOn: [],
    customCovers: true,
    typeReleased: true,
    typePhysical: true,
    typeEbook: true,
    typeAudiobook: false,
    accountRead: false,
    accountUnread: false,
    accountWatchlist: false,
    yearRange: 'all'
  });

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Genre extraction
  const allGenres = Array.from(
    new Set(books.flatMap(b => b.genres))
  );

  // Watchlist Toggle
  const handleToggleWatchlist = (book: Book, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const isCurrently = watchlistBookIds.includes(book.id);
    if (isCurrently) {
      setWatchlistBookIds(prev => prev.filter(id => id !== book.id));
      showToast(`Removed "${book.title}" from Watchlist`);
    } else {
      setWatchlistBookIds(prev => [...prev, book.id]);
      showToast(`Added "${book.title}" to Watchlist`);
    }
  };

  // Read Toggle
  const handleToggleRead = (book: Book) => {
    const isCurrently = readBookIds.includes(book.id);
    if (isCurrently) {
      setReadBookIds(prev => prev.filter(id => id !== book.id));
      showToast(`Unmarked "${book.title}" as read`);
    } else {
      setReadBookIds(prev => [...prev, book.id]);
      showToast(`Marked "${book.title}" as read`);
    }
  };

  // Like Toggle
  const handleToggleLike = (book: Book) => {
    const isCurrently = likedBookIds.includes(book.id);
    if (isCurrently) {
      setLikedBookIds(prev => prev.filter(id => id !== book.id));
    } else {
      setLikedBookIds(prev => [...prev, book.id]);
      showToast(`Added to your liked books ❤️`);
    }
  };

  // Review & Log Save Handler
  const handleSaveLog = (entry: ReadingLogEntry, book: Book) => {
    setReadingLogs(prev => [entry, ...prev]);
    
    // Auto-mark as read & liked if applicable
    if (!readBookIds.includes(book.id)) {
      setReadBookIds(prev => [...prev, book.id]);
    }
    if (entry.liked && !likedBookIds.includes(book.id)) {
      setLikedBookIds(prev => [...prev, book.id]);
    }

    // The diary entry as a review, used for the review feed and the story card
    const loggedReview: Review = {
      id: `rev-${Date.now()}`,
      bookId: book.id,
      userId: profile?.id || 'user-default',
      userName: profile?.name || 'Reader',
      userAvatar: profile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      userHandle: profile?.handle || '@reader',
      rating: entry.rating,
      liked: entry.liked,
      content: entry.review || '',
      date: 'Just now',
      readDate: entry.dateFinished,
      format: entry.format,
      hasSpoilers: Boolean(entry.hasSpoilers),
      likesCount: 0,
      commentsCount: 0,
      tags: entry.tags
    };

    // Add review to list if provided
    if (entry.review) {
      setReviews(prev => [loggedReview, ...prev]);
    }

    // Update profile reading goal progress
    setProfile(prev => ({
      ...prev,
      readingGoal: {
        ...prev.readingGoal,
        completed: prev.readingGoal.completed + 1
      },
      stats: {
        ...prev.stats,
        booksRead: prev.stats.booksRead + 1,
        pagesRead: prev.stats.pagesRead + book.pageCount
      }
    }));

    showToast(`Logged "${book.title}" to your Reading Diary!`);

    // Like Letterboxd, offer to share the rating to an Instagram Story right away
    setInstagramStoryData({ book, review: loggedReview, justLogged: true });
  };

  // Like Review
  const handleLikeReview = (reviewId: string) => {
    setReviews(prev => prev.map(r => {
      if (r.id === reviewId) {
        const nextLiked = !r.isUserLiked;
        return {
          ...r,
          isUserLiked: nextLiked,
          likesCount: r.likesCount + (nextLiked ? 1 : -1)
        };
      }
      return r;
    }));
  };

  // Like List
  const handleToggleLikeList = (listId: string) => {
    setLikedListIds(prev => 
      prev.includes(listId) ? prev.filter(id => id !== listId) : [...prev, listId]
    );
  };

  // Like Friend Activity
  const handleToggleActivityLike = (activityId: string) => {
    setFriendActivities(prev => prev.map(act => {
      if (act.id === activityId) {
        return { ...act, isLiked: !act.isLiked };
      }
      return act;
    }));
  };

  // Create List
  const handleCreateList = (newList: Partial<BookList>) => {
    const list: BookList = {
      id: `list-${Date.now()}`,
      title: newList.title || 'My Curated Collection',
      description: newList.description || '',
      creatorId: profile?.id || 'user-default',
      creatorName: profile?.name || 'Reader',
      creatorAvatar: profile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      books: newList.books || [],
      likesCount: 1,
      commentsCount: 0,
      isRanked: Boolean(newList.isRanked),
      tags: newList.tags || ['Personal'],
      updatedAt: 'Just now'
    };
    setLists(prev => [list, ...prev]);
    showToast(`Created collection "${list.title}"`);
  };

  // Delete reading log
  const handleDeleteReadingLog = (logId: string) => {
    setReadingLogs(prev => prev.filter(l => l.id !== logId));
    showToast('Deleted reading log entry');
  };

  // Quick genre select
  const handleQuickGenreSelect = (genre: string) => {
    setSelectedGenre(genre);
  };

  // Logout Handler
  const handleLogout = () => {
    setIsSettingsOpen(false);
    setIsAuthenticated(false);
    showToast('Logged out of Letterbox');
  };

  // Login Handler
  const handleLogin = (customUser?: { name: string; handle: string }) => {
    if (customUser) {
      setProfile(prev => ({
        ...prev,
        name: customUser.name,
        handle: customUser.handle
      }));
    }
    setIsAuthenticated(true);
    showToast(`Welcome back, ${customUser?.name || profile.name}!`);
  };

  // Clear / mark all notifications as read
  const handleClearNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    showToast('Marked all notifications as read');
  };

  // Quick Menu Action Handlers (Long-Press Flow)
  const handleLongPressBook = (book: Book) => {
    setQuickMenuBook(book);
  };

  const handleQuickRate = (book: Book, rating: number) => {
    const existingLog = readingLogs.find(l => l.bookId === book.id);
    if (existingLog) {
      setReadingLogs(prev => prev.map(l => l.bookId === book.id ? { ...l, rating } : l));
    } else {
      const newEntry: ReadingLogEntry = {
        id: `log-${Date.now()}`,
        bookId: book.id,
        dateFinished: new Date().toISOString().split('T')[0],
        rating,
        liked: likedBookIds.includes(book.id),
        format: 'physical',
        tags: ['quick-rated']
      };
      setReadingLogs(prev => [newEntry, ...prev]);
      if (!readBookIds.includes(book.id)) {
        setReadBookIds(prev => [...prev, book.id]);
      }
    }
    showToast(`Rated "${book.title}" ${rating} stars ★`);
  };

  const handleQuickAddToDiary = (book: Book) => {
    setQuickMenuBook(null);
    setLogPreselectedBook(book);
    setIsLogModalOpen(true);
  };

  const handleQuickWriteReview = (book: Book) => {
    setQuickMenuBook(null);
    setLogPreselectedBook(book);
    setIsLogModalOpen(true);
  };

  const handleQuickAddToList = (book: Book, listId: string) => {
    setLists(prev => prev.map(list => {
      if (list.id === listId) {
        const hasBook = list.books.some(b => b.id === book.id);
        const updatedBooks = hasBook 
          ? list.books.filter(b => b.id !== book.id)
          : [...list.books, book];
        showToast(hasBook ? `Removed from "${list.title}"` : `Added "${book.title}" to "${list.title}"`);
        return { ...list, books: updatedBooks };
      }
      return list;
    }));
  };

  const handleQuickChangeCover = (book: Book, newCoverUrl: string) => {
    setBooks(prev => prev.map(b => b.id === book.id ? { ...b, coverImage: newCoverUrl } : b));
    if (quickMenuBook && quickMenuBook.id === book.id) {
      setQuickMenuBook(prev => prev ? { ...prev, coverImage: newCoverUrl } : null);
    }
    showToast(`Updated cover for "${book.title}"`);
  };

  const handleQuickShare = (book: Book) => {
    setQuickMenuBook(null);
    setInstagramStoryData({ book });
  };

  // Watchlist books list
  const watchlistBooks = books.filter(b => watchlistBookIds.includes(b.id));

  // If user is logged out, show Login / Sign in screen
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#0d1013] flex justify-center selection:bg-[#15E558] selection:text-black">
      {/* Mobile-Frame Canvas constraint matching Letterboxd App */}
      <main className="w-full max-w-md bg-[#14181c] min-h-screen relative flex flex-col shadow-2xl border-x border-[#1c2633]" id="letterbook-app-root">
        
        {/* Top Status Bar */}
        <StatusBar />

        {/* Dynamic Main Screens */}
        <div className="flex-1">
          {activeTab === 'home' && (
            <HomeScreen
              books={books}
              friendActivities={friendActivities}
              articles={articles}
              lists={lists}
              watchlistBookIds={watchlistBookIds}
              readBookIds={readBookIds}
              likedBookIds={likedBookIds}
              profile={profile}
              unreadNotifsCount={notifications.filter(n => !n.isRead).length || 3}
              onOpenNotifications={() => setIsNotificationsOpen(true)}
              onSelectBook={(book) => setSelectedBook(book)}
              onSelectArticle={(art) => setSelectedArticle(art)}
              onSelectList={(list) => setSelectedList(list)}
              onToggleWatchlist={handleToggleWatchlist}
              onToggleActivityLike={handleToggleActivityLike}
              onNavigateToSearch={() => setActiveTab('search')}
              onNavigateToProfile={() => setActiveTab('profile')}
              onLongPressBook={handleLongPressBook}
              onOpenLogModal={(book) => {
                setLogPreselectedBook(book || null);
                setIsLogModalOpen(true);
              }}
            />
          )}

          {activeTab === 'search' && (
            <SearchScreen
              books={books}
              watchlistBookIds={watchlistBookIds}
              readBookIds={readBookIds}
              likedBookIds={likedBookIds}
              filters={filters}
              onSelectBook={(book) => setSelectedBook(book)}
              onLongPressBook={handleLongPressBook}
              onToggleWatchlist={handleToggleWatchlist}
              onOpenFilterModal={() => setIsFilterModalOpen(true)}
              availableGenres={allGenres}
              onQuickGenreSelect={handleQuickGenreSelect}
            />
          )}

          {activeTab === 'lists' && (
            <ListsScreen
              lists={lists}
              books={books}
              watchlistBooks={watchlistBooks}
              readingLogs={readingLogs}
              readBookIds={readBookIds}
              likedBookIds={likedBookIds}
              watchlistBookIds={watchlistBookIds}
              onSelectList={(list) => setSelectedList(list)}
              onSelectBook={(book) => setSelectedBook(book)}
              onLongPressBook={handleLongPressBook}
              onToggleWatchlist={handleToggleWatchlist}
              onCreateList={handleCreateList}
              onDeleteReadingLog={handleDeleteReadingLog}
              onOpenWatchlistGrid={() => setIsWatchlistGridOpen(true)}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileScreen
              profile={profile}
              books={books}
              readingLogs={readingLogs}
              readBookIds={readBookIds}
              likedBookIds={likedBookIds}
              watchlistBookIds={watchlistBookIds}
              onSelectBook={(book) => setSelectedBook(book)}
              onLongPressBook={handleLongPressBook}
              onToggleWatchlist={handleToggleWatchlist}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenWatchlistGrid={() => setIsWatchlistGridOpen(true)}
            />
          )}
        </div>

        {/* Bottom Navigation matching Letterboxd */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          onOpenLogModal={() => {
            setLogPreselectedBook(null);
            setIsLogModalOpen(true);
          }}
          profile={profile}
        />

        {/* TOAST POPUP */}
        {toastMessage && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-[#15E558] text-black text-xs font-mono font-bold uppercase tracking-wide shadow-2xl flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            {toastMessage}
          </div>
        )}

        {/* SCREEN OVERLAY: Notifications (Screenshot 3) */}
        {isNotificationsOpen && (
          <div className="fixed inset-0 z-50 max-w-md mx-auto bg-[#14181c] overflow-y-auto">
            <NotificationsScreen
              notifications={notifications}
              onBack={() => setIsNotificationsOpen(false)}
              onClearAll={handleClearNotifications}
              onSelectBook={(book) => {
                setIsNotificationsOpen(false);
                setSelectedBook(book);
              }}
            />
          </div>
        )}

        {/* SCREEN OVERLAY: 4-Column Watchlist Grid (Screenshot 5) */}
        <WatchlistGridModal
          isOpen={isWatchlistGridOpen}
          onClose={() => setIsWatchlistGridOpen(false)}
          watchlistBooks={watchlistBooks}
          onSelectBook={(book) => {
            setIsWatchlistGridOpen(false);
            setSelectedBook(book);
          }}
          onLongPressBook={handleLongPressBook}
          onToggleWatchlist={handleToggleWatchlist}
          onOpenFilter={() => setIsFilterModalOpen(true)}
        />

        {/* SCREEN OVERLAY: Genre Books Collection (Screenshot 4) */}
        {selectedGenre && (
          <GenreBooksModal
            isOpen={Boolean(selectedGenre)}
            onClose={() => setSelectedGenre(null)}
            genre={selectedGenre}
            books={books}
            watchlistBookIds={watchlistBookIds}
            onSelectBook={(b) => {
              setSelectedGenre(null);
              setSelectedBook(b);
            }}
            onLongPressBook={handleLongPressBook}
            onToggleWatchlist={handleToggleWatchlist}
            onOpenFilter={() => setIsFilterModalOpen(true)}
          />
        )}

        {/* MODAL: Instagram Story Exporter */}
        {instagramStoryData && (
          <InstagramStoryModal
            isOpen={Boolean(instagramStoryData)}
            onClose={() => setInstagramStoryData(null)}
            book={instagramStoryData.book}
            review={instagramStoryData.review}
            justLogged={instagramStoryData.justLogged}
            profile={profile}
            onShowToast={showToast}
          />
        )}

        {/* MODAL: Settings & Logout */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          profile={profile}
          onUpdateProfile={(updated) => setProfile(prev => ({ ...prev, ...updated }))}
          onLogout={handleLogout}
          onShowToast={showToast}
        />

        {/* MODAL: Book Details */}
        <BookDetailModal
          book={selectedBook}
          isOpen={Boolean(selectedBook)}
          onClose={() => setSelectedBook(null)}
          reviews={reviews}
          isRead={selectedBook ? readBookIds.includes(selectedBook.id) : false}
          isLiked={selectedBook ? likedBookIds.includes(selectedBook.id) : false}
          isWatchlisted={selectedBook ? watchlistBookIds.includes(selectedBook.id) : false}
          onToggleRead={handleToggleRead}
          onToggleLike={handleToggleLike}
          onToggleWatchlist={handleToggleWatchlist}
          onOpenLogModal={(b) => {
            setLogPreselectedBook(b);
            setIsLogModalOpen(true);
          }}
          onLikeReview={handleLikeReview}
          onOpenInstagramShare={(book, rev) => {
            setInstagramStoryData({ book, review: rev });
          }}
        />

        {/* MODAL: Log & Review Entry */}
        <LogBookModal
          isOpen={isLogModalOpen}
          onClose={() => {
            setIsLogModalOpen(false);
            setLogPreselectedBook(null);
          }}
          books={books}
          preselectedBook={logPreselectedBook}
          onSaveLog={handleSaveLog}
        />

        {/* MODAL: Filter Matrix (Screenshot 7) */}
        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          filters={filters}
          onApplyFilters={(f) => setFilters(f)}
          availableGenres={allGenres}
        />

        {/* MODAL: List Detail */}
        <ListDetailModal
          list={selectedList}
          isOpen={Boolean(selectedList)}
          onClose={() => setSelectedList(null)}
          onSelectBook={(book) => setSelectedBook(book)}
          onLongPressBook={handleLongPressBook}
          onToggleWatchlist={handleToggleWatchlist}
          watchlistBookIds={watchlistBookIds}
          readBookIds={readBookIds}
          likedBookIds={likedBookIds}
          onToggleLikeList={handleToggleLikeList}
          isLiked={selectedList ? likedListIds.includes(selectedList.id) : false}
        />

        {/* MODAL: Journal Article */}
        <ArticleModal
          article={selectedArticle}
          isOpen={Boolean(selectedArticle)}
          onClose={() => setSelectedArticle(null)}
          featuredBooks={books.filter(b => selectedArticle?.featuredBookIds.includes(b.id))}
          onSelectBook={(b) => setSelectedBook(b)}
          onToggleWatchlist={handleToggleWatchlist}
          watchlistBookIds={watchlistBookIds}
        />

        {/* MODAL: Book Quick Menu (Long-Press Flow) */}
        <BookQuickMenuModal
          isOpen={Boolean(quickMenuBook)}
          onClose={() => setQuickMenuBook(null)}
          book={quickMenuBook}
          isWatchlisted={quickMenuBook ? watchlistBookIds.includes(quickMenuBook.id) : false}
          isLiked={quickMenuBook ? likedBookIds.includes(quickMenuBook.id) : false}
          userRating={quickMenuBook ? readingLogs.find(l => l.bookId === quickMenuBook.id)?.rating : undefined}
          lists={lists}
          onToggleWatchlist={handleToggleWatchlist}
          onQuickRate={handleQuickRate}
          onAddToDiary={handleQuickAddToDiary}
          onWriteReview={handleQuickWriteReview}
          onAddToList={handleQuickAddToList}
          onChangeCover={handleQuickChangeCover}
          onShare={handleQuickShare}
          onShowToast={showToast}
        />
      </main>
    </div>
  );
};

export default App;
