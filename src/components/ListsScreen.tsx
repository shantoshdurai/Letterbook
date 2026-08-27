import React, { useState } from 'react';
import { BookList, Book, ReadingLogEntry } from '../types';
import { 
  Plus, ChevronRight, Bookmark, List as ListIcon, Calendar as CalendarIcon, 
  Heart
} from 'lucide-react';
import { useLongPress } from '../hooks/useLongPress';

// Reusable Diary Book Row with long-press
const DiaryBookRow: React.FC<{
  log: ReadingLogEntry;
  book: Book;
  dayNum: string;
  onSelect: (book: Book) => void;
  onLongPress?: (book: Book) => void;
}> = ({ log, book, dayNum, onSelect, onLongPress }) => {
  const rating = log.rating || 5.0;
  const longPressProps = useLongPress({
    onLongPress: () => {
      if (onLongPress) onLongPress(book);
    },
    onClick: () => onSelect(book),
  });

  return (
    <div
      {...longPressProps}
      className="py-2.5 flex items-center gap-3 hover:bg-[#182028] px-1 rounded-lg cursor-pointer group select-none"
    >
      {/* Day Box matching Screenshot 6 */}
      <div className="w-7 h-7 rounded bg-[#1f2834] border border-[#2e3c4e] flex items-center justify-center font-mono font-bold text-xs text-[#a0b0c0] shrink-0">
        {dayNum}
      </div>

      {/* Poster Thumbnail */}
      <img
        src={book.coverImage}
        alt={book.title}
        className="w-9 h-13 rounded object-cover border border-[#273545] shrink-0"
      />

      {/* Title & Rating */}
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold text-white group-hover:text-[#15E558] truncate">
          {book.title} <span className="text-[#6c7f96] font-normal">({book.year})</span>
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] text-[#15E558] font-bold">
            {'★'.repeat(Math.floor(rating))}
            {rating % 1 !== 0 ? '½' : ''}
          </span>
          {log.liked && (
            <Heart className="w-3 h-3 text-[#FF8000] fill-[#FF8000]" />
          )}
        </div>
      </div>
    </div>
  );
};

// Reusable Calendar Cell with long press
const CalendarBookCell: React.FC<{
  day: number;
  book: Book;
  onSelect: (book: Book) => void;
  onLongPress?: (book: Book) => void;
}> = ({ day, book, onSelect, onLongPress }) => {
  const longPressProps = useLongPress({
    onLongPress: () => {
      if (onLongPress) onLongPress(book);
    },
    onClick: () => onSelect(book),
  });

  return (
    <div
      {...longPressProps}
      className="relative aspect-[2/3] rounded overflow-hidden bg-[#1a2330] border border-[#2d3b4c] hover:border-[#15E558] cursor-pointer shadow-md group select-none"
      title={`${book.title} on Day ${day}`}
    >
      <img
        src={book.coverImage}
        alt={book.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
      />
      {/* Day number stamp in top-left corner */}
      <div className="absolute top-0.5 left-0.5 px-1 py-0.2 rounded bg-black/80 font-mono text-[9px] font-bold text-white border border-white/10">
        {day}
      </div>
    </div>
  );
};

interface ListsScreenProps {
  lists: BookList[];
  books: Book[];
  watchlistBooks: Book[];
  readingLogs: ReadingLogEntry[];
  readBookIds?: string[];
  likedBookIds?: string[];
  watchlistBookIds?: string[];
  onSelectList: (list: BookList) => void;
  onSelectBook: (book: Book) => void;
  onLongPressBook?: (book: Book) => void;
  onToggleWatchlist?: (book: Book, e: React.MouseEvent) => void;
  onCreateList: (newList: Partial<BookList>) => void;
  onDeleteReadingLog?: (logId: string) => void;
  onOpenWatchlistGrid: () => void;
}

export const ListsScreen: React.FC<ListsScreenProps> = ({
  lists,
  books,
  watchlistBooks,
  readingLogs,
  onSelectList,
  onSelectBook,
  onLongPressBook,
  onCreateList,
  onOpenWatchlistGrid,
}) => {
  const [activeTab, setActiveTab] = useState<'your-lists' | 'diary' | 'discover'>('your-lists');
  const [diaryViewMode, setDiaryViewMode] = useState<'list' | 'calendar'>('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIsRanked] = useState(false);
  const [selectedBookIdsForList, setSelectedBookIdsForList] = useState<string[]>([]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const selectedBooks = books.filter(b => selectedBookIdsForList.includes(b.id));
    onCreateList({
      title: newTitle.trim(),
      description: newDesc.trim() || 'Curated book collection on Letterbook.',
      isRanked: newIsRanked,
      books: selectedBooks.length > 0 ? selectedBooks : [books[0], books[1], books[2]],
      tags: ['Personal', 'Collection']
    });

    setNewTitle('');
    setNewDesc('');
    setSelectedBookIdsForList([]);
    setShowCreateModal(false);
  };

  const toggleBookForNewList = (bookId: string) => {
    setSelectedBookIdsForList(prev => 
      prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]
    );
  };

  // Group reading logs by Month for diary
  const diaryLogsExtended: { log: ReadingLogEntry; book: Book }[] = readingLogs
    .map(log => ({
      log,
      book: books.find(b => b.id === log.bookId) || books[0]
    }))
    .filter(item => Boolean(item.book));

  // Default diary entries for previous months matching Screenshot 6
  const decemberEntries = diaryLogsExtended;
  const novemberEntries: { log: ReadingLogEntry; book: Book }[] = [
    { log: { id: 'd-1', bookId: books[0]?.id || '1', dateFinished: '2026-11-28', rating: 4.5, liked: true, format: 'physical', tags: ['favorite'] }, book: books[0] },
    { log: { id: 'd-2', bookId: books[1]?.id || '2', dateFinished: '2026-11-24', rating: 5.0, liked: true, format: 'physical', tags: ['favorite'] }, book: books[1] },
    { log: { id: 'd-3', bookId: books[2]?.id || '3', dateFinished: '2026-11-19', rating: 4.0, liked: false, format: 'ebook', tags: ['classic'] }, book: books[2] },
    { log: { id: 'd-4', bookId: books[3]?.id || '4', dateFinished: '2026-11-15', rating: 3.5, liked: true, format: 'audiobook', tags: ['sci-fi'] }, book: books[3] },
    { log: { id: 'd-5', bookId: books[4]?.id || '5', dateFinished: '2026-11-08', rating: 4.5, liked: false, format: 'physical', tags: ['re-read'] }, book: books[4] },
    { log: { id: 'd-6', bookId: books[5]?.id || '6', dateFinished: '2026-11-02', rating: 4.0, liked: true, format: 'ebook', tags: ['fiction'] }, book: books[5] || books[0] },
  ];

  // Calendar cells generation for November 2026 (30 days, starting Sunday / Monday)
  const calendarDays = Array.from({ length: 30 }, (_, i) => {
    const dayNum = i + 1;
    const match = novemberEntries.find(entry => {
      const parts = entry.log.dateFinished.split('-');
      return parseInt(parts[2], 10) === dayNum;
    });
    return {
      day: dayNum,
      entry: match
    };
  });

  return (
    <div className="min-h-screen bg-[#14181c] text-white select-none pb-24" id="letterboxd-lists-screen">
      {/* Top Header matching Screenshot 5 */}
      <header className="px-4 pt-3 pb-2 flex items-center justify-between sticky top-0 z-30 bg-[#14181c]/95 backdrop-blur-md">
        <h1 className="text-2xl font-bold text-white tracking-tight">Lists</h1>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="p-1.5 rounded-full text-white hover:bg-[#202934] transition-colors"
          title="Create New List"
        >
          <Plus className="w-6 h-6 stroke-[2]" />
        </button>
      </header>

      {/* Segmented Pills: [ Your Lists ] [ Your Diary ] [ Discover ] */}
      <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('your-lists')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'your-lists'
              ? 'bg-[#2c3f58] text-white shadow-sm'
              : 'bg-[#1b222a] text-[#788a9e] hover:text-white'
          }`}
        >
          Your Lists
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('diary')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'diary'
              ? 'bg-[#2c3f58] text-white shadow-sm'
              : 'bg-[#1b222a] text-[#788a9e] hover:text-white'
          }`}
        >
          Your Diary
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('discover')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'discover'
              ? 'bg-[#2c3f58] text-white shadow-sm'
              : 'bg-[#1b222a] text-[#788a9e] hover:text-white'
          }`}
        >
          Discover
        </button>
      </div>

      {/* ===================== SUBTAB 1: YOUR LISTS (Screenshot 5) ===================== */}
      {activeTab === 'your-lists' && (
        <div className="space-y-6 pt-2">
          {/* Section: Your Watchlist > (3 Posters + Entry Count, tapping opens 4-col grid) */}
          <section className="space-y-2.5 px-4">
            <div 
              onClick={onOpenWatchlistGrid}
              className="flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-white group-hover:text-[#15E558] transition-colors">
                  Your Watchlist
                </span>
                <ChevronRight className="w-4 h-4 text-[#6c7f96]" />
              </div>
              <span className="text-[10px] font-mono text-[#6c7f96] uppercase tracking-wider">
                {watchlistBooks.length} Entries
              </span>
            </div>

            {/* 3 Posters Row matching Screenshot 5 */}
            <div 
              onClick={onOpenWatchlistGrid}
              className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-[#1a222c] border border-[#273545] cursor-pointer hover:border-[#40BCF4] transition-all shadow-md group"
            >
              {watchlistBooks.slice(0, 3).map((book) => (
                <div key={book.id} className="relative aspect-[2/3] rounded-md overflow-hidden bg-[#14181c] border border-black/40">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-1 right-1 p-0.5 rounded bg-black/60 text-[#40BCF4]">
                    <Bookmark className="w-3 h-3 fill-[#40BCF4]" />
                  </div>
                </div>
              ))}
              {watchlistBooks.length === 0 && (
                <div className="col-span-3 py-6 text-center text-xs text-[#6c7f96]">
                  No books in watchlist yet. Browse and tap bookmark to add.
                </div>
              )}
            </div>
          </section>

          {/* Section: Your Lists (2-Column Grid with fanned covers matching Screenshot 5) */}
          <section className="space-y-3 px-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">Your Lists</span>
              <span className="text-[10px] font-mono text-[#6c7f96] uppercase">{lists.length} Lists</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {lists.map((list) => {
                const cover1 = list.books[0]?.coverImage || books[0]?.coverImage;
                const cover2 = list.books[1]?.coverImage || books[1]?.coverImage;
                const cover3 = list.books[2]?.coverImage || books[2]?.coverImage;

                return (
                  <div
                    key={list.id}
                    onClick={() => onSelectList(list)}
                    className="p-3 rounded-xl bg-[#1a222c] border border-[#273545] hover:border-[#15E558]/80 transition-all cursor-pointer shadow-md flex flex-col group"
                  >
                    {/* Fanned 3-Cover Collage matching Screenshot 5 */}
                    <div className="relative w-full h-24 flex items-center justify-center my-1">
                      <img
                        src={cover1}
                        alt=""
                        className="absolute w-12 h-18 rounded object-cover -left-1 transform -rotate-12 shadow-lg border border-black/50 group-hover:-translate-x-1 transition-transform"
                      />
                      <img
                        src={cover2}
                        alt=""
                        className="absolute w-12 h-18 rounded object-cover -right-1 transform rotate-12 shadow-lg border border-black/50 group-hover:translate-x-1 transition-transform"
                      />
                      <img
                        src={cover3}
                        alt=""
                        className="relative z-10 w-13 h-20 rounded object-cover shadow-2xl border border-white/10 group-hover:scale-105 transition-transform"
                      />
                    </div>

                    {/* List Title & Count */}
                    <div className="mt-2 text-left">
                      <h4 className="text-xs font-bold text-white group-hover:text-[#15E558] line-clamp-1">
                        {list.title}
                      </h4>
                      <p className="text-[10px] text-[#6c7f96] mt-0.5 font-mono">
                        {list.books.length} Books
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* ===================== SUBTAB 2: YOUR DIARY (Screenshot 6) ===================== */}
      {activeTab === 'diary' && (
        <div className="space-y-4 px-4 pt-2">
          {/* Header Controls: List View vs Calendar Grid View switch matching Screenshot 6 */}
          <div className="flex items-center justify-between border-b border-[#202934] pb-2">
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Reading Diary
              </span>
              <span className="text-[10px] text-[#6c7f96] block">
                {decemberEntries.length + novemberEntries.length} Total logged books
              </span>
            </div>

            <div className="flex items-center gap-1 bg-[#1a222c] p-1 rounded-lg border border-[#273545]">
              <button
                type="button"
                onClick={() => setDiaryViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${
                  diaryViewMode === 'list' ? 'bg-[#2c3f58] text-white' : 'text-[#6c7f96] hover:text-white'
                }`}
                title="List View"
              >
                <ListIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setDiaryViewMode('calendar')}
                className={`p-1.5 rounded-md transition-colors ${
                  diaryViewMode === 'calendar' ? 'bg-[#2c3f58] text-white' : 'text-[#6c7f96] hover:text-white'
                }`}
                title="Calendar Grid View"
              >
                <CalendarIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* LIST VIEW MODE (Screenshot 6 left) */}
          {diaryViewMode === 'list' && (
            <div className="space-y-6">
              {/* December Group */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#8fa0b5] font-bold border-b border-[#202934] pb-1">
                  <span>August 2026</span>
                  <span className="text-[10px] font-mono text-[#556677]">{decemberEntries.length} Entries</span>
                </div>

                <div className="divide-y divide-[#1e2632]">
                  {decemberEntries.map(({ log, book }) => {
                    const dayNum = log.dateFinished.split('-')[2] || '18';
                    return (
                      <DiaryBookRow
                        key={log.id}
                        log={log}
                        book={book}
                        dayNum={dayNum}
                        onSelect={onSelectBook}
                        onLongPress={onLongPressBook}
                      />
                    );
                  })}
                </div>
              </div>

              {/* November Group */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#8fa0b5] font-bold border-b border-[#202934] pb-1">
                  <span>July 2026</span>
                  <span className="text-[10px] font-mono text-[#556677]">{novemberEntries.length} Entries</span>
                </div>

                <div className="divide-y divide-[#1e2632]">
                  {novemberEntries.map(({ log, book }) => {
                    if (!book) return null;
                    const dayNum = log.dateFinished.split('-')[2] || '12';
                    return (
                      <DiaryBookRow
                        key={log.id}
                        log={log}
                        book={book}
                        dayNum={dayNum}
                        onSelect={onSelectBook}
                        onLongPress={onLongPressBook}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* CALENDAR GRID VIEW MODE (Screenshot 6 right) */}
          {diaryViewMode === 'calendar' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#8fa0b5] font-bold">
                <span>July 2026</span>
                <span className="text-[10px] font-mono text-[#556677]">{novemberEntries.length} Entries</span>
              </div>

              {/* Day column headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono font-bold text-[#6c7f96]">
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
                <div>Sun</div>
              </div>

              {/* Calendar Days Matrix matching Screenshot 6 */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map(({ day, entry }) => {
                  if (entry && entry.book) {
                    return (
                      <CalendarBookCell
                        key={day}
                        day={day}
                        book={entry.book}
                        onSelect={onSelectBook}
                        onLongPress={onLongPressBook}
                      />
                    );
                  }

                  return (
                    <div
                      key={day}
                      className="aspect-[2/3] rounded bg-[#161c23] border border-[#202934] p-1 flex items-start justify-start"
                    >
                      <span className="font-mono text-[10px] text-[#455669] font-medium">{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== SUBTAB 3: DISCOVER ===================== */}
      {activeTab === 'discover' && (
        <div className="space-y-6 pt-2 px-4">
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-white">Popular Community Lists</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {lists.map((list) => (
                <div
                  key={list.id}
                  onClick={() => onSelectList(list)}
                  className="p-3 rounded-xl bg-[#1a222c] border border-[#273545] hover:border-[#15E558] transition-colors cursor-pointer flex gap-3 items-center group"
                >
                  <div className="flex -space-x-4 shrink-0">
                    {list.books.slice(0, 3).map((b, i) => (
                      <img
                        key={b.id}
                        src={b.coverImage}
                        alt=""
                        className={`w-10 h-14 rounded object-cover border border-black shadow-md z-${10 - i}`}
                      />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white group-hover:text-[#15E558] truncate">
                      {list.title}
                    </h4>
                    <p className="text-[11px] text-[#8fa0b5] line-clamp-1 mt-0.5">
                      {list.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-[#6c7f96]">
                      <span>{list.books.length} books</span>
                      <span>•</span>
                      <span>{list.likesCount} likes</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Create List Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[#161c23] border border-[#293849] rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-white">Create a New List</h3>
            
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-mono uppercase text-[#8fa0b5]">List Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. My Favorite Sci-Fi Books"
                  className="w-full p-2.5 rounded-xl bg-[#1a2330] border border-[#273545] text-white text-xs focus:outline-none focus:border-[#15E558]"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-[#8fa0b5]">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="What is this collection about?"
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-[#1a2330] border border-[#273545] text-white text-xs focus:outline-none focus:border-[#15E558] resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-[#8fa0b5] mb-1 block">Pick Books for this List</label>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {books.map(b => {
                    const isSelected = selectedBookIdsForList.includes(b.id);
                    return (
                      <div
                        key={b.id}
                        onClick={() => toggleBookForNewList(b.id)}
                        className={`relative w-16 shrink-0 aspect-[2/3] rounded overflow-hidden cursor-pointer border-2 transition-all ${
                          isSelected ? 'border-[#15E558] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={b.coverImage} alt={b.title} className="w-full h-full object-cover" />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#293849] text-xs font-semibold text-[#8fa0b5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#15E558] text-black text-xs font-bold font-mono uppercase shadow-md"
                >
                  Save List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
