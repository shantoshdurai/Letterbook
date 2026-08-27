import React from 'react';
import { Book } from '../types';
import { RatingStars } from './RatingStars';
import { Bookmark, Check, Heart } from 'lucide-react';
import { useLongPress } from '../hooks/useLongPress';

interface BookCoverCardProps {
  book: Book;
  size?: 'sm' | 'md' | 'lg' | 'shelf';
  showRating?: boolean;
  showTitle?: boolean;
  isWatchlisted?: boolean;
  isRead?: boolean;
  isLiked?: boolean;
  onSelect: (book: Book) => void;
  onLongPress?: (book: Book) => void;
  onToggleWatchlist?: (book: Book, e: React.MouseEvent) => void;
  rank?: number;
}

export const BookCoverCard: React.FC<BookCoverCardProps> = ({
  book,
  size = 'md',
  showRating = false,
  showTitle = true,
  isWatchlisted = false,
  isRead = false,
  isLiked = false,
  onSelect,
  onLongPress,
  onToggleWatchlist,
  rank
}) => {
  const longPressProps = useLongPress({
    onLongPress: () => {
      if (onLongPress) {
        onLongPress(book);
      }
    },
    onClick: () => onSelect(book),
    threshold: 380,
  });

  const sizeClasses = {
    sm: 'w-20 min-w-20',
    md: 'w-28 min-w-28 sm:w-32 sm:min-w-32',
    lg: 'w-36 min-w-36 sm:w-44 sm:min-w-44',
    shelf: 'w-24 min-w-24'
  };

  const heightClasses = {
    sm: 'h-28',
    md: 'h-40 sm:h-48',
    lg: 'h-52 sm:h-64',
    shelf: 'h-36'
  };

  return (
    <div 
      className={`group relative flex flex-col cursor-pointer select-none transition-all duration-200 active:scale-95 ${sizeClasses[size]}`}
      {...longPressProps}
      id={`book-card-${book.id}`}
    >
      {/* Cover Poster with spine shadow effect */}
      <div className={`relative overflow-hidden rounded-md border border-[#273444] bg-[#1a2330] book-shadow group-hover:border-[#15E558]/80 group-hover:shadow-[0_0_15px_rgba(21,229,88,0.2)] transition-all ${heightClasses[size]}`}>
        <img
          src={book.coverImage}
          alt={book.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Spine lighting effect (left edge gradient) */}
        <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/40 via-white/10 to-transparent pointer-events-none" />

        {/* Top Rank Badge */}
        {typeof rank === 'number' && (
          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-mono font-bold text-[#15E558] border border-[#15E558]/30">
            #{rank}
          </div>
        )}

        {/* Status badges indicator on cover */}
        <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 items-end">
          {isRead && (
            <div className="p-1 rounded-full bg-[#15E558] text-black shadow-md">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
          )}
          {isLiked && (
            <div className="p-1 rounded-full bg-[#FF8000] text-white shadow-md">
              <Heart className="w-2.5 h-2.5 fill-white" />
            </div>
          )}
        </div>

        {/* Quick Watchlist Bookmark Button */}
        {onToggleWatchlist && (
          <button
            type="button"
            onClick={(e) => onToggleWatchlist(book, e)}
            title={isWatchlisted ? 'Remove from To-Be-Read' : 'Add to To-Be-Read'}
            className={`absolute bottom-1.5 right-1.5 p-1.5 rounded-md backdrop-blur-md transition-all ${
              isWatchlisted 
                ? 'bg-[#40BCF4] text-black shadow-md' 
                : 'bg-black/60 text-white hover:bg-[#15E558] hover:text-black opacity-0 group-hover:opacity-100'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isWatchlisted ? 'fill-black' : ''}`} />
          </button>
        )}
      </div>

      {/* Title & Metadata */}
      {showTitle && (
        <div className="mt-1.5">
          <h4 className="text-xs font-semibold text-white truncate leading-tight group-hover:text-[#15E558] transition-colors">
            {book.title}
          </h4>
          <p className="text-[11px] text-[#8fa0b5] truncate mt-0.5">
            {book.author}
          </p>

          {showRating && (
            <div className="mt-1 flex items-center justify-between">
              <RatingStars rating={book.averageRating} size="xs" />
              <span className="text-[10px] font-mono text-[#6c7f96]">
                {book.averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
