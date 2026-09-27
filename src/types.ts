export type ReadingFormat = 'physical' | 'ebook' | 'audiobook';

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userHandle: string;
  rating: number; // 0 (unrated) or 0.5 to 5.0
  liked: boolean;
  content: string;
  date: string; // ISO date, or a relative label for community seed content
  readDate?: string;
  format?: ReadingFormat;
  hasSpoilers: boolean;
  likesCount: number;
  commentsCount: number;
  tags?: string[];
  isUserLiked?: boolean;
  logId?: string; // set on reviews written from the user's own diary entries
}

export interface Book {
  id: string;
  title: string;
  author: string;
  authorKey?: string; // Open Library author key, e.g. OL7422948A
  year: number;
  coverImage: string;
  backdropImage?: string;
  synopsis: string;
  pageCount: number;
  audioLength?: string;
  genres: string[];
  averageRating: number;
  ratingsCount: number;
  reviewsCount: number;
  readersCount: number;
  watchlistCount: number;
  likedCount: number;
  ratingDistribution: number[]; // 10 buckets (0.5 to 5.0 stars)
  tagline?: string;
  isbn?: string;
  publisher?: string;
  olKey?: string; // Open Library work key, e.g. /works/OL893414W
  quotes?: string[];
}

export interface ReadingLogEntry {
  id: string;
  bookId: string;
  dateFinished: string; // YYYY-MM-DD
  rating: number; // 0 = not rated
  liked: boolean;
  review?: string;
  hasSpoilers?: boolean;
  isReRead?: boolean;
  format: ReadingFormat;
  tags: string[];
  createdAt?: string; // ISO timestamp
}

export interface BookList {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  bookIds: string[];
  likesCount: number;
  commentsCount: number;
  isRanked: boolean;
  isPrivate?: boolean;
  tags: string[];
  updatedAt: string; // ISO timestamp, or a relative label for community seed content
}

export interface Article {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  authorAvatar: string;
  date: string;
  readTime: string;
  coverImage: string;
  content: string[];
  featuredBookIds: string[];
  likesCount: number;
  category?: string;
  summary?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string; // URL or data: URI; empty string falls back to initials
  bio: string;
  location: string;
  joinedYear: number;
  favoriteBookIds: string[]; // Up to 4 favorites
  favoriteGenres: string[];
  followersCount: number;
  followingCount: number;
  readingGoal: {
    year: number;
    target: number;
  };
}

export interface AppSettings {
  spoilerShield: boolean;
  showStoryAfterLog: boolean;
}

export interface CommunityMember {
  id: string;
  name: string;
  handle: string;
  avatar: string;
}

export interface FriendActivity {
  id: string;
  user: CommunityMember;
  type: 'logged' | 'reviewed' | 'liked' | 'created_list' | 'added_watchlist';
  bookId?: string;
  review?: Review;
  rating?: number;
  liked?: boolean;
  timestamp: string;
  likesCount: number;
  isLiked?: boolean;
}

export interface NotificationItem {
  id: string;
  kind: 'system' | 'goal' | 'milestone' | 'list' | 'community';
  title: string;
  body?: string;
  bookId?: string;
  createdAt: string; // ISO timestamp
  isRead?: boolean;
}

export type ActiveTab = 'home' | 'search' | 'log' | 'lists' | 'profile';
