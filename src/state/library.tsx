import React, { createContext, useCallback, useContext, useMemo } from 'react';
import {
  AppSettings, Book, BookList, NotificationItem, ReadingLogEntry, Review, UserProfile,
} from '../types';
import { usePersistentState, storageKey, readJSON } from '../lib/storage';
import { seedBooks, communityLists, communityReviews } from '../data/seed';
import { todayISO, uid } from '../lib/format';
import type { Session } from '../lib/auth';

// Everything the signed-in reader owns. Persisted per account under
// letterbook:u:<userId>:<slice>.
export interface LibraryState {
  catalog: Record<string, Book>;
  logs: ReadingLogEntry[];
  readIds: string[];
  likedIds: string[];
  watchlistIds: string[];
  lists: BookList[];
  likedListIds: string[];
  likedReviewIds: string[];
  likedActivityIds: string[];
  likedArticleIds: string[];
  profile: UserProfile;
  settings: AppSettings;
  notifications: NotificationItem[];
  recentBookIds: string[];
}

export interface LibraryExport extends Omit<LibraryState, 'catalog'> {
  app: 'letterbook';
  version: 1;
  exportedAt: string;
  books: Book[];
}

const DEFAULT_SETTINGS: AppSettings = { spoilerShield: true, showStoryAfterLog: true };
const MILESTONES = [1, 10, 25, 50, 100, 250, 500, 1000];

export function newProfile(session: Session): UserProfile {
  return {
    id: session.userId,
    name: session.name,
    handle: session.handle,
    avatar: '',
    bio: '',
    location: '',
    joinedYear: new Date().getFullYear(),
    favoriteBookIds: [],
    favoriteGenres: readJSON<string[]>(storageKey('u', session.userId, 'onboardingGenres'), []),
    followersCount: 0,
    followingCount: 0,
    readingGoal: { year: new Date().getFullYear(), target: 24 },
  };
}

function seedCatalog() {
  return Object.fromEntries(seedBooks.map((b) => [b.id, b]));
}

function welcomeNotification(session: Session): NotificationItem {
  return {
    id: uid('n'),
    kind: 'system',
    title: session.isGuest ? 'Welcome to Letterbook' : `Welcome to Letterbook, ${session.name.split(' ')[0]}!`,
    body: 'Search for a book you just finished, rate it, and share it to your Story.',
    createdAt: new Date().toISOString(),
    isRead: false,
  };
}

function useLibraryState(session: Session) {
  const k = (slice: string) => storageKey('u', session.userId, slice);
  const [catalog, setCatalog] = usePersistentState<Record<string, Book>>(k('catalog'), seedCatalog);
  const [logs, setLogs] = usePersistentState<ReadingLogEntry[]>(k('logs'), []);
  const [readIds, setReadIds] = usePersistentState<string[]>(k('read'), []);
  const [likedIds, setLikedIds] = usePersistentState<string[]>(k('liked'), []);
  const [watchlistIds, setWatchlistIds] = usePersistentState<string[]>(k('watchlist'), []);
  const [lists, setLists] = usePersistentState<BookList[]>(k('lists'), []);
  const [likedListIds, setLikedListIds] = usePersistentState<string[]>(k('likedLists'), []);
  const [likedReviewIds, setLikedReviewIds] = usePersistentState<string[]>(k('likedReviews'), []);
  const [likedActivityIds, setLikedActivityIds] = usePersistentState<string[]>(k('likedActivity'), []);
  const [likedArticleIds, setLikedArticleIds] = usePersistentState<string[]>(k('likedArticles'), []);
  const [profile, setProfile] = usePersistentState<UserProfile>(k('profile'), () => newProfile(session));
  const [settings, setSettings] = usePersistentState<AppSettings>(k('settings'), DEFAULT_SETTINGS);
  const [notifications, setNotifications] = usePersistentState<NotificationItem[]>(k('notifications'), () => [welcomeNotification(session)]);
  const [recentBookIds, setRecentBookIds] = usePersistentState<string[]>(k('recent'), []);

  return {
    state: {
      catalog, logs, readIds, likedIds, watchlistIds, lists, likedListIds, likedReviewIds,
      likedActivityIds, likedArticleIds, profile, settings, notifications, recentBookIds,
    } as LibraryState,
    set: {
      setCatalog, setLogs, setReadIds, setLikedIds, setWatchlistIds, setLists, setLikedListIds,
      setLikedReviewIds, setLikedActivityIds, setLikedArticleIds, setProfile, setSettings,
      setNotifications, setRecentBookIds,
    },
  };
}

const toggleIn = (arr: string[], id: string) => (arr.includes(id) ? arr.filter((x) => x !== id) : [id, ...arr]);

function createActions(session: Session, s: LibraryState, set: ReturnType<typeof useLibraryState>['set']) {
  const upsertBooks = (books: Book[]) => {
    if (!books.length) return;
    set.setCatalog((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const b of books) {
        const existing = prev[b.id];
        // Keep a custom cover the reader picked; otherwise take the fresher data.
        const merged = existing ? { ...existing, ...b, coverImage: existing.coverImage || b.coverImage } : b;
        if (!existing || JSON.stringify(existing) !== JSON.stringify(merged)) {
          next[b.id] = merged;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  };

  const notify = (n: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>) =>
    set.setNotifications((prev) => [{ ...n, id: uid('n'), createdAt: new Date().toISOString(), isRead: false }, ...prev].slice(0, 100));

  const saveLog = (entry: ReadingLogEntry, book: Book) => {
    upsertBooks([book]);
    const isEdit = s.logs.some((l) => l.id === entry.id);
    const nextLogs = isEdit ? s.logs.map((l) => (l.id === entry.id ? entry : l)) : [{ ...entry, createdAt: new Date().toISOString() }, ...s.logs];
    set.setLogs(nextLogs);
    set.setReadIds((prev) => (prev.includes(book.id) ? prev : [book.id, ...prev]));
    if (entry.liked) set.setLikedIds((prev) => (prev.includes(book.id) ? prev : [book.id, ...prev]));
    // Finishing a book takes it off the to-read list, like marking a film watched.
    set.setWatchlistIds((prev) => prev.filter((id) => id !== book.id));

    if (!isEdit) {
      const total = nextLogs.length;
      if (MILESTONES.includes(total)) {
        notify({ kind: 'milestone', title: total === 1 ? 'Your first diary entry!' : `${total} books logged`, body: total === 1 ? `You logged ${book.title}. Your reading diary has begun.` : `Another milestone. ${book.title} was number ${total}.`, bookId: book.id });
      }
      const year = String(s.profile.readingGoal.year);
      const thisYear = nextLogs.filter((l) => l.dateFinished.startsWith(year)).length;
      if (entry.dateFinished.startsWith(year) && thisYear === s.profile.readingGoal.target) {
        notify({ kind: 'goal', title: `You hit your ${year} reading goal!`, body: `${thisYear} books read. Time to raise the bar?`, bookId: book.id });
      }
    }
  };

  const actions = {
    upsertBooks,
    getBook: (id: string): Book | undefined => s.catalog[id],
    toggleWatchlist: (book: Book) => {
      upsertBooks([book]);
      const had = s.watchlistIds.includes(book.id);
      set.setWatchlistIds((prev) => toggleIn(prev, book.id));
      return !had;
    },
    toggleRead: (book: Book) => {
      upsertBooks([book]);
      const had = s.readIds.includes(book.id);
      set.setReadIds((prev) => toggleIn(prev, book.id));
      if (!had) set.setWatchlistIds((prev) => prev.filter((id) => id !== book.id));
      return !had;
    },
    toggleLike: (book: Book) => {
      upsertBooks([book]);
      const had = s.likedIds.includes(book.id);
      set.setLikedIds((prev) => toggleIn(prev, book.id));
      return !had;
    },
    saveLog,
    deleteLog: (logId: string) => set.setLogs((prev) => prev.filter((l) => l.id !== logId)),
    restoreLog: (entry: ReadingLogEntry) => set.setLogs((prev) => (prev.some((l) => l.id === entry.id) ? prev : [entry, ...prev])),
    // Rating from the quick menu: updates the latest diary entry, or creates one.
    quickRate: (book: Book, rating: number) => {
      const latest = s.logs.find((l) => l.bookId === book.id);
      if (latest) {
        saveLog({ ...latest, rating }, book);
        return latest;
      }
      const entry: ReadingLogEntry = {
        id: uid('log'), bookId: book.id, dateFinished: todayISO(), rating,
        liked: s.likedIds.includes(book.id), format: 'physical', tags: [],
      };
      saveLog(entry, book);
      return entry;
    },
    createList: (input: { title: string; description: string; isRanked: boolean; bookIds: string[]; isPrivate?: boolean }) => {
      const list: BookList = {
        id: uid('list'),
        title: input.title.trim(),
        description: input.description.trim(),
        creatorId: session.userId,
        creatorName: s.profile.name,
        creatorAvatar: s.profile.avatar,
        bookIds: input.bookIds,
        likesCount: 0,
        commentsCount: 0,
        isRanked: input.isRanked,
        isPrivate: input.isPrivate,
        tags: [],
        updatedAt: new Date().toISOString(),
      };
      set.setLists((prev) => [list, ...prev]);
      return list;
    },
    updateList: (id: string, patch: Partial<BookList>) =>
      set.setLists((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch, updatedAt: new Date().toISOString() } : l))),
    deleteList: (id: string) => set.setLists((prev) => prev.filter((l) => l.id !== id)),
    toggleBookInList: (listId: string, book: Book) => {
      upsertBooks([book]);
      const list = s.lists.find((l) => l.id === listId);
      const had = Boolean(list?.bookIds.includes(book.id));
      set.setLists((prev) => prev.map((l) => (l.id === listId
        ? { ...l, bookIds: had ? l.bookIds.filter((id) => id !== book.id) : [...l.bookIds, book.id], updatedAt: new Date().toISOString() }
        : l)));
      return !had;
    },
    toggleLikeList: (id: string) => set.setLikedListIds((prev) => toggleIn(prev, id)),
    toggleReviewLike: (id: string) => set.setLikedReviewIds((prev) => toggleIn(prev, id)),
    toggleActivityLike: (id: string) => set.setLikedActivityIds((prev) => toggleIn(prev, id)),
    toggleArticleLike: (id: string) => set.setLikedArticleIds((prev) => toggleIn(prev, id)),
    updateProfile: (patch: Partial<UserProfile>) => set.setProfile((prev) => ({ ...prev, ...patch })),
    updateSettings: (patch: Partial<AppSettings>) => set.setSettings((prev) => ({ ...prev, ...patch })),
    markNotificationRead: (id: string) => set.setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))),
    markAllNotificationsRead: () => set.setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true }))),
    clearNotifications: () => set.setNotifications([]),
    addRecent: (book: Book) => {
      upsertBooks([book]);
      set.setRecentBookIds((prev) => [book.id, ...prev.filter((id) => id !== book.id)].slice(0, 20));
    },
    clearRecent: () => set.setRecentBookIds([]),
    setCover: (book: Book, coverImage: string) => {
      set.setCatalog((prev) => ({ ...prev, [book.id]: { ...(prev[book.id] || book), coverImage } }));
    },
    exportData: (): LibraryExport => {
      const referenced = new Set<string>([
        ...s.logs.map((l) => l.bookId), ...s.readIds, ...s.likedIds, ...s.watchlistIds,
        ...s.lists.flatMap((l) => l.bookIds), ...s.profile.favoriteBookIds, ...s.recentBookIds,
      ]);
      const { catalog, ...rest } = s;
      return {
        app: 'letterbook',
        version: 1,
        exportedAt: new Date().toISOString(),
        ...rest,
        books: Array.from(referenced).map((id) => catalog[id]).filter(Boolean),
      };
    },
    // Restores a Letterbook export (replaces everything but the account itself).
    importData: (data: LibraryExport) => {
      if (data?.app !== 'letterbook' || !Array.isArray(data.logs)) throw new Error('That file is not a Letterbook export.');
      set.setCatalog({ ...seedCatalog(), ...Object.fromEntries((data.books || []).map((b) => [b.id, b])) });
      set.setLogs(data.logs || []);
      set.setReadIds(data.readIds || []);
      set.setLikedIds(data.likedIds || []);
      set.setWatchlistIds(data.watchlistIds || []);
      set.setLists((data.lists || []).map((l) => ({ ...l, creatorId: session.userId })));
      set.setLikedListIds(data.likedListIds || []);
      set.setLikedReviewIds(data.likedReviewIds || []);
      set.setLikedActivityIds(data.likedActivityIds || []);
      set.setLikedArticleIds(data.likedArticleIds || []);
      if (data.profile) set.setProfile({ ...data.profile, id: session.userId, name: s.profile.name, handle: s.profile.handle });
      if (data.settings) set.setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
      set.setRecentBookIds(data.recentBookIds || []);
    },
    // Merge books + logs from a Goodreads import.
    mergeImport: (books: Book[], logs: ReadingLogEntry[], toRead: string[]) => {
      upsertBooks(books);
      const existing = new Set(s.logs.map((l) => `${l.bookId}|${l.dateFinished}`));
      const fresh = logs.filter((l) => !existing.has(`${l.bookId}|${l.dateFinished}`));
      set.setLogs((prev) => [...fresh, ...prev].sort((a, b) => b.dateFinished.localeCompare(a.dateFinished)));
      set.setReadIds((prev) => Array.from(new Set([...logs.map((l) => l.bookId), ...prev])));
      set.setWatchlistIds((prev) => Array.from(new Set([...prev, ...toRead])));
      return fresh.length;
    },
  };
  return actions;
}

export type LibraryActions = ReturnType<typeof createActions>;

export interface LibraryDerived {
  allLists: BookList[];
  myReviews: Review[];
  allReviews: Review[];
  readCount: number;
  thisYearCount: number;
  unreadNotifications: number;
  ratingFor: (bookId: string) => number;
  resolve: (ids: string[]) => Book[];
}

interface LibraryContextValue extends LibraryState, LibraryDerived {
  session: Session;
  actions: LibraryActions;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

export const LibraryProvider: React.FC<{ session: Session; children: React.ReactNode }> = ({ session, children }) => {
  const { state, set } = useLibraryState(session);
  const actions = createActions(session, state, set);

  const resolve = useCallback((ids: string[]) => ids.map((id) => state.catalog[id]).filter((b): b is Book => Boolean(b)), [state.catalog]);

  const derived = useMemo<LibraryDerived>(() => {
    const myReviews: Review[] = state.logs
      .filter((l) => l.review && l.review.trim())
      .map((l) => ({
        id: `rev-${l.id}`,
        logId: l.id,
        bookId: l.bookId,
        userId: state.profile.id,
        userName: state.profile.name,
        userAvatar: state.profile.avatar,
        userHandle: state.profile.handle,
        rating: l.rating,
        liked: l.liked,
        content: l.review!.trim(),
        date: l.createdAt || l.dateFinished,
        readDate: l.dateFinished,
        format: l.format,
        hasSpoilers: Boolean(l.hasSpoilers),
        likesCount: 0,
        commentsCount: 0,
        tags: l.tags,
      }));
    const communityWithLikes = communityReviews.map((r) => {
      const baseline = Boolean(r.isUserLiked);
      const liked = state.likedReviewIds.includes(r.id) !== baseline;
      return { ...r, isUserLiked: liked, likesCount: r.likesCount + (liked === baseline ? 0 : liked ? 1 : -1) };
    });
    const year = String(state.profile.readingGoal.year);
    const readSet = new Set([...state.readIds, ...state.logs.map((l) => l.bookId)]);
    return {
      allLists: [...state.lists, ...communityLists],
      myReviews,
      allReviews: [...myReviews, ...communityWithLikes],
      readCount: readSet.size,
      thisYearCount: state.logs.filter((l) => l.dateFinished.startsWith(year)).length,
      unreadNotifications: state.notifications.filter((n) => !n.isRead).length,
      ratingFor: (bookId: string) => state.logs.find((l) => l.bookId === bookId && l.rating > 0)?.rating || 0,
      resolve,
    };
  }, [state.logs, state.profile, state.likedReviewIds, state.readIds, state.lists, state.notifications, resolve]);

  const value: LibraryContextValue = { ...state, ...derived, session, actions };
  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
};

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used inside LibraryProvider');
  return ctx;
}
