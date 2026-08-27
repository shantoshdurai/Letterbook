import React, { useState } from 'react';
import { Book, BookList } from '../types';
import { 
  Bookmark, Plus, List as ListIcon, Edit3, Image as ImageIcon, 
  Share2, Check
} from 'lucide-react';

interface BookQuickMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
  isWatchlisted: boolean;
  userRating?: number;
  isLiked?: boolean;
  lists: BookList[];
  onToggleWatchlist: (book: Book) => void;
  onQuickRate: (book: Book, rating: number) => void;
  onAddToDiary: (book: Book) => void;
  onWriteReview: (book: Book) => void;
  onAddToList: (book: Book, listId: string) => void;
  onChangeCover: (book: Book, newCoverUrl: string) => void;
  onShare: (book: Book) => void;
  onShowToast: (msg: string) => void;
}

// Alternate edition cover mock options for "Change Poster / Cover"
const ALTERNATE_COVERS: Record<string, string[]> = {
  default: [
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&auto=format&fit=crop&q=80',
  ]
};

export const BookQuickMenuModal: React.FC<BookQuickMenuModalProps> = ({
  isOpen,
  onClose,
  book,
  isWatchlisted,
  userRating = 0,
  lists,
  onToggleWatchlist,
  onQuickRate,
  onAddToDiary,
  onWriteReview,
  onAddToList,
  onChangeCover,
  onShare,
  onShowToast,
}) => {
  const [selectedRating, setSelectedRating] = useState<number>(userRating);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [showListPicker, setShowListPicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);

  if (!isOpen || !book) return null;

  const currentDisplayRating = hoverRating !== null ? hoverRating : (selectedRating || userRating || 0);

  const handleRateClick = (rating: number) => {
    setSelectedRating(rating);
    onQuickRate(book, rating);
    onShowToast(`Rated "${book.title}" ${rating} stars ★`);
  };

  const handleListToggle = (listId: string, listTitle: string) => {
    onAddToList(book, listId);
    onShowToast(`Updated list "${listTitle}"`);
    setShowListPicker(false);
    onClose();
  };

  const handleSelectCover = (coverUrl: string) => {
    onChangeCover(book, coverUrl);
    onShowToast(`Updated poster cover for "${book.title}"`);
    setShowCoverPicker(false);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
      id="book-quick-menu-backdrop"
    >
      <div 
        className="w-full max-w-sm sm:max-w-md bg-[#18212b] border border-[#273646] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slideUp text-white"
        onClick={(e) => e.stopPropagation()}
        id="book-quick-menu-modal"
      >
        {/* Drag / Bottom Sheet Pill handle on mobile */}
        <div className="w-12 h-1 bg-[#37495d] rounded-full mx-auto mt-2.5 mb-1 sm:hidden" />

        {/* Header: Poster + Title/Meta + Star Rating + Watchlist Bookmark */}
        <div className="p-4 bg-[#141b24] border-b border-[#233140] flex items-center gap-3 relative">
          {/* Book Poster Thumbnail */}
          <div className="w-14 h-20 shrink-0 rounded-md overflow-hidden bg-[#10151c] border border-[#2b3d52] shadow-lg">
            <img 
              src={book.coverImage} 
              alt={book.title} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Book Info & Rating Stars */}
          <div className="flex-1 min-w-0 pr-8">
            <h3 className="text-sm font-bold text-white truncate">{book.title}</h3>
            <p className="text-[11px] text-[#798da3] mt-0.5">
              {book.year} • {book.pageCount} pp {book.audioLength ? `• ${book.audioLength}` : ''}
            </p>

            {/* Quick Star Rating Bar matching Step 2 in screenshot */}
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = currentDisplayRating >= star;
                const isHalf = currentDisplayRating === star - 0.5;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => handleRateClick(star)}
                    className="p-0.5 text-lg transition-transform hover:scale-125 focus:outline-none"
                    title={`Rate ${star} Stars`}
                  >
                    <span className={isFilled || isHalf ? 'text-[#00E054]' : 'text-[#354659]'}>
                      ★
                    </span>
                  </button>
                );
              })}
              {selectedRating > 0 && (
                <span className="text-[10px] font-mono text-[#00E054] ml-1 font-bold">
                  {selectedRating.toFixed(1)}
                </span>
              )}
            </div>
          </div>

          {/* Watchlist Bookmark Icon in Top Right (Screenshot matching) */}
          <button
            type="button"
            onClick={() => onToggleWatchlist(book)}
            title={isWatchlisted ? 'In Watchlist' : 'Add to Watchlist'}
            className={`absolute top-4 right-4 p-2 rounded-lg transition-all ${
              isWatchlisted 
                ? 'bg-[#40BCF4] text-black shadow-md' 
                : 'bg-[#202c3a] text-[#8fa0b5] hover:text-[#00E054] hover:bg-[#28384b]'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isWatchlisted ? 'fill-black' : ''}`} />
          </button>
        </div>

        {/* Sub-view 1: List Picker Drawer */}
        {showListPicker && (
          <div className="p-4 bg-[#141a22] border-b border-[#233140] space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <ListIcon className="w-3.5 h-3.5 text-[#00E054]" /> Add to List
              </span>
              <button 
                type="button" 
                onClick={() => setShowListPicker(false)}
                className="text-[11px] text-[#6c7f96] hover:text-white"
              >
                Cancel
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
              {lists.map((lst) => {
                const inList = lst.books.some(b => b.id === book.id);
                return (
                  <button
                    key={lst.id}
                    type="button"
                    onClick={() => handleListToggle(lst.id, lst.title)}
                    className="w-full px-3 py-2 rounded-lg bg-[#1c2734] hover:bg-[#253446] flex items-center justify-between text-left text-xs text-[#cbd6e2] transition-colors"
                  >
                    <span className="truncate">{lst.title}</span>
                    {inList && <Check className="w-3.5 h-3.5 text-[#00E054]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Sub-view 2: Cover / Poster Picker Drawer */}
        {showCoverPicker && (
          <div className="p-4 bg-[#141a22] border-b border-[#233140] space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#00E054]" /> Choose Alternative Edition
              </span>
              <button 
                type="button" 
                onClick={() => setShowCoverPicker(false)}
                className="text-[11px] text-[#6c7f96] hover:text-white"
              >
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {ALTERNATE_COVERS.default.map((cUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectCover(cUrl)}
                  className="aspect-[2/3] rounded-md overflow-hidden border-2 border-transparent hover:border-[#00E054] cursor-pointer bg-black/40 transition-all hover:scale-105"
                >
                  <img src={cUrl} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Items List (Exact copy of Step 2 in reference image) */}
        <div className="py-2 divide-y divide-[#202c3a]/50 text-sm">
          {/* + Add to Diary */}
          <button
            type="button"
            onClick={() => {
              onAddToDiary(book);
              onClose();
            }}
            className="w-full px-5 py-3 flex items-center gap-3.5 text-left text-[#d2deeb] hover:bg-[#202c3a] hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4 text-[#00E054]" />
            <span className="font-medium text-xs sm:text-sm">Add to Diary</span>
          </button>

          {/* Add to List */}
          <button
            type="button"
            onClick={() => {
              setShowListPicker(!showListPicker);
              setShowCoverPicker(false);
            }}
            className="w-full px-5 py-3 flex items-center gap-3.5 text-left text-[#d2deeb] hover:bg-[#202c3a] hover:text-white transition-colors"
          >
            <ListIcon className="w-4 h-4 text-[#40BCF4]" />
            <span className="font-medium text-xs sm:text-sm">Add to List</span>
          </button>

          {/* Write a Review */}
          <button
            type="button"
            onClick={() => {
              onWriteReview(book);
              onClose();
            }}
            className="w-full px-5 py-3 flex items-center gap-3.5 text-left text-[#d2deeb] hover:bg-[#202c3a] hover:text-white transition-colors"
          >
            <Edit3 className="w-4 h-4 text-[#FF8000]" />
            <span className="font-medium text-xs sm:text-sm">Write a Review</span>
          </button>

          {/* Change Poster */}
          <button
            type="button"
            onClick={() => {
              setShowCoverPicker(!showCoverPicker);
              setShowListPicker(false);
            }}
            className="w-full px-5 py-3 flex items-center gap-3.5 text-left text-[#d2deeb] hover:bg-[#202c3a] hover:text-white transition-colors"
          >
            <ImageIcon className="w-4 h-4 text-[#a8b8cc]" />
            <span className="font-medium text-xs sm:text-sm">Change Poster</span>
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={() => {
              onShare(book);
              onClose();
            }}
            className="w-full px-5 py-3 flex items-center gap-3.5 text-left text-[#d2deeb] hover:bg-[#202c3a] hover:text-white transition-colors"
          >
            <Share2 className="w-4 h-4 text-[#a8b8cc]" />
            <span className="font-medium text-xs sm:text-sm">Share</span>
          </button>
        </div>

        {/* Bottom Cancel Close Button */}
        <div className="p-3 bg-[#121820] border-t border-[#202d3d]">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#1c2734] hover:bg-[#253446] text-xs font-semibold text-[#8fa0b5] hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
