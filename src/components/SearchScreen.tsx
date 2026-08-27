import React, { useState } from 'react';
import { Book } from '../types';
import { FilterState } from './FilterModal';
import { Search, SlidersHorizontal, Bookmark, ChevronRight, X } from 'lucide-react';
import { useLongPress } from '../hooks/useLongPress';

interface SearchScreenProps {
  books: Book[];
  watchlistBookIds: string[];
  readBookIds?: string[];
  likedBookIds?: string[];
  filters?: FilterState;
  onSelectBook: (book: Book) => void;
  onLongPressBook?: (book: Book) => void;
  onToggleWatchlist: (book: Book, e: React.MouseEvent) => void;
  onOpenFilterModal: () => void;
  availableGenres?: string[];
  onQuickGenreSelect: (genre: string) => void;
}

const SearchBookPoster: React.FC<{
  book: Book;
  isWatchlisted: boolean;
  onSelect: (book: Book) => void;
  onLongPress?: (book: Book) => void;
  onToggleWatchlist: (book: Book, e: React.MouseEvent) => void;
  showTitle?: boolean;
}> = ({ book, isWatchlisted, onSelect, onLongPress, onToggleWatchlist, showTitle }) => {
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
      <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-r from-black/50 to-transparent pointer-events-none" />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleWatchlist(book, e);
        }}
        className={`absolute top-1 right-1 p-1 rounded backdrop-blur-md z-10 ${
          isWatchlisted ? 'bg-[#40BCF4] text-black' : 'bg-black/60 text-white hover:text-[#15E558]'
        }`}
      >
        <Bookmark className={`w-3 h-3 ${isWatchlisted ? 'fill-black' : ''}`} />
      </button>

      {showTitle && (
        <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none">
          <p className="text-[10px] font-bold text-white truncate">{book.title}</p>
          <p className="text-[9px] text-[#8fa0b5] truncate">{book.author}</p>
        </div>
      )}
    </div>
  );
};

export const SearchScreen: React.FC<SearchScreenProps> = ({
  books,
  watchlistBookIds,
  onSelectBook,
  onLongPressBook,
  onToggleWatchlist,
  onOpenFilterModal,
  onQuickGenreSelect,
}) => {
  const [query, setQuery] = useState('');

  // Sample Recently Searched Books (matching Screenshot 4)
  const recentlySearched = [books[0], books[1], books[4]];

  // Discover genres definition with cover trios matching Screenshot 4
  const genreCards = [
    {
      name: 'Sci-Fi',
      covers: [
        books[0]?.coverImage || 'https://images.unsplash.com/photo-1532012164546-f432f2e3dd45?w=300',
        books[4]?.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300',
        books[1]?.coverImage || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300',
      ]
    },
    {
      name: 'Dark Academia',
      covers: [
        books[2]?.coverImage || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300',
        books[5]?.coverImage || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300',
        books[0]?.coverImage || 'https://images.unsplash.com/photo-1532012164546-f432f2e3dd45?w=300',
      ]
    },
    {
      name: 'Literary Fiction',
      covers: [
        books[1]?.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300',
        books[3]?.coverImage || 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300',
        books[6]?.coverImage || 'https://images.unsplash.com/photo-1532012164546-f432f2e3dd45?w=300',
      ]
    },
    {
      name: 'Fantasy',
      covers: [
        books[4]?.coverImage || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300',
        books[0]?.coverImage || 'https://images.unsplash.com/photo-1532012164546-f432f2e3dd45?w=300',
        books[2]?.coverImage || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300',
      ]
    },
    {
      name: 'Satire & Comedy',
      covers: [
        books[3]?.coverImage || 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300',
        books[1]?.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300',
        books[2]?.coverImage || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300',
      ]
    },
    {
      name: 'Mystery & Thriller',
      covers: [
        books[2]?.coverImage || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300',
        books[4]?.coverImage || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300',
        books[5]?.coverImage || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300',
      ]
    },
    {
      name: 'Romance',
      covers: [
        books[1]?.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300',
        books[6]?.coverImage || 'https://images.unsplash.com/photo-1532012164546-f432f2e3dd45?w=300',
        books[3]?.coverImage || 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300',
      ]
    },
    {
      name: 'Non-Fiction',
      covers: [
        books[5]?.coverImage || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300',
        books[0]?.coverImage || 'https://images.unsplash.com/photo-1532012164546-f432f2e3dd45?w=300',
        books[1]?.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300',
      ]
    }
  ];

  // Filtering for active query
  const filteredBooks = books.filter((book) => {
    if (query.trim()) {
      const q = query.toLowerCase();
      const matchTitle = book.title.toLowerCase().includes(q);
      const matchAuthor = book.author.toLowerCase().includes(q);
      const matchGenre = book.genres.some(g => g.toLowerCase().includes(q));
      if (!matchTitle && !matchAuthor && !matchGenre) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#14181c] text-white select-none pb-24" id="letterboxd-search-screen">
      {/* Top Header matching Screenshot 4 */}
      <header className="px-4 py-3 flex items-center justify-between sticky top-0 z-30 bg-[#14181c]/95 backdrop-blur-md border-b border-[#202934]">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-white tracking-tight">Search</h1>
        </div>

        <button
          type="button"
          onClick={onOpenFilterModal}
          className="p-1.5 rounded-full text-[#8fa0b5] hover:text-white hover:bg-[#202934] transition-colors"
          title="Filter search"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </header>

      {/* Search Input Bar matching Screenshot 4 */}
      <div className="px-4 pt-3 pb-2">
        <div className="relative">
          <Search className="w-4 h-4 text-[#748393] absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for books, genres, members and more"
            className="w-full pl-10 pr-9 py-2.5 rounded-full bg-[#242e3a] border border-[#313e4e] text-xs text-white placeholder-[#748393] focus:outline-none focus:border-[#15E558] transition-colors shadow-inner"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-2.5 p-0.5 rounded-full bg-[#313e4e] text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Query Search Results View */}
      {query.trim().length > 0 ? (
        <div className="px-4 py-3 space-y-3">
          <div className="flex items-center justify-between text-xs text-[#8fa0b5]">
            <span>{filteredBooks.length} results for "{query}"</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {filteredBooks.map((book) => (
              <SearchBookPoster
                key={book.id}
                book={book}
                isWatchlisted={watchlistBookIds.includes(book.id)}
                onSelect={onSelectBook}
                onLongPress={onLongPressBook}
                onToggleWatchlist={onToggleWatchlist}
                showTitle={true}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Default Search Screen matching Screenshot 4 */
        <div className="space-y-6 pt-2">
          {/* Section: Recently Searched Books > */}
          <section className="space-y-2.5">
            <div className="px-4 flex items-center justify-between">
              <span className="text-sm font-bold text-white">Recently Searched Books</span>
              <ChevronRight className="w-4 h-4 text-[#6c7f96]" />
            </div>

            <div className="flex gap-2.5 overflow-x-auto px-4 pb-1 no-scrollbar">
              {recentlySearched.map((book) => {
                if (!book) return null;
                return (
                  <div key={book.id} className="w-28 shrink-0">
                    <SearchBookPoster
                      book={book}
                      isWatchlisted={watchlistBookIds.includes(book.id)}
                      onSelect={onSelectBook}
                      onLongPress={onLongPressBook}
                      onToggleWatchlist={onToggleWatchlist}
                      showTitle={false}
                    />
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section: Discover Genres > (2-Column Grid with fanned covers matching Screenshot 4) */}
          <section className="space-y-3 px-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">Discover Genres</span>
              <ChevronRight className="w-4 h-4 text-[#6c7f96]" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {genreCards.map((genre) => (
                <div
                  key={genre.name}
                  onClick={() => onQuickGenreSelect(genre.name)}
                  className="p-3 rounded-xl bg-[#1a222c] border border-[#273545] hover:border-[#15E558]/80 transition-all cursor-pointer shadow-md flex flex-col items-center group"
                >
                  {/* Fanned 3-Book Covers Effect matching Screenshot 4 */}
                  <div className="relative w-28 h-20 flex items-center justify-center my-1">
                    {/* Left angled cover */}
                    <img
                      src={genre.covers[0]}
                      alt=""
                      className="absolute w-11 h-16 rounded object-cover -left-1 transform -rotate-12 shadow-lg border border-black/40 group-hover:-translate-x-1 transition-transform"
                    />
                    {/* Right angled cover */}
                    <img
                      src={genre.covers[1]}
                      alt=""
                      className="absolute w-11 h-16 rounded object-cover -right-1 transform rotate-12 shadow-lg border border-black/40 group-hover:translate-x-1 transition-transform"
                    />
                    {/* Center front cover */}
                    <img
                      src={genre.covers[2]}
                      alt=""
                      className="relative z-10 w-12 h-18 rounded object-cover shadow-2xl border border-white/10 group-hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Genre Title */}
                  <span className="text-xs font-bold text-white group-hover:text-[#15E558] mt-2 transition-colors">
                    {genre.name}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
