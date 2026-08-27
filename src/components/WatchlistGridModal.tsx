import React, { useState } from 'react';
import { Book } from '../types';
import { ArrowLeft, SlidersHorizontal, Bookmark, Search } from 'lucide-react';
import { useLongPress } from '../hooks/useLongPress';

interface WatchlistGridModalProps {
  isOpen: boolean;
  onClose: () => void;
  watchlistBooks: Book[];
  onSelectBook: (book: Book) => void;
  onLongPressBook?: (book: Book) => void;
  onToggleWatchlist: (book: Book, e: React.MouseEvent) => void;
  onOpenFilter: () => void;
}

const WatchlistGridItem: React.FC<{
  book: Book;
  onSelect: (book: Book) => void;
  onLongPress?: (book: Book) => void;
  onToggleWatchlist: (book: Book, e: React.MouseEvent) => void;
}> = ({ book, onSelect, onLongPress, onToggleWatchlist }) => {
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
        loading="lazy"
      />

      {/* Subtle spine gradient */}
      <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-r from-black/50 to-transparent pointer-events-none" />

      {/* Top Right Bookmark indicator */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleWatchlist(book, e);
        }}
        className="absolute top-1 right-1 p-1 rounded bg-black/60 backdrop-blur-sm text-[#40BCF4] hover:text-[#15E558] transition-colors z-10"
        title="Remove from watchlist"
      >
        <Bookmark className="w-3 h-3 fill-[#40BCF4]" />
      </button>

      {/* Bottom title tooltip on hover */}
      <div className="absolute inset-x-0 bottom-0 p-1 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <p className="text-[9px] font-bold text-white truncate leading-tight">{book.title}</p>
      </div>
    </div>
  );
};

export const WatchlistGridModal: React.FC<WatchlistGridModalProps> = ({
  isOpen,
  onClose,
  watchlistBooks,
  onSelectBook,
  onLongPressBook,
  onToggleWatchlist,
  onOpenFilter
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredBooks = watchlistBooks.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#14181c] text-white flex flex-col animate-fadeIn select-none overflow-hidden" id="watchlist-grid-screen">
      {/* Top Header matching Screenshot 5 */}
      <header className="px-4 py-3 border-b border-[#242f3d] bg-[#14181c]/95 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[#8fa0b5] hover:text-white hover:bg-[#1f2834] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">Your Watchlist</h1>
            <span className="text-[10px] font-mono text-[#6c7f96] uppercase tracking-wider block">
              {watchlistBooks.length} Entries
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenFilter}
            className="p-1.5 rounded-full text-[#8fa0b5] hover:text-white hover:bg-[#1f2834] transition-colors"
            title="Filter watchlist"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Quick Search Input */}
      <div className="px-4 py-2 bg-[#12161a] border-b border-[#1e2733]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#6c7f96] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search within watchlist..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#182028] border border-[#273545] text-xs text-white placeholder-[#6c7f96] focus:outline-none focus:border-[#15E558]"
          />
        </div>
      </div>

      {/* 4-Column Poster Grid matching Screenshot 5 */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-3">
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-2">
            {filteredBooks.map((book) => (
              <WatchlistGridItem
                key={book.id}
                book={book}
                onSelect={onSelectBook}
                onLongPress={onLongPressBook}
                onToggleWatchlist={onToggleWatchlist}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-[#6c7f96] space-y-2">
            <Bookmark className="w-8 h-8 text-[#40BCF4] mx-auto opacity-50" />
            <p>Your watchlist is currently empty or no titles matched your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};
