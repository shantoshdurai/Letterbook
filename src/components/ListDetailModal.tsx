import React from 'react';
import { BookList, Book } from '../types';
import { BookCoverCard } from './BookCoverCard';
import { X, Heart } from 'lucide-react';

interface ListDetailModalProps {
  list: BookList | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectBook: (book: Book) => void;
  onLongPressBook?: (book: Book) => void;
  onToggleWatchlist: (book: Book, e: React.MouseEvent) => void;
  watchlistBookIds: string[];
  readBookIds: string[];
  likedBookIds: string[];
  onToggleLikeList: (listId: string) => void;
  isLiked?: boolean;
}

export const ListDetailModal: React.FC<ListDetailModalProps> = ({
  list,
  isOpen,
  onClose,
  onSelectBook,
  onLongPressBook,
  onToggleWatchlist,
  watchlistBookIds,
  readBookIds,
  likedBookIds,
  onToggleLikeList,
  isLiked = false
}) => {
  if (!isOpen || !list) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/90 backdrop-blur-md overflow-y-auto" id="list-detail-modal">
      <div className="relative w-full max-w-2xl bg-[#121820] border-x border-b border-[#232f3e] min-h-screen pb-24 text-white shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-[#232f3e] bg-[#151d27] space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-mono text-[#8fa0b5] hover:text-white"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-[#8fa0b5] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#15E558]/20 text-[#15E558] font-bold">
                {list.isRanked ? 'Ranked List' : 'Curated Collection'}
              </span>
              <span className="text-xs text-[#6c7f96]">• {list.books.length} Books</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">{list.title}</h1>
            <p className="text-xs text-[#9eb0c3] mt-2 leading-relaxed">{list.description}</p>
          </div>

          {/* Creator Profile line */}
          <div className="flex items-center justify-between pt-2 border-t border-[#232f3e]">
            <div className="flex items-center gap-2">
              <img
                src={list.creatorAvatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"}
                alt={list.creatorName || "Curator"}
                className="w-7 h-7 rounded-full object-cover border border-[#37495e]"
              />
              <div>
                <span className="text-xs font-semibold text-white">{list.creatorName || "Curator"}</span>
                <span className="text-[10px] text-[#6c7f96] block">Updated {list.updatedAt}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => onToggleLikeList(list.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                  isLiked
                    ? 'border-[#FF8000] bg-[#FF8000]/10 text-[#FF8000]'
                    : 'border-[#293849] text-[#8fa0b5] hover:text-white'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#FF8000]' : ''}`} />
                <span className="font-mono text-xs">{list.likesCount + (isLiked ? 1 : 0)}</span>
              </button>
            </div>
          </div>
        </div>

        {/* List Books Grid */}
        <div className="p-6">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            {list.books.map((book, index) => (
              <BookCoverCard
                key={book.id}
                book={book}
                size="md"
                showRating={true}
                rank={list.isRanked ? index + 1 : undefined}
                isWatchlisted={watchlistBookIds.includes(book.id)}
                isRead={readBookIds.includes(book.id)}
                isLiked={likedBookIds.includes(book.id)}
                onSelect={onSelectBook}
                onLongPress={onLongPressBook}
                onToggleWatchlist={onToggleWatchlist}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
