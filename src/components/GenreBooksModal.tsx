import React from 'react';
import { Book } from '../types';
import { ArrowLeft, SlidersHorizontal, Bookmark } from 'lucide-react';
import { useLongPress } from '../hooks/useLongPress';

interface GenreBooksModalProps {
  isOpen: boolean;
  onClose: () => void;
  genre: string;
  books: Book[];
  watchlistBookIds: string[];
  onSelectBook: (book: Book) => void;
  onLongPressBook?: (book: Book) => void;
  onToggleWatchlist: (book: Book, e: React.MouseEvent) => void;
  onOpenFilter: () => void;
}

const GenreBookItem: React.FC<{
  book: Book;
  isWatchlisted: boolean;
  onSelect: (book: Book) => void;
  onLongPress?: (book: Book) => void;
  onToggleWatchlist: (book: Book, e: React.MouseEvent) => void;
}> = ({ book, isWatchlisted, onSelect, onLongPress, onToggleWatchlist }) => {
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

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleWatchlist(book, e);
        }}
        className={`absolute top-1 right-1 p-1 rounded backdrop-blur-sm transition-colors z-10 ${
          isWatchlisted ? 'bg-[#40BCF4] text-black' : 'bg-black/60 text-white hover:text-[#15E558]'
        }`}
      >
        <Bookmark className={`w-3 h-3 ${isWatchlisted ? 'fill-black' : ''}`} />
      </button>

      <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none">
        <p className="text-[10px] font-bold text-white truncate">{book.title}</p>
        <p className="text-[9px] text-[#8fa0b5] truncate">{book.author}</p>
      </div>
    </div>
  );
};

export const GenreBooksModal: React.FC<GenreBooksModalProps> = ({
  isOpen,
  onClose,
  genre,
  books,
  watchlistBookIds,
  onSelectBook,
  onLongPressBook,
  onToggleWatchlist,
  onOpenFilter,
}) => {
  if (!isOpen) return null;

  const genreBooks = books.filter(b => 
    b.genres.some(g => g.toLowerCase() === genre.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#14181c] text-white flex flex-col animate-fadeIn select-none overflow-hidden" id="genre-books-screen">
      {/* Header */}
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
            <h1 className="text-base font-bold text-white tracking-tight">{genre}</h1>
            <span className="text-[10px] font-mono text-[#6c7f96] uppercase tracking-wider block">
              {genreBooks.length} Books
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenFilter}
          className="p-1.5 rounded-full text-[#8fa0b5] hover:text-white hover:bg-[#1f2834] transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </header>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-3">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {genreBooks.map((book) => (
            <GenreBookItem
              key={book.id}
              book={book}
              isWatchlisted={watchlistBookIds.includes(book.id)}
              onSelect={onSelectBook}
              onLongPress={onLongPressBook}
              onToggleWatchlist={onToggleWatchlist}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
