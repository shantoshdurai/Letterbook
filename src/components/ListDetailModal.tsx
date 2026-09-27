import React from 'react';
import { Heart, Pencil, Share2, Trash2, Lock, ListPlus } from 'lucide-react';
import { useLibrary } from '../state/library';
import { useUI } from '../state/ui';
import { relativeTime } from '../lib/format';
import { shareOrCopy } from '../lib/share';
import { Avatar, BookPoster, EmptyState, OverlayScreen, ScreenHeader } from './ui';

export const ListDetailModal: React.FC<{ z: number; listId: string }> = ({ z, listId }) => {
  const lib = useLibrary();
  const ui = useUI();
  const list = lib.allLists.find((l) => l.id === listId);

  if (!list) {
    return (
      <OverlayScreen z={z} label="List">
        <ScreenHeader title="List" onBack={ui.close} />
        <EmptyState title="This list no longer exists" />
      </OverlayScreen>
    );
  }

  const mine = list.creatorId === lib.profile.id;
  const liked = lib.likedListIds.includes(list.id);
  const books = lib.resolve(list.bookIds);

  const share = async () => {
    const lines = books.map((b, i) => `${list.isRanked ? `${i + 1}. ` : '• '}${b.title} — ${b.author}`);
    const r = await shareOrCopy({
      title: list.title,
      text: `${list.title}${list.description ? `\n${list.description}` : ''}\n\n${lines.join('\n')}\n\nMade with Letterbook`,
    });
    if (r === 'copied') ui.toast('List copied to clipboard');
  };

  const remove = async () => {
    const ok = await ui.confirm({ title: 'Delete this list?', body: `"${list.title}" will be permanently deleted.`, confirmLabel: 'Delete', destructive: true });
    if (!ok) return;
    lib.actions.deleteList(list.id);
    ui.toast('List deleted');
    ui.close();
  };

  return (
    <OverlayScreen z={z} label={list.title}>
      <ScreenHeader
        title={list.isRanked ? 'Ranked list' : 'List'}
        onBack={ui.close}
        right={
          <>
            <button type="button" onClick={share} aria-label="Share list" className="p-2 rounded-full text-[#8fa0b5] hover:text-white hover:bg-[#1f2834]">
              <Share2 className="w-4 h-4" />
            </button>
            {mine && (
              <>
                <button type="button" onClick={() => ui.open({ type: 'createList', editListId: list.id })} aria-label="Edit list" className="p-2 rounded-full text-[#8fa0b5] hover:text-white hover:bg-[#1f2834]">
                  <Pencil className="w-4 h-4" />
                </button>
                <button type="button" onClick={remove} aria-label="Delete list" className="p-2 rounded-full text-[#ff7b7b] hover:bg-[#3a1c1c]">
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </>
        }
      />

      <div className="p-5 space-y-3 border-b border-[#232f3e] bg-[#151d27]">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-start gap-2">
          {list.isPrivate && <Lock className="w-4 h-4 mt-1.5 text-[#6c7f96] shrink-0" aria-label="Private" />}
          {list.title}
        </h1>
        {list.description && <p className="text-sm text-[#9eb0c3] leading-relaxed whitespace-pre-line">{list.description}</p>}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <Avatar src={mine ? lib.profile.avatar : list.creatorAvatar} name={mine ? lib.profile.name : list.creatorName} className="w-7 h-7" />
            <div>
              <span className="text-xs font-semibold text-white block">{mine ? 'You' : list.creatorName}</span>
              <span className="text-[10px] text-[#6c7f96]">{list.bookIds.length} books · updated {relativeTime(list.updatedAt).toLowerCase()}</span>
            </div>
          </div>
          {!mine && (
            <button
              type="button"
              onClick={() => lib.actions.toggleLikeList(list.id)}
              aria-pressed={liked}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                liked ? 'border-[#FF8000] bg-[#FF8000]/10 text-[#FF8000]' : 'border-[#293849] text-[#8fa0b5] hover:text-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-[#FF8000]' : ''}`} />
              <span className="font-mono">{list.likesCount + (liked ? 1 : 0)}</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-4 pb-safe">
        {books.length === 0 ? (
          <EmptyState
            icon={<ListPlus className="w-10 h-10" />}
            title="No books yet"
            body={mine ? 'Long-press any book and choose “Add to a list”, or edit this list to add books.' : undefined}
            action={mine ? (
              <button type="button" onClick={() => ui.open({ type: 'createList', editListId: list.id })} className="px-4 py-2 rounded-lg bg-[#15E558] text-black text-xs font-bold">
                Add books
              </button>
            ) : undefined}
          />
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {books.map((book, index) => (
              <BookPoster
                key={book.id}
                book={book}
                showTitle
                rank={list.isRanked ? index + 1 : undefined}
                onSelect={(b) => ui.open({ type: 'book', book: b })}
                onLongPress={(b) => ui.open({ type: 'quickMenu', bookId: b.id })}
                isWatchlisted={lib.watchlistIds.includes(book.id)}
                onToggleWatchlist={(b) => ui.toast(lib.actions.toggleWatchlist(b) ? 'Added to watchlist' : 'Removed from watchlist')}
                isRead={lib.readIds.includes(book.id)}
                isLiked={lib.likedIds.includes(book.id)}
              />
            ))}
          </div>
        )}
      </div>
    </OverlayScreen>
  );
};
