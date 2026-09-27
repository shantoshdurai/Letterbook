import React from 'react';
import { Bell, CheckCheck, Target, Trophy, Sparkles, List as ListIcon, Trash2 } from 'lucide-react';
import { NotificationItem } from '../types';
import { useLibrary } from '../state/library';
import { useUI } from '../state/ui';
import { relativeTime } from '../lib/format';
import { BookCover, EmptyState, OverlayScreen, ScreenHeader } from './ui';

const ICONS: Record<NotificationItem['kind'], React.ReactNode> = {
  system: <Sparkles className="w-4 h-4 text-[#00E054]" />,
  goal: <Target className="w-4 h-4 text-[#00E054]" />,
  milestone: <Trophy className="w-4 h-4 text-[#FF8000]" />,
  list: <ListIcon className="w-4 h-4 text-[#40BCF4]" />,
  community: <Bell className="w-4 h-4 text-[#40BCF4]" />,
};

export const NotificationsScreen: React.FC<{ z: number }> = ({ z }) => {
  const lib = useLibrary();
  const ui = useUI();
  const items = lib.notifications;

  return (
    <OverlayScreen z={z} label="Notifications">
      <ScreenHeader
        title="Notifications"
        subtitle={lib.unreadNotifications ? `${lib.unreadNotifications} unread` : undefined}
        onBack={ui.close}
        right={
          items.length > 0 ? (
            <>
              <button type="button" onClick={lib.actions.markAllNotificationsRead} aria-label="Mark all as read" className="p-2 rounded-full text-[#8fa0b5] hover:text-white hover:bg-[#1f2834]">
                <CheckCheck className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (await ui.confirm({ title: 'Clear all notifications?', confirmLabel: 'Clear', destructive: true })) lib.actions.clearNotifications();
                }}
                aria-label="Clear all notifications"
                className="p-2 rounded-full text-[#8fa0b5] hover:text-white hover:bg-[#1f2834]"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : undefined
        }
      />
      {items.length === 0 ? (
        <EmptyState icon={<Bell className="w-10 h-10" />} title="You're all caught up" body="Milestones and reading-goal updates will show up here." />
      ) : (
        <ul className="divide-y divide-[#1e2632] pb-safe">
          {items.map((n) => {
            const book = n.bookId ? lib.catalog[n.bookId] : undefined;
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => {
                    lib.actions.markNotificationRead(n.id);
                    if (book) ui.open({ type: 'book', book });
                  }}
                  className={`w-full px-4 py-3.5 flex items-start gap-3 text-left hover:bg-[#192027] ${n.isRead ? '' : 'bg-[#00E054]/[0.04]'}`}
                >
                  <span className="mt-0.5 p-2 rounded-full bg-[#1c2531] shrink-0">{ICONS[n.kind]}</span>
                  <span className="flex-1 min-w-0">
                    <span className="flex items-start justify-between gap-2">
                      <span className={`text-xs ${n.isRead ? 'text-[#cbd6e2]' : 'text-white font-bold'}`}>{n.title}</span>
                      <span className="text-[10px] text-[#556677] shrink-0">{relativeTime(n.createdAt)}</span>
                    </span>
                    {n.body && <span className="block text-[11px] text-[#8fa0b5] mt-0.5 leading-snug">{n.body}</span>}
                  </span>
                  {book && (
                    <span className="w-8 aspect-[2/3] rounded overflow-hidden shrink-0 bg-[#1a2330]"><BookCover book={book} /></span>
                  )}
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#40BCF4] mt-1.5 shrink-0" aria-label="Unread" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </OverlayScreen>
  );
};
