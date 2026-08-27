import React from 'react';
import { UserProfile, Book, ReadingLogEntry } from '../types';
import { Settings, MapPin, Target } from 'lucide-react';
import { useLongPress } from '../hooks/useLongPress';

interface ProfileScreenProps {
  profile: UserProfile;
  books: Book[];
  readingLogs: ReadingLogEntry[];
  readBookIds: string[];
  likedBookIds?: string[];
  watchlistBookIds: string[];
  onSelectBook: (book: Book) => void;
  onLongPressBook?: (book: Book) => void;
  onToggleWatchlist?: (book: Book, e: React.MouseEvent) => void;
  onOpenSettings: () => void;
  onOpenWatchlistGrid: () => void;
}

const ProfileFavoritePoster: React.FC<{
  book: Book;
  onSelect: (book: Book) => void;
  onLongPress?: (book: Book) => void;
}> = ({ book, onSelect, onLongPress }) => {
  const longPressProps = useLongPress({
    onLongPress: () => onLongPress?.(book),
    onClick: () => onSelect(book),
    threshold: 380,
  });

  return (
    <div
      {...longPressProps}
      className="group relative aspect-[2/3] rounded-md overflow-hidden bg-[#1a2330] border border-[#253342] hover:border-[#15E558] transition-all cursor-pointer shadow-md select-none active:scale-95"
    >
      <img
        src={book.coverImage}
        alt={book.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 pointer-events-none"
      />
    </div>
  );
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  books = [],
  readBookIds = [],
  watchlistBookIds = [],
  onSelectBook,
  onLongPressBook,
  onOpenSettings,
  onOpenWatchlistGrid,
}) => {
  const favoriteBooks = (profile?.favoriteBookIds || [])
    .map(id => books.find(b => b.id === id))
    .filter((b): b is Book => Boolean(b));

  const completed = profile?.readingGoal?.completed || 28;
  const target = profile?.readingGoal?.target || 50;
  const goalProgressPercent = Math.min(100, Math.round((completed / target) * 100));

  return (
    <div className="min-h-screen bg-[#14181c] text-white select-none pb-24" id="letterboxd-profile-screen">
      {/* Top Bar matching Letterboxd: User Handle in center/left + Settings gear on right */}
      <header className="px-4 py-3 flex items-center justify-between sticky top-0 z-30 bg-[#14181c]/95 backdrop-blur-md border-b border-[#202934]">
        <h1 className="text-base font-bold text-white tracking-tight">{profile?.handle || '@reader'}</h1>

        <button
          type="button"
          onClick={onOpenSettings}
          className="p-1.5 rounded-full text-[#8fa0b5] hover:text-white hover:bg-[#202934] transition-colors"
          title="Account Settings & Preferences"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      <div className="px-4 py-4 space-y-6">
        {/* Profile Card Header */}
        <div className="flex items-start gap-4">
          <div className="w-18 h-18 rounded-full overflow-hidden border-2 border-[#15E558] p-0.5 shadow-lg shrink-0">
            <img
              src={profile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
              alt={profile?.name || 'Reader'}
              className="w-full h-full rounded-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-extrabold text-white tracking-tight leading-tight">
              {profile?.name || 'Alex Morgan'}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-[#6c7f96] mt-0.5">
              <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {profile?.location || 'New York, USA'}</span>
              <span>•</span>
              <span>Joined {profile?.joinedYear || 2026}</span>
            </div>

            <p className="text-xs text-[#a0b0c0] mt-2 line-clamp-2 leading-relaxed">
              {profile?.bio || 'Passionate reader tracking literary fiction, sci-fi worldbuilding, and dark academia.'}
            </p>
          </div>
        </div>

        {/* Stats Row matching Letterboxd */}
        <div className="grid grid-cols-4 gap-2 py-3 border-y border-[#202934] text-center">
          <div className="space-y-0.5">
            <span className="text-base font-bold font-mono text-white">{readBookIds.length + 28}</span>
            <span className="text-[10px] text-[#748393] uppercase font-medium block">Read</span>
          </div>
          <div className="space-y-0.5 cursor-pointer" onClick={onOpenWatchlistGrid}>
            <span className="text-base font-bold font-mono text-[#40BCF4]">{watchlistBookIds.length}</span>
            <span className="text-[10px] text-[#748393] uppercase font-medium block">Watchlist</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-base font-bold font-mono text-white">{profile?.followersCount || 1420}</span>
            <span className="text-[10px] text-[#748393] uppercase font-medium block">Followers</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-base font-bold font-mono text-white">{profile?.followingCount || 238}</span>
            <span className="text-[10px] text-[#748393] uppercase font-medium block">Following</span>
          </div>
        </div>

        {/* Favorite 4 Books (Pinned Poster Row matching Letterboxd) */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8fa0b5] uppercase tracking-wider">
              Favorite Books
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {favoriteBooks.slice(0, 4).map((book) => (
              <ProfileFavoritePoster
                key={book.id}
                book={book}
                onSelect={onSelectBook}
                onLongPress={onLongPressBook}
              />
            ))}
          </div>
        </section>

        {/* Reading Goal Progress Card */}
        <div className="p-4 rounded-xl bg-[#1a222c] border border-[#273545] space-y-2.5 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#15E558]" />
              <span className="text-xs font-bold text-white">
                2026 Reading Goal
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-[#15E558]">
              {completed} of {target} books ({goalProgressPercent}%)
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-[#12161a] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#15E558] to-[#40BCF4] transition-all duration-500"
              style={{ width: `${goalProgressPercent}%` }}
            />
          </div>
        </div>

        {/* Quick Settings & Export Shortcut */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-full py-2.5 rounded-xl bg-[#1a222c] hover:bg-[#232f3e] border border-[#273545] text-xs text-[#a0b0c0] font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Settings className="w-4 h-4 text-[#8fa0b5]" />
            Settings & Reading Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
