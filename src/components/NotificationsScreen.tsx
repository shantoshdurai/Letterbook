import React, { useState } from 'react';
import { NotificationItem, Book } from '../types';
import { ArrowLeft, SlidersHorizontal, Check, Bookmark, Star, Heart, UserPlus, MessageSquare, BookOpen } from 'lucide-react';

interface NotificationsScreenProps {
  notifications: NotificationItem[];
  onBack: () => void;
  onSelectBook: (book: Book) => void;
  onClearAll?: () => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  notifications,
  onBack,
  onSelectBook,
  onClearAll
}) => {
  const [filterType, setFilterType] = useState<'all' | 'watchlist' | 'reviews' | 'follows'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const filteredNotifs = notifications.filter(n => {
    if (filterType === 'watchlist') return n.type === 'watchlist' || n.type === 'list';
    if (filterType === 'reviews') return n.type === 'review' || n.type === 'rating' || n.type === 'like_review';
    if (filterType === 'follows') return n.type === 'follow';
    return true;
  });

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'watchlist':
        return <Bookmark className="w-3 h-3 text-[#40BCF4] fill-[#40BCF4]" />;
      case 'rating':
        return <Star className="w-3 h-3 text-[#15E558] fill-[#15E558]" />;
      case 'like_review':
        return <Heart className="w-3 h-3 text-[#FF8000] fill-[#FF8000]" />;
      case 'follow':
        return <UserPlus className="w-3 h-3 text-[#40BCF4]" />;
      case 'review':
        return <MessageSquare className="w-3 h-3 text-[#15E558]" />;
      default:
        return <BookOpen className="w-3 h-3 text-[#8fa0b5]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#14181c] text-white select-none pb-20" id="letterbook-notifications-screen">
      {/* Top Header Bar matching Screenshot 3 */}
      <header className="sticky top-0 z-30 bg-[#14181c]/95 backdrop-blur-md px-4 py-3.5 flex items-center justify-between border-b border-[#242f3d]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1 rounded-full text-[#8fa0b5] hover:text-white hover:bg-[#1f2834] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <h1 className="text-lg font-bold text-white tracking-tight">Notifications</h1>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowFilterDropdown(prev => !prev)}
            className={`p-1.5 rounded-full transition-colors ${
              showFilterDropdown ? 'bg-[#1f2834] text-white' : 'text-[#8fa0b5] hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {showFilterDropdown && (
            <div className="absolute right-0 mt-2 w-44 rounded-xl bg-[#1b2228] border border-[#2c3746] shadow-2xl py-1 z-40 text-xs">
              <button
                type="button"
                onClick={() => { setFilterType('all'); setShowFilterDropdown(false); }}
                className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[#25303d] ${
                  filterType === 'all' ? 'text-[#15E558] font-bold' : 'text-[#a0b0c0]'
                }`}
              >
                <span>All Notifications</span>
                {filterType === 'all' && <Check className="w-3.5 h-3.5 text-[#15E558]" />}
              </button>
              <button
                type="button"
                onClick={() => { setFilterType('reviews'); setShowFilterDropdown(false); }}
                className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[#25303d] ${
                  filterType === 'reviews' ? 'text-[#15E558] font-bold' : 'text-[#a0b0c0]'
                }`}
              >
                <span>Ratings & Reviews</span>
                {filterType === 'reviews' && <Check className="w-3.5 h-3.5 text-[#15E558]" />}
              </button>
              <button
                type="button"
                onClick={() => { setFilterType('watchlist'); setShowFilterDropdown(false); }}
                className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[#25303d] ${
                  filterType === 'watchlist' ? 'text-[#15E558] font-bold' : 'text-[#a0b0c0]'
                }`}
              >
                <span>Watchlist & Lists</span>
                {filterType === 'watchlist' && <Check className="w-3.5 h-3.5 text-[#15E558]" />}
              </button>
              <button
                type="button"
                onClick={() => { setFilterType('follows'); setShowFilterDropdown(false); }}
                className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[#25303d] ${
                  filterType === 'follows' ? 'text-[#15E558] font-bold' : 'text-[#a0b0c0]'
                }`}
              >
                <span>Follows</span>
                {filterType === 'follows' && <Check className="w-3.5 h-3.5 text-[#15E558]" />}
              </button>
              {onClearAll && (
                <div className="border-t border-[#2c3746] mt-1 pt-1">
                  <button
                    type="button"
                    onClick={() => { onClearAll(); setShowFilterDropdown(false); }}
                    className="w-full px-3 py-2 text-left text-xs text-[#FF8000] hover:bg-[#25303d]"
                  >
                    Mark All as Read
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Notification List matching screenshot 3 */}
      <div className="divide-y divide-[#1e2632]">
        {filteredNotifs.map((notif) => {
          return (
            <div
              key={notif.id}
              onClick={() => {
                if (notif.targetBook) onSelectBook(notif.targetBook);
              }}
              className="px-4 py-3 flex items-start gap-3 hover:bg-[#192027] transition-colors cursor-pointer"
            >
              {/* User Avatar with mini icon badge */}
              <div className="relative shrink-0 mt-0.5">
                <img
                  src={notif.user.avatar}
                  alt={notif.user.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#2a3746]"
                />
                <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-[#14181c] border border-[#242f3d]">
                  {getNotificationIcon(notif.type)}
                </div>
              </div>

              {/* Text & Content */}
              <div className="flex-1 min-w-0 text-xs leading-snug">
                <div className="text-[#9ab] pr-1">
                  <span className="font-bold text-white">{notif.user.name}</span>{' '}
                  {notif.type === 'watchlist' && (
                    <>
                      added <span className="font-bold text-white">{notif.targetBook?.title || 'a book'}</span> to his Watchlist
                    </>
                  )}
                  {notif.type === 'rating' && (
                    <>
                      rated <span className="font-bold text-white">{notif.targetBook?.title || 'a book'}</span>{' '}
                      <span className="text-[#15E558] font-bold">
                        {'★'.repeat(Math.floor(notif.rating || 5))}
                        {(notif.rating || 0) % 1 !== 0 ? '½' : ''}
                      </span>
                    </>
                  )}
                  {notif.type === 'list' && (
                    <>
                      added <span className="font-bold text-white">{notif.targetBook?.title}</span> to <span className="font-bold text-white">{notif.targetListTitle || 'a collection'}</span>
                    </>
                  )}
                  {notif.type === 'follow' && (
                    <>
                      followed you
                    </>
                  )}
                  {notif.type === 'review' && (
                    <>
                      reviewed <span className="font-bold text-white">{notif.targetBook?.title}</span>{' '}
                      <span className="text-[#15E558] font-bold">
                        {'★'.repeat(Math.floor(notif.rating || 3))}
                      </span>
                    </>
                  )}
                  {notif.type === 'like_review' && (
                    <>
                      liked your review on <span className="font-bold text-white">{notif.targetBook?.title}</span>
                    </>
                  )}
                </div>

                {/* Review Excerpt if present */}
                {notif.reviewExcerpt && (
                  <p className="mt-1 text-[11px] text-[#6c7f96] line-clamp-2 italic">
                    "{notif.reviewExcerpt}"
                  </p>
                )}
              </div>

              {/* Timestamp on right */}
              <div className="shrink-0 text-[11px] text-[#556677] font-medium pt-0.5">
                {notif.timestamp}
              </div>
            </div>
          );
        })}

        {filteredNotifs.length === 0 && (
          <div className="p-8 text-center text-xs text-[#6c7f96]">
            No notifications in this category yet.
          </div>
        )}
      </div>
    </div>
  );
};
