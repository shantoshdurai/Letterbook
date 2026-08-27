import { Book, Review, BookList, Article, UserProfile, FriendActivity, NotificationItem } from '../types';

export const initialBooks: Book[] = [
  {
    id: 'dune',
    title: 'Dune',
    originalTitle: 'Dune (Frank Herbert\'s Dune Chronicles #1)',
    author: 'Frank Herbert',
    authorId: 'frank-herbert',
    authorAvatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
    year: 1965,
    coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
    backdropImage: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&auto=format&fit=crop&q=80',
    synopsis: 'Set on the desert planet Arrakis, Dune tells the story of Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, who must travel to the most dangerous planet in the universe to ensure the future of his family and his people.',
    pageCount: 688,
    audioLength: '21h 02m',
    genres: ['Sci-Fi', 'Epic Fantasy', 'Space Opera', 'Classic'],
    averageRating: 4.6,
    ratingsCount: 48219,
    reviewsCount: 14205,
    readersCount: 92830,
    watchlistCount: 31400,
    likedCount: 38400,
    ratingDistribution: [120, 240, 680, 1400, 2900, 4800, 8900, 14500, 21000, 32000],
    tagline: 'Fear is the mind-killer.',
    isbn: '978-0441172719',
    publisher: 'Chilton Books / Ace Science Fiction',
    availableOn: [
      { service: 'Audible', type: 'audio', link: '#' },
      { service: 'Kindle', type: 'ebook', link: '#' },
      { service: 'Libby', type: 'library', link: '#' },
      { service: 'Bookshop.org', type: 'print', link: '#' }
    ],
    quotes: [
      'I must not fear. Fear is the mind-killer. Fear is the little-death that brings total obliteration.',
      'The mystery of life isn\'t a problem to solve, but a reality to experience.',
      'Deep in the human unconscious is a pervasive need for a logical universe that makes sense.'
    ]
  },
  {
    id: 'tomorrow-and-tomorrow',
    title: 'Tomorrow, and Tomorrow, and Tomorrow',
    originalTitle: 'Tomorrow, and Tomorrow, and Tomorrow: A Novel',
    author: 'Gabrielle Zevin',
    authorId: 'gabrielle-zevin',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    year: 2022,
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    backdropImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
    synopsis: 'Two childhood friends, Sam and Sadie, reconnect in college and build a legendary video game design company. Spanning thirty years, from Cambridge to Venice Beach and across the globe, it is a dazzling and intricately imagined novel about identity, creativity, heartbreak, and redemption.',
    pageCount: 416,
    audioLength: '14h 12m',
    genres: ['Literary Fiction', 'Contemporary', 'Coming of Age', 'Romance'],
    averageRating: 4.4,
    ratingsCount: 36500,
    reviewsCount: 11200,
    readersCount: 71200,
    watchlistCount: 28900,
    likedCount: 29400,
    ratingDistribution: [190, 310, 850, 1900, 3400, 5600, 9200, 13100, 17800, 22100],
    tagline: 'To allow yourself to play with another person is no small risk.',
    isbn: '978-0593321201',
    publisher: 'Knopf',
    availableOn: [
      { service: 'Audible', type: 'audio', link: '#' },
      { service: 'Kindle', type: 'ebook', link: '#' },
      { service: 'Apple Books', type: 'ebook', link: '#' },
      { service: 'Bookshop.org', type: 'print', link: '#' }
    ],
    quotes: [
      'To allow yourself to play with another person is no small risk. It means allowing yourself to be open, to be exposed.',
      'There is a time for any work of art when it is only potential.'
    ]
  },
  {
    id: 'yellowface',
    title: 'Yellowface',
    originalTitle: 'Yellowface: A Novel',
    author: 'R.F. Kuang',
    authorId: 'rf-kuang',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    year: 2023,
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80',
    backdropImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1200&auto=format&fit=crop&q=80',
    synopsis: 'Athena Liu is a literary darling and June Hayward is literally nobody. When Athena dies in a freak accident, June steals Athena’s just-finished masterpiece about Chinese laborers during WWI, edits it, and submits it under a new pen name: Juniper Song.',
    pageCount: 336,
    audioLength: '8h 47m',
    genres: ['Satire', 'Thriller', 'Literary Fiction', 'Mystery'],
    averageRating: 4.1,
    ratingsCount: 29800,
    reviewsCount: 9400,
    readersCount: 59000,
    watchlistCount: 21300,
    likedCount: 22100,
    ratingDistribution: [300, 520, 1200, 2800, 4200, 6800, 8900, 11400, 14200, 16900],
    tagline: 'What would you do to be the next big literary sensation?',
    isbn: '978-0063250833',
    publisher: 'William Morrow',
    availableOn: [
      { service: 'Audible', type: 'audio', link: '#' },
      { service: 'Kindle', type: 'ebook', link: '#' },
      { service: 'Libby', type: 'library', link: '#' }
    ]
  },
  {
    id: 'the-secret-history',
    title: 'The Secret History',
    originalTitle: 'The Secret History',
    author: 'Donna Tartt',
    authorId: 'donna-tartt',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    year: 1992,
    coverImage: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=600&auto=format&fit=crop&q=80',
    backdropImage: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1200&auto=format&fit=crop&q=80',
    synopsis: 'Under the influence of their charismatic classics professor, a group of clever, eccentric misfits at an elite New England college discover a way of thinking and living that is a world away from the humdrum existence of their contemporaries.',
    pageCount: 559,
    audioLength: '22h 05m',
    genres: ['Dark Academia', 'Mystery', 'Psychological Fiction', 'Classic'],
    averageRating: 4.5,
    ratingsCount: 51200,
    reviewsCount: 18400,
    readersCount: 104000,
    watchlistCount: 42100,
    likedCount: 48900,
    ratingDistribution: [140, 220, 610, 1200, 2600, 4900, 8200, 13400, 21900, 34500],
    tagline: 'Beauty is terror. Whatever we call beautiful, we quiver before it.',
    isbn: '978-1400031702',
    publisher: 'Alfred A. Knopf',
    availableOn: [
      { service: 'Audible', type: 'audio', link: '#' },
      { service: 'Kindle', type: 'ebook', link: '#' },
      { service: 'Bookshop.org', type: 'print', link: '#' }
    ]
  },
  {
    id: 'intermezzo',
    title: 'Intermezzo',
    originalTitle: 'Intermezzo: A Novel',
    author: 'Sally Rooney',
    authorId: 'sally-rooney',
    authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    year: 2024,
    coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&auto=format&fit=crop&q=80',
    backdropImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&auto=format&fit=crop&q=80',
    synopsis: 'An exquisite story of two brothers, Peter and Ivan Koubek, navigating grief, desire, and the complex entanglements of human connection in the aftermath of their father’s death in Dublin.',
    pageCount: 448,
    audioLength: '13h 40m',
    genres: ['Literary Fiction', 'Contemporary', 'Irish Literature'],
    averageRating: 4.3,
    ratingsCount: 19400,
    reviewsCount: 5600,
    readersCount: 38200,
    watchlistCount: 34100,
    likedCount: 16800,
    ratingDistribution: [110, 240, 590, 1300, 2400, 3900, 5800, 8200, 11400, 14600],
    tagline: 'An intermezzo: between grief, desire, and new beginnings.',
    isbn: '978-0374602635',
    publisher: 'Farrar, Straus and Giroux',
    availableOn: [
      { service: 'Audible', type: 'audio', link: '#' },
      { service: 'Kindle', type: 'ebook', link: '#' },
      { service: 'Bookshop.org', type: 'print', link: '#' }
    ]
  },
  {
    id: 'babel',
    title: 'Babel: Or the Necessity of Violence',
    originalTitle: 'Babel, or the Necessity of Violence: An Arcane History of the Oxford Translators\' Revolution',
    author: 'R.F. Kuang',
    authorId: 'rf-kuang',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    year: 2022,
    coverImage: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?w=600&auto=format&fit=crop&q=80',
    backdropImage: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1200&auto=format&fit=crop&q=80',
    synopsis: 'Oxford, 1836. The city of dreaming spires. It is the world centre of translation and, more importantly, magic. Silver-working — the art of manifesting the meaning lost in translation using enchanted silver bars — to power the British Empire.',
    pageCount: 544,
    audioLength: '21h 45m',
    genres: ['Historical Fantasy', 'Dark Academia', 'Alternate History'],
    averageRating: 4.5,
    ratingsCount: 42100,
    reviewsCount: 13900,
    readersCount: 84000,
    watchlistCount: 39000,
    likedCount: 37200,
    ratingDistribution: [150, 280, 710, 1500, 3100, 5200, 8900, 14200, 22100, 31000],
    tagline: 'Translation is always a betrayal.',
    isbn: '978-0063021426',
    publisher: 'Harper Voyager',
    availableOn: [
      { service: 'Audible', type: 'audio', link: '#' },
      { service: 'Kindle', type: 'ebook', link: '#' },
      { service: 'Bookshop.org', type: 'print', link: '#' }
    ]
  },
  {
    id: 'piranesi',
    title: 'Piranesi',
    originalTitle: 'Piranesi',
    author: 'Susanna Clarke',
    authorId: 'susanna-clarke',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    year: 2020,
    coverImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
    backdropImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
    synopsis: 'Piranesi lives in the House. Perhaps he always has. In his notebooks day after day he makes a clear and careful record of its wonders: the labyrinth of halls, the thousands upon thousands of statues, the tides that surge up staircases.',
    pageCount: 245,
    audioLength: '6h 58m',
    genres: ['Fantasy', 'Mystery', 'Magical Realism', 'Philosophical'],
    averageRating: 4.6,
    ratingsCount: 38900,
    reviewsCount: 12400,
    readersCount: 76000,
    watchlistCount: 29000,
    likedCount: 34500,
    ratingDistribution: [90, 180, 510, 1100, 2200, 4100, 7500, 12800, 20100, 29800],
    tagline: 'The Beauty of the House is immeasurable; its Kindness infinite.',
    isbn: '978-1635575637',
    publisher: 'Bloomsbury Publishing',
    availableOn: [
      { service: 'Audible', type: 'audio', link: '#' },
      { service: 'Kindle', type: 'ebook', link: '#' },
      { service: 'Libby', type: 'library', link: '#' }
    ]
  },
  {
    id: 'klara-and-the-sun',
    title: 'Klara and the Sun',
    originalTitle: 'Klara and the Sun',
    author: 'Kazuo Ishiguro',
    authorId: 'kazuo-ishiguro',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    year: 2021,
    coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e37b73?w=600&auto=format&fit=crop&q=80',
    backdropImage: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1200&auto=format&fit=crop&q=80',
    synopsis: 'Klara is an Artificial Friend with outstanding observational qualities, who, from her place in the store, watches carefully the behaviour of those who come in to browse, and of those who pass in the street outside. She remains hopeful a customer will soon choose her.',
    pageCount: 303,
    audioLength: '10h 16m',
    genres: ['Sci-Fi', 'Literary Fiction', 'Dystopian'],
    averageRating: 4.2,
    ratingsCount: 31200,
    reviewsCount: 8900,
    readersCount: 64000,
    watchlistCount: 22000,
    likedCount: 24300,
    ratingDistribution: [210, 430, 990, 2200, 3900, 5900, 8400, 11900, 15300, 18200],
    tagline: 'Do you believe in the human heart?',
    isbn: '978-0593318171',
    publisher: 'Knopf',
    availableOn: [
      { service: 'Audible', type: 'audio', link: '#' },
      { service: 'Kindle', type: 'ebook', link: '#' }
    ]
  }
];

export const initialReviews: Review[] = [
  {
    id: 'rev-1',
    bookId: 'tomorrow-and-tomorrow',
    userId: 'user-elena',
    userName: 'Elena Rostova',
    userHandle: '@elenareads',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    liked: true,
    content: '“There is a time for any work of art when it is only potential.” This sentence destroyed me. The depiction of platonic soulmates building virtual worlds while real life unravels around them is unparalleled. Sadie and Sam feel as real to me as childhood friends.',
    date: '2 days ago',
    readDate: 'Aug 24, 2026',
    format: 'physical',
    hasSpoilers: false,
    likesCount: 342,
    commentsCount: 28,
    tags: ['cried', 'all-time-faves', 'gaming'],
    isUserLiked: false
  },
  {
    id: 'rev-2',
    bookId: 'the-secret-history',
    userId: 'user-julian',
    userName: 'Julian Morrow',
    userHandle: '@classics_dark',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    liked: true,
    content: 'Re-reading this every autumn is not just a habit, it is a spiritual necessity. Donna Tartt captured the seductive intoxication of aesthetic obsession like no other writer of our century.',
    date: '1 week ago',
    readDate: 'Aug 18, 2026',
    format: 'physical',
    hasSpoilers: false,
    likesCount: 890,
    commentsCount: 64,
    tags: ['dark-academia', 'autumn-reads', 're-read'],
    isUserLiked: true
  },
  {
    id: 'rev-3',
    bookId: 'dune',
    userId: 'user-arrakis',
    userName: 'Marcus Vance',
    userHandle: '@scifimarco',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    rating: 4.5,
    liked: true,
    content: 'Herbert\'s worldbuilding is so dense and tactile you can taste the cinnamon spice in the air and feel the grit of Arrakis sand between your teeth. The political intrigue still holds up 60 years later.',
    date: 'Aug 12, 2026',
    readDate: 'Aug 10, 2026',
    format: 'ebook',
    hasSpoilers: false,
    likesCount: 412,
    commentsCount: 19,
    tags: ['sci-fi-masterpiece', 'worldbuilding'],
    isUserLiked: false
  },
  {
    id: 'rev-4',
    bookId: 'yellowface',
    userId: 'user-sophia',
    userName: 'Sophia Lin',
    userHandle: '@sophialit',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    rating: 4.0,
    liked: true,
    content: 'Reading this was like watching a slow-motion 100mph train crash where you cannot look away. June Hayward is one of the most delightfully unhinged and deluded narrators ever put on page.',
    date: 'Aug 05, 2026',
    readDate: 'Aug 03, 2026',
    format: 'audiobook',
    hasSpoilers: false,
    likesCount: 524,
    commentsCount: 43,
    tags: ['audiobook-performance', 'publishing-drama'],
    isUserLiked: false
  }
];

export const initialLists: BookList[] = [
  {
    id: 'list-dark-academia',
    title: 'Essential Dark Academia: Tweed, Greek Tragedies & Rainy Libraries',
    description: 'The definitive canon of obsession, ancient languages, collegiate murder, and moral decay.',
    creatorId: 'user-julian',
    creatorName: 'Julian Morrow',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    books: [initialBooks[3], initialBooks[5], initialBooks[6]],
    likesCount: 1240,
    commentsCount: 88,
    isRanked: true,
    tags: ['Dark Academia', 'Collegiate', 'Obsession', 'Mystery'],
    updatedAt: '2 days ago'
  },
  {
    id: 'list-modern-masterpieces',
    title: 'The 2020s Literary Fiction Pantheon',
    description: 'Novels written in this decade that will still be studied fifty years from now.',
    creatorId: 'user-elena',
    creatorName: 'Elena Rostova',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    books: [initialBooks[1], initialBooks[4], initialBooks[6], initialBooks[7]],
    likesCount: 2150,
    commentsCount: 142,
    isRanked: false,
    tags: ['Contemporary', 'Literary', 'Award Winners', '2020s'],
    updatedAt: 'Yesterday'
  },
  {
    id: 'list-sci-fi-epics',
    title: 'Space Operas & Cosmic Philosophy',
    description: 'Immersive worlds exploring destiny, artificial intelligence, and ecology.',
    creatorId: 'user-arrakis',
    creatorName: 'Marcus Vance',
    creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    books: [initialBooks[0], initialBooks[7], initialBooks[5]],
    likesCount: 980,
    commentsCount: 52,
    isRanked: false,
    tags: ['Sci-Fi', 'Space Opera', 'AI', 'Philosophy'],
    updatedAt: '1 week ago'
  }
];

export const initialArticles: Article[] = [
  {
    id: 'article-intermezzo-deep-dive',
    title: 'Why Sally Rooney’s ‘Intermezzo’ is Her Most Emotionally Mature Novel Yet',
    subtitle: 'Moving beyond college angst into the weight of fraternal grief, chess masteries, and age-gap love.',
    author: 'Clara Delacroix',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    date: 'Aug 25, 2026',
    readTime: '6 min read',
    coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&auto=format&fit=crop&q=80',
    content: [
      'In *Intermezzo*, Sally Rooney pivots away from the claustrophobic campus romances that defined *Normal People* into something richer and considerably more textured: the sudden rupture of sibling dynamics under the weight of paternal bereavement.',
      'The book alternatingly follows Peter, a slick 30-something Dublin lawyer battling prescription dependency, and Ivan, a 22-year-old competitive chess prodigy who perceives social interactions as complex endgame puzzles.',
      'Rooney experiments with free indirect discourse and rhythmic fragmentation in a manner reminiscent of Virginia Woolf’s *The Waves*. It is, without reservation, the most formidable book of the year.'
    ],
    featuredBookIds: ['intermezzo'],
    likesCount: 680
  },
  {
    id: 'article-dark-academia-renaissance',
    title: 'The Unstoppable Grip of Dark Academia in the Digital Age',
    subtitle: 'From Donna Tartt\'s 1992 masterpiece to R.F. Kuang\'s Babel, why readers crave collegiate tragedy.',
    author: 'Julian Morrow',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    date: 'Aug 20, 2026',
    readTime: '8 min read',
    coverImage: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1200&auto=format&fit=crop&q=80',
    content: [
      'What is it about antique bindings, rainy Gothic quadrangles, and young scholars spiraling toward catastrophe that makes dark academia one of the most resilient subgenres in modern publishing?',
      'At its heart, dark academia satisfies our longing for deep aesthetic absorption in an era of 15-second algorithmic distraction.',
      'Donna Tartt gave us the blueprint in *The Secret History*, and thirty years later R.F. Kuang inverted the trope with *Babel*, interrogating the colonial silver-working power structures behind Oxford’s dreaming spires.'
    ],
    featuredBookIds: ['the-secret-history', 'babel'],
    likesCount: 1420
  }
];

export const currentUserProfile: UserProfile = {
  id: 'me',
  name: 'Maya Rivers',
  handle: '@mayabooks',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  bio: 'Literary omnivore & spine enthusiast. Coffee, late night marginalia, and mid-century modern paperbacks.',
  location: 'San Francisco, CA',
  joinedYear: 2024,
  favoriteBookIds: ['the-secret-history', 'tomorrow-and-tomorrow', 'piranesi', 'dune'],
  followersCount: 1840,
  followingCount: 310,
  readingGoal: {
    year: 2026,
    target: 50,
    completed: 34
  },
  stats: {
    booksRead: 142,
    pagesRead: 49820,
    hoursListened: 186,
    listsCount: 8,
    reviewsCount: 67
  },
  badges: [
    {
      id: 'b1',
      name: 'Century Reader',
      description: 'Logged over 100 books',
      icon: 'BookOpen',
      unlockedAt: 'May 2026'
    },
    {
      id: 'b2',
      name: 'Midnight Scholar',
      description: 'Reviewed 10 Dark Academia titles',
      icon: 'Moon',
      unlockedAt: 'June 2026'
    },
    {
      id: 'b3',
      name: 'Audiophile Pro',
      description: 'Logged over 150 hours of audiobooks',
      icon: 'Headphones',
      unlockedAt: 'July 2026'
    },
    {
      id: 'b4',
      name: 'Top Reviewer',
      description: 'Received over 1,000 likes on reviews',
      icon: 'Award',
      unlockedAt: 'Aug 2026'
    }
  ]
};

export const initialFriendActivities: FriendActivity[] = [
  {
    id: 'act-1',
    user: {
      id: 'user-behaind',
      name: 'BeHaind',
      handle: '@behaind',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    type: 'added_watchlist',
    book: initialBooks[0],
    timestamp: '2h',
    likesCount: 14,
    isLiked: false
  },
  {
    id: 'act-2',
    user: {
      id: 'user-robert',
      name: 'Robert',
      handle: '@robert_c',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    type: 'reviewed',
    book: initialBooks[1],
    review: initialReviews[0],
    rating: 4.5,
    timestamp: '5h',
    likesCount: 52,
    isLiked: true
  },
  {
    id: 'act-3',
    user: {
      id: 'user-dave',
      name: 'Dave Vis',
      handle: '@davevis',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    },
    type: 'logged',
    book: initialBooks[2],
    rating: 3.5,
    timestamp: '12h',
    likesCount: 29,
    isLiked: false
  },
  {
    id: 'act-4',
    user: {
      id: 'user-rebecca',
      name: 'Rebecca',
      handle: '@rebeccareads',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    },
    type: 'reviewed',
    book: initialBooks[3],
    review: initialReviews[1],
    rating: 4.0,
    timestamp: '1d',
    likesCount: 88,
    isLiked: true
  },
  {
    id: 'act-5',
    user: {
      id: 'user-joseph',
      name: 'Joseph',
      handle: '@joseph_pages',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
    },
    type: 'logged',
    book: initialBooks[4],
    rating: 5.0,
    timestamp: '2d',
    likesCount: 19,
    isLiked: false
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    user: {
      name: 'BeHaind',
      handle: '@behaind',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    type: 'watchlist',
    targetBook: initialBooks[0], // Dune
    timestamp: '6h',
    isRead: false
  },
  {
    id: 'notif-2',
    user: {
      name: 'Robert',
      handle: '@robert_c',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    type: 'rating',
    targetBook: initialBooks[1], // Tomorrow, and Tomorrow, and Tomorrow
    rating: 4.5,
    timestamp: '8h',
    isRead: false
  },
  {
    id: 'notif-3',
    user: {
      name: 'Dave Vis',
      handle: '@davevis',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    },
    type: 'list',
    targetBook: initialBooks[4], // Piranesi
    targetListTitle: 'Masterpiece Literature of 2026',
    timestamp: '12h',
    isRead: true
  },
  {
    id: 'notif-4',
    user: {
      name: 'Rebecca',
      handle: '@rebeccareads',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    },
    type: 'follow',
    timestamp: '1d',
    isRead: true
  },
  {
    id: 'notif-5',
    user: {
      name: 'BeHaind',
      handle: '@behaind',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    type: 'watchlist',
    targetBook: initialBooks[2], // The Secret History
    timestamp: '1d',
    isRead: true
  },
  {
    id: 'notif-6',
    user: {
      name: 'Rebecca',
      handle: '@rebeccareads',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    },
    type: 'follow',
    timestamp: '2d',
    isRead: true
  },
  {
    id: 'notif-7',
    user: {
      name: 'Dave Vis',
      handle: '@davevis',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    },
    type: 'review',
    targetBook: initialBooks[3], // Yellowface
    rating: 3.5,
    reviewExcerpt: "I've been meaning to read this after seeing so many people praising it and I'm a big fan of literary satire...",
    timestamp: '2d',
    isRead: true
  },
  {
    id: 'notif-8',
    user: {
      name: 'Robert',
      handle: '@robert_c',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    type: 'like_review',
    targetBook: initialBooks[2],
    timestamp: '2d',
    isRead: true
  }
];
