export type ReadingFormat = 'physical' | 'ebook' | 'audiobook';

export interface Author {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  bookCount: number;
}

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userHandle: string;
  rating: number; // 0.5 to 5.0
  liked: boolean;
  content: string;
  date: string;
  readDate?: string;
  format?: ReadingFormat;
  hasSpoilers: boolean;
  likesCount: number;
  commentsCount: number;
  tags?: string[];
  isUserLiked?: boolean;
}

export interface Book {
  id: string;
  title: string;
  originalTitle?: string;
  author: string;
  authorId: string;
  authorAvatar?: string;
  year: number;
  coverImage: string;
  backdropImage: string;
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
  availableOn?: {
    service: 'Audible' | 'Kindle' | 'Apple Books' | 'Libby' | 'Bookshop.org' | 'Local Bookstore';
    type: 'audio' | 'ebook' | 'print' | 'library';
    link: string;
  }[];
  quotes?: string[];
}

export interface ReadingLogEntry {
  id: string;
  bookId: string;
  dateFinished: string;
  rating: number;
  liked: boolean;
  review?: string;
  hasSpoilers?: boolean;
  isReRead?: boolean;
  format: ReadingFormat;
  tags: string[];
}

export interface BookList {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  books: Book[];
  likesCount: number;
  commentsCount: number;
  isRanked: boolean;
  isPrivate?: boolean;
  tags: string[];
  updatedAt: string;
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
  avatar: string;
  bio: string;
  location: string;
  joinedYear: number;
  favoriteBookIds: string[]; // Up to 4 favorites
  followersCount: number;
  followingCount: number;
  readingGoal: {
    year: number;
    target: number;
    completed: number;
  };
  stats: {
    booksRead: number;
    pagesRead: number;
    hoursListened: number;
    listsCount: number;
    reviewsCount: number;
  };
  badges: {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: string;
  }[];
}

export interface FriendActivity {
  id: string;
  user: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
  };
  type: 'logged' | 'reviewed' | 'liked' | 'created_list' | 'added_watchlist';
  book?: Book;
  list?: BookList;
  review?: Review;
  rating?: number;
  timestamp: string;
  likesCount: number;
  isLiked?: boolean;
}

export interface NotificationItem {
  id: string;
  user: {
    name: string;
    avatar: string;
    handle: string;
  };
  type: 'watchlist' | 'rating' | 'list' | 'follow' | 'review' | 'like_review';
  targetBook?: Book;
  targetListTitle?: string;
  rating?: number;
  liked?: boolean;
  reviewExcerpt?: string;
  timestamp: string;
  isRead?: boolean;
}

export type ActiveTab = 'home' | 'search' | 'log' | 'lists' | 'profile';
