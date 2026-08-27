import React, { useState, useEffect } from 'react';
import { Book, ReadingLogEntry, ReadingFormat } from '../types';
import { RatingStars } from './RatingStars';
import { X, Heart, BookOpen, Tablet, Headphones, Calendar, AlertTriangle, RefreshCw, Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LogBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  preselectedBook?: Book | null;
  onSaveLog: (entry: ReadingLogEntry, book: Book) => void;
}

export const LogBookModal: React.FC<LogBookModalProps> = ({
  isOpen,
  onClose,
  books,
  preselectedBook,
  onSaveLog
}) => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(preselectedBook || books[0] || null);
  const [rating, setRating] = useState<number>(4.0);
  const [liked, setLiked] = useState<boolean>(false);
  const [format, setFormat] = useState<ReadingFormat>('physical');
  const [dateFinished, setDateFinished] = useState<string>(new Date().toISOString().split('T')[0]);
  const [review, setReview] = useState<string>('');
  const [hasSpoilers, setHasSpoilers] = useState<boolean>(false);
  const [isReRead, setIsReRead] = useState<boolean>(false);
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>(['favorites', '2026-reads']);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSelectingBook, setIsSelectingBook] = useState<boolean>(!preselectedBook);

  useEffect(() => {
    if (preselectedBook) {
      setSelectedBook(preselectedBook);
      setIsSelectingBook(false);
    } else if (books.length > 0 && !selectedBook) {
      setSelectedBook(books[0]);
    }
  }, [preselectedBook, books]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;

    // Trigger celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#15E558', '#FF8000', '#40BCF4', '#ffffff']
    });

    const newLog: ReadingLogEntry = {
      id: `log-${Date.now()}`,
      bookId: selectedBook.id,
      dateFinished,
      rating,
      liked,
      review: review.trim() || undefined,
      hasSpoilers,
      isReRead,
      format,
      tags
    };

    onSaveLog(newLog, selectedBook);
    onClose();
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto" id="log-book-modal">
      <div className="relative w-full max-w-lg bg-[#141b24] border border-[#273648] rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232f3e] bg-[#10151c]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#15E558]" />
            <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
              {isSelectingBook ? 'Select a Book to Log' : 'Log or Review Book'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[#8fa0b5] hover:text-white hover:bg-[#232f3e]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Book Selector View */}
        {isSelectingBook ? (
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[#1a2330] border border-[#273648] text-white placeholder-[#6c7f96] text-sm focus:outline-none focus:border-[#15E558]"
              autoFocus
            />
            <div className="space-y-2">
              {filteredBooks.map((b) => (
                <div
                  key={b.id}
                  onClick={() => {
                    setSelectedBook(b);
                    setIsSelectingBook(false);
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-[#222e3d] bg-[#18212c] hover:border-[#15E558] hover:bg-[#1f2b3a] cursor-pointer transition-all"
                >
                  <img src={b.coverImage} alt={b.title} className="w-10 h-14 object-cover rounded shadow" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{b.title}</h4>
                    <p className="text-xs text-[#8fa0b5] truncate">{b.author} ({b.year})</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Main Logging Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Selected Book Header banner */}
            {selectedBook && (
              <div className="flex items-center gap-4 p-3 rounded-xl bg-[#1a2330] border border-[#273648]">
                <img
                  src={selectedBook.coverImage}
                  alt={selectedBook.title}
                  className="w-12 h-16 object-cover rounded-md shadow-md border border-[#334459]"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">{selectedBook.title}</h3>
                  <p className="text-xs text-[#8fa0b5]">{selectedBook.author} • {selectedBook.year}</p>
                  <button
                    type="button"
                    onClick={() => setIsSelectingBook(true)}
                    className="text-[11px] text-[#40BCF4] hover:underline font-medium mt-1"
                  >
                    Change book
                  </button>
                </div>
              </div>
            )}

            {/* Star Rating & Like Heart */}
            <div className="p-4 rounded-xl bg-[#18212d] border border-[#233142] flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-[#8fa0b5] uppercase block mb-1.5">Rating</span>
                <RatingStars
                  rating={rating}
                  size="lg"
                  interactive={true}
                  onRatingChange={(newVal) => setRating(newVal)}
                  showNumber={true}
                />
              </div>

              <div className="border-l border-[#2d3e52] pl-4 flex flex-col items-center">
                <span className="text-xs font-mono font-bold text-[#8fa0b5] uppercase block mb-1.5">Like</span>
                <button
                  type="button"
                  onClick={() => setLiked(!liked)}
                  className={`p-2.5 rounded-full transition-all ${
                    liked 
                      ? 'bg-[#FF8000]/20 text-[#FF8000] scale-110' 
                      : 'bg-[#222e3d] text-[#6c7f96] hover:text-white'
                  }`}
                  title="Like this book"
                >
                  <Heart className={`w-5 h-5 ${liked ? 'fill-[#FF8000]' : ''}`} />
                </button>
              </div>
            </div>

            {/* Reading Format Selector */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#8fa0b5] uppercase tracking-wider mb-2">
                Reading Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFormat('physical')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                    format === 'physical'
                      ? 'border-[#15E558] bg-[#15E558]/10 text-white'
                      : 'border-[#273648] bg-[#1a2330] text-[#8fa0b5] hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Physical
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('ebook')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                    format === 'ebook'
                      ? 'border-[#40BCF4] bg-[#40BCF4]/10 text-white'
                      : 'border-[#273648] bg-[#1a2330] text-[#8fa0b5] hover:text-white'
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                  E-Reader
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('audiobook')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                    format === 'audiobook'
                      ? 'border-[#FF8000] bg-[#FF8000]/10 text-white'
                      : 'border-[#273648] bg-[#1a2330] text-[#8fa0b5] hover:text-white'
                  }`}
                >
                  <Headphones className="w-3.5 h-3.5" />
                  Audiobook
                </button>
              </div>
            </div>

            {/* Date Finished */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#8fa0b5] uppercase tracking-wider mb-1.5">
                Date Finished
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dateFinished}
                  onChange={(e) => setDateFinished(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#1a2330] border border-[#273648] text-white text-xs font-mono focus:outline-none focus:border-[#15E558]"
                />
                <Calendar className="w-4 h-4 text-[#8fa0b5] absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Review textarea */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#8fa0b5] uppercase tracking-wider mb-1.5">
                Review (Optional)
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your thoughts, favorite quotes, or critical reflections..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#1a2330] border border-[#273648] text-white placeholder-[#6c7f96] text-xs focus:outline-none focus:border-[#15E558] resize-none"
              />
            </div>

            {/* Options Checkboxes */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-[#a5b6c9] hover:text-white">
                <input
                  type="checkbox"
                  checked={hasSpoilers}
                  onChange={(e) => setHasSpoilers(e.target.checked)}
                  className="rounded border-[#34465c] bg-[#1a2330] text-[#15E558] focus:ring-0"
                />
                <AlertTriangle className="w-3.5 h-3.5 text-[#FF8000]" />
                Contains Spoilers
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-[#a5b6c9] hover:text-white">
                <input
                  type="checkbox"
                  checked={isReRead}
                  onChange={(e) => setIsReRead(e.target.checked)}
                  className="rounded border-[#34465c] bg-[#1a2330] text-[#15E558] focus:ring-0"
                />
                <RefreshCw className="w-3.5 h-3.5 text-[#40BCF4]" />
                Re-read
              </label>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#8fa0b5] uppercase tracking-wider mb-1.5">
                Tags
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-[#222e3d] text-[#40BCF4] border border-[#2e3f53]"
                  >
                    #{t}
                    <button type="button" onClick={() => handleRemoveTag(t)}>
                      <X className="w-3 h-3 hover:text-white" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add custom tag (e.g. cozy-vibes)..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#1a2330] border border-[#273648] text-white text-xs placeholder-[#6c7f96] focus:outline-none focus:border-[#15E558]"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-1.5 rounded-lg bg-[#243344] text-xs font-semibold text-white hover:bg-[#31445b]"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-[#232f3e] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-[#2a3848] text-xs font-bold text-[#8fa0b5] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-[#15E558] hover:bg-[#1cf363] text-black text-xs font-bold font-mono uppercase tracking-wider transition-all shadow-[0_2px_12px_rgba(21,229,88,0.3)] flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                Save Entry
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
