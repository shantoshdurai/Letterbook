import React, { useState } from 'react';
import { Book, Review } from '../types';
import { RatingStars } from './RatingStars';
import { 
  X, Eye, Heart, BookMarked, Plus, Share2, 
  ExternalLink, MessageSquare, Camera,
  Quote, AlertCircle 
} from 'lucide-react';

interface BookDetailModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  reviews: Review[];
  isRead: boolean;
  isLiked: boolean;
  isWatchlisted: boolean;
  userRating?: number;
  onToggleRead: (book: Book) => void;
  onToggleLike: (book: Book) => void;
  onToggleWatchlist: (book: Book) => void;
  onOpenLogModal: (book: Book) => void;
  onLikeReview: (reviewId: string) => void;
  onOpenInstagramShare?: (book: Book, review?: Review) => void;
  onSelectAuthor?: (authorId: string) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  isOpen,
  onClose,
  reviews,
  isRead,
  isLiked,
  isWatchlisted,
  onToggleRead,
  onToggleLike,
  onToggleWatchlist,
  onOpenLogModal,
  onLikeReview,
  onOpenInstagramShare,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'reviews' | 'details' | 'quotes'>('reviews');
  const [reviewFilter, setReviewFilter] = useState<'popular' | 'recent'>('popular');
  const [unmaskedSpoilers, setUnmaskedSpoilers] = useState<Record<string, boolean>>({});

  if (!isOpen || !book) return null;

  const bookReviews = reviews.filter(r => r.bookId === book.id);
  const maxHistogramVal = Math.max(...book.ratingDistribution);

  const toggleSpoiler = (reviewId: string) => {
    setUnmaskedSpoilers(prev => ({ ...prev, [reviewId]: !prev[reviewId] }));
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/90 backdrop-blur-md overflow-y-auto" id="book-detail-modal">
      <div className="relative w-full max-w-2xl bg-[#121820] border-x border-b border-[#232f3e] min-h-screen pb-24 text-white shadow-2xl">
        
        {/* Floating Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="fixed top-4 right-4 sm:right-auto sm:left-[calc(50%+280px)] z-50 p-2.5 rounded-full bg-black/80 text-white hover:bg-[#15E558] hover:text-black border border-white/20 transition-all shadow-xl"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Hero Backdrop with Gradient Overlay */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-[#18222f]">
          <img
            src={book.backdropImage}
            alt={book.title}
            className="w-full h-full object-cover object-center opacity-40 scale-105 filter blur-[1px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121820] via-[#121820]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#121820]/80 via-transparent to-[#121820]/80" />

          {/* Top Bar Overlay */}
          <div className="absolute top-4 left-6 right-6 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-xs font-mono text-[#8fa0b5] hover:text-white border border-white/10"
            >
              ← Back
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenInstagramShare && onOpenInstagramShare(book)}
                className="p-2 rounded-full bg-black/50 backdrop-blur-md text-[#f09433] hover:text-[#15E558] border border-white/10 flex items-center gap-1 text-xs"
                title="Share to Instagram Story"
              >
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline font-mono text-[10px] text-white">Story</span>
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="p-2 rounded-full bg-black/50 backdrop-blur-md text-xs text-[#8fa0b5] hover:text-white border border-white/10"
                title="Copy Link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="relative px-6 -mt-28 space-y-6">
          {/* Header section with Poster Cover and Title/Author */}
          <div className="flex gap-5 items-start">
            {/* Book Poster */}
            <div className="w-32 min-w-32 sm:w-40 sm:min-w-40 rounded-lg overflow-hidden border-2 border-[#2b3b4f] bg-[#1a2330] book-shadow-lg relative group">
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-48 sm:h-60 object-cover"
              />
              <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/50 via-white/10 to-transparent pointer-events-none" />
            </div>

            {/* Title & Metadata */}
            <div className="flex-1 pt-10 sm:pt-14 space-y-1.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
                {book.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#8fa0b5]">
                <span className="font-semibold text-[#15E558] hover:underline cursor-pointer">
                  {book.author}
                </span>
                <span>•</span>
                <span>{book.year}</span>
                <span>•</span>
                <span>{book.pageCount} pp</span>
                {book.audioLength && (
                  <>
                    <span>•</span>
                    <span>{book.audioLength}</span>
                  </>
                )}
              </div>

              {book.tagline && (
                <p className="text-xs italic text-[#95a8be] font-serif pt-1">
                  "{book.tagline}"
                </p>
              )}

              {/* Average Rating Banner */}
              <div className="pt-2 flex items-center gap-2">
                <RatingStars rating={book.averageRating} size="md" />
                <span className="text-sm font-mono font-bold text-white">
                  {book.averageRating.toFixed(2)}
                </span>
                <span className="text-xs text-[#6c7f96]">
                  ({book.ratingsCount.toLocaleString()} ratings)
                </span>
              </div>
            </div>
          </div>

          {/* Core Action Bar (Letterboxd 4 buttons) */}
          <div className="grid grid-cols-4 gap-2 p-2 rounded-xl bg-[#18222e] border border-[#263445]">
            {/* Read Button */}
            <button
              type="button"
              onClick={() => onToggleRead(book)}
              className={`flex flex-col items-center justify-center py-2.5 rounded-lg text-xs font-semibold transition-all ${
                isRead
                  ? 'bg-[#15E558]/20 text-[#15E558] border border-[#15E558]/40'
                  : 'text-[#8fa0b5] hover:bg-[#222f3e] hover:text-white'
              }`}
            >
              <Eye className={`w-5 h-5 mb-1 ${isRead ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] uppercase font-mono">{isRead ? 'Read' : 'Mark Read'}</span>
            </button>

            {/* Like Button */}
            <button
              type="button"
              onClick={() => onToggleLike(book)}
              className={`flex flex-col items-center justify-center py-2.5 rounded-lg text-xs font-semibold transition-all ${
                isLiked
                  ? 'bg-[#FF8000]/20 text-[#FF8000] border border-[#FF8000]/40'
                  : 'text-[#8fa0b5] hover:bg-[#222f3e] hover:text-white'
              }`}
            >
              <Heart className={`w-5 h-5 mb-1 ${isLiked ? 'fill-[#FF8000]' : ''}`} />
              <span className="text-[10px] uppercase font-mono">{isLiked ? 'Liked' : 'Like'}</span>
            </button>

            {/* Watchlist / TBR Button */}
            <button
              type="button"
              onClick={() => onToggleWatchlist(book)}
              className={`flex flex-col items-center justify-center py-2.5 rounded-lg text-xs font-semibold transition-all ${
                isWatchlisted
                  ? 'bg-[#40BCF4]/20 text-[#40BCF4] border border-[#40BCF4]/40'
                  : 'text-[#8fa0b5] hover:bg-[#222f3e] hover:text-white'
              }`}
            >
              <BookMarked className={`w-5 h-5 mb-1 ${isWatchlisted ? 'fill-[#40BCF4]' : ''}`} />
              <span className="text-[10px] uppercase font-mono">{isWatchlisted ? 'In TBR' : 'TBR List'}</span>
            </button>

            {/* Log / Review Button */}
            <button
              type="button"
              onClick={() => onOpenLogModal(book)}
              className="flex flex-col items-center justify-center py-2.5 rounded-lg text-xs font-semibold bg-[#15E558] hover:bg-[#1ef563] text-black transition-transform active:scale-95 shadow-[0_0_12px_rgba(21,229,88,0.3)]"
            >
              <Plus className="w-5 h-5 mb-1 stroke-[3]" />
              <span className="text-[10px] uppercase font-mono font-bold">Log/Rate</span>
            </button>
          </div>

          {/* Social Stats Counters */}
          <div className="flex items-center justify-around py-3 px-4 rounded-xl bg-[#151d27] border border-[#222e3e] text-center text-xs">
            <div>
              <span className="block text-sm font-mono font-bold text-white">
                {book.readersCount.toLocaleString()}
              </span>
              <span className="text-[10px] font-mono text-[#6c7f96] uppercase">Readers</span>
            </div>
            <div className="h-6 w-px bg-[#263546]" />
            <div>
              <span className="block text-sm font-mono font-bold text-white">
                {book.watchlistCount.toLocaleString()}
              </span>
              <span className="text-[10px] font-mono text-[#6c7f96] uppercase">Watchlists</span>
            </div>
            <div className="h-6 w-px bg-[#263546]" />
            <div>
              <span className="block text-sm font-mono font-bold text-white">
                {book.likedCount.toLocaleString()}
              </span>
              <span className="text-[10px] font-mono text-[#6c7f96] uppercase">Likes</span>
            </div>
            <div className="h-6 w-px bg-[#263546]" />
            <div>
              <span className="block text-sm font-mono font-bold text-white">
                {book.reviewsCount.toLocaleString()}
              </span>
              <span className="text-[10px] font-mono text-[#6c7f96] uppercase">Reviews</span>
            </div>
          </div>

          {/* Community Ratings Histogram (Letterboxd signature 10 bars) */}
          <div className="p-4 rounded-xl bg-[#161f2b] border border-[#253344] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold uppercase text-[#8fa0b5]">Ratings Distribution</span>
              <span className="font-mono text-xs text-[#15E558]">{book.averageRating.toFixed(2)} average</span>
            </div>

            {/* 10 Bars */}
            <div className="h-16 flex items-end gap-1.5 pt-2">
              {book.ratingDistribution.map((count, index) => {
                const ratingLabel = (index + 1) * 0.5;
                const heightPercent = Math.max(8, Math.round((count / maxHistogramVal) * 100));
                return (
                  <div key={index} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-7 opacity-0 group-hover:opacity-100 bg-black text-[#15E558] text-[9px] font-mono py-0.5 px-1 rounded pointer-events-none transition-opacity">
                      {ratingLabel}★ ({count})
                    </div>
                    <div
                      className="w-full bg-[#2a3c50] group-hover:bg-[#15E558] rounded-t transition-all"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] font-mono text-[#6c7f96]">
              <span>½ ★</span>
              <span>★★★★★</span>
            </div>
          </div>

          {/* Synopsis */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-[#8fa0b5] uppercase tracking-wider">Synopsis</h3>
            <p className="text-sm leading-relaxed text-[#c3d0df] font-light">
              {book.synopsis}
            </p>
          </div>

          {/* Genre Badges */}
          <div className="flex flex-wrap gap-1.5">
            {book.genres.map(g => (
              <span
                key={g}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#1c2633] text-[#8fa0b5] border border-[#273648]"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Where to Read / Buy Integration Cards */}
          {book.availableOn && book.availableOn.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-mono font-bold text-[#8fa0b5] uppercase tracking-wider">
                Where to Read or Listen
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {book.availableOn.map((opt, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-[#18222e] border border-[#273648] hover:border-[#40BCF4] transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <span className="text-xs font-bold text-white block">{opt.service}</span>
                      <span className="text-[10px] text-[#6c7f96] capitalize">{opt.type}</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-[#6c7f96]" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-Navigation: Reviews, Details, Quotes */}
          <div className="border-b border-[#232f3e] flex items-center gap-6 pt-4">
            <button
              type="button"
              onClick={() => setActiveSubTab('reviews')}
              className={`pb-2 text-xs font-mono font-bold uppercase transition-colors relative ${
                activeSubTab === 'reviews' ? 'text-white' : 'text-[#6c7f96] hover:text-white'
              }`}
            >
              Reviews ({bookReviews.length})
              {activeSubTab === 'reviews' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#15E558]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('quotes')}
              className={`pb-2 text-xs font-mono font-bold uppercase transition-colors relative ${
                activeSubTab === 'quotes' ? 'text-white' : 'text-[#6c7f96] hover:text-white'
              }`}
            >
              Quotes & Excerpts
              {activeSubTab === 'quotes' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#15E558]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('details')}
              className={`pb-2 text-xs font-mono font-bold uppercase transition-colors relative ${
                activeSubTab === 'details' ? 'text-white' : 'text-[#6c7f96] hover:text-white'
              }`}
            >
              Publisher Info
              {activeSubTab === 'details' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#15E558]" />
              )}
            </button>
          </div>

          {/* Tab Content: Reviews Feed */}
          {activeSubTab === 'reviews' && (
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#8fa0b5]">Member Reviews</span>
                <div className="flex gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setReviewFilter('popular')}
                    className={`px-2 py-1 rounded ${reviewFilter === 'popular' ? 'bg-[#222e3d] text-[#15E558]' : 'text-[#6c7f96]'}`}
                  >
                    Popular
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewFilter('recent')}
                    className={`px-2 py-1 rounded ${reviewFilter === 'recent' ? 'bg-[#222e3d] text-[#15E558]' : 'text-[#6c7f96]'}`}
                  >
                    Recent
                  </button>
                </div>
              </div>

              {bookReviews.length === 0 ? (
                <div className="p-8 text-center bg-[#18222e] rounded-xl border border-[#232f3e] text-[#6c7f96] text-xs">
                  No reviews written yet. Be the first to review {book.title}!
                </div>
              ) : (
                bookReviews.map((rev) => {
                  const isSpoilerHidden = rev.hasSpoilers && !unmaskedSpoilers[rev.id];

                  return (
                    <div
                      key={rev.id}
                      className="p-4 rounded-xl bg-[#17202b] border border-[#253344] space-y-2.5"
                    >
                      {/* Reviewer Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={rev.userAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                            alt={rev.userName || "Reviewer"}
                            className="w-8 h-8 rounded-full object-cover border border-[#34465b]"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white">{rev.userName || "Reviewer"}</span>
                              <span className="text-[10px] text-[#6c7f96]">{rev.userHandle || "@reader"}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <RatingStars rating={rev.rating} size="xs" />
                              {rev.liked && <Heart className="w-3 h-3 fill-[#FF8000] text-[#FF8000]" />}
                              <span className="text-[10px] text-[#6c7f96]">• {rev.date}</span>
                            </div>
                          </div>
                        </div>

                        {rev.format && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#202b3a] text-[#8fa0b5] capitalize">
                            {rev.format}
                          </span>
                        )}
                      </div>

                      {/* Spoiler warning alert */}
                      {rev.hasSpoilers && (
                        <div className="flex items-center justify-between p-2 rounded bg-[#332211] border border-[#664422] text-[11px] text-[#ffaa44]">
                          <span className="flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5" />
                            This review contains spoilers
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleSpoiler(rev.id)}
                            className="text-xs underline font-semibold"
                          >
                            {unmaskedSpoilers[rev.id] ? 'Hide' : 'Reveal'}
                          </button>
                        </div>
                      )}

                      {/* Review Content */}
                      {!isSpoilerHidden && (
                        <p className="text-xs text-[#cbd6e2] leading-relaxed font-light">
                          {rev.content}
                        </p>
                      )}

                      {/* Footer Actions: Likes & Comments & Story */}
                      <div className="flex items-center justify-between pt-1 text-xs text-[#6c7f96]">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => onLikeReview(rev.id)}
                            className={`flex items-center gap-1 hover:text-[#FF8000] transition-colors ${
                              rev.isUserLiked ? 'text-[#FF8000]' : ''
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${rev.isUserLiked ? 'fill-[#FF8000]' : ''}`} />
                            <span className="text-[11px] font-mono">{rev.likesCount}</span>
                          </button>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-mono">{rev.commentsCount}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => onOpenInstagramShare && onOpenInstagramShare(book, rev)}
                            className="flex items-center gap-1 hover:text-[#15E558] transition-colors text-[11px]"
                            title="Share review as Instagram Story"
                          >
                            <Camera className="w-3.5 h-3.5 text-[#f09433]" />
                            <span>Share</span>
                          </button>
                        </div>

                        {rev.tags && rev.tags.length > 0 && (
                          <div className="flex gap-1">
                            {rev.tags.map(t => (
                              <span key={t} className="text-[10px] text-[#40BCF4]">#{t}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Tab Content: Quotes */}
          {activeSubTab === 'quotes' && (
            <div className="space-y-3 pt-1">
              {book.quotes && book.quotes.length > 0 ? (
                book.quotes.map((q, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#17202b] border border-[#253344] flex items-start gap-3">
                    <Quote className="w-5 h-5 text-[#15E558] shrink-0 mt-0.5" />
                    <p className="text-xs italic font-serif text-[#cbd6e2] leading-relaxed">
                      "{q}"
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-[#6c7f96] text-xs">
                  No highlighted quotes yet.
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Details & Publisher info */}
          {activeSubTab === 'details' && (
            <div className="p-4 rounded-xl bg-[#17202b] border border-[#253344] space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-[#243343]">
                <span className="text-[#6c7f96]">Original Title</span>
                <span className="font-medium text-white">{book.originalTitle || book.title}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#243343]">
                <span className="text-[#6c7f96]">Publisher</span>
                <span className="font-medium text-white">{book.publisher || 'Independent'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#243343]">
                <span className="text-[#6c7f96]">ISBN-13</span>
                <span className="font-mono text-white">{book.isbn || '978-0000000000'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#243343]">
                <span className="text-[#6c7f96]">Page Count</span>
                <span className="font-mono text-white">{book.pageCount} pages</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
