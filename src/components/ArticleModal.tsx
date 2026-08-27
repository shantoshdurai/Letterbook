import React from 'react';
import { Article, Book } from '../types';
import { BookCoverCard } from './BookCoverCard';
import { X, Heart } from 'lucide-react';

interface ArticleModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
  featuredBooks: Book[];
  onSelectBook: (book: Book) => void;
  onToggleWatchlist: (book: Book, e: React.MouseEvent) => void;
  watchlistBookIds: string[];
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  isOpen,
  onClose,
  featuredBooks,
  onSelectBook,
  onToggleWatchlist,
  watchlistBookIds,
}) => {
  if (!isOpen || !article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/90 backdrop-blur-md overflow-y-auto" id="article-modal">
      <div className="relative w-full max-w-2xl bg-[#121820] border-x border-b border-[#232f3e] min-h-screen pb-24 text-white shadow-2xl">
        {/* Floating Close */}
        <button
          type="button"
          onClick={onClose}
          className="fixed top-4 right-4 sm:right-auto sm:left-[calc(50%+280px)] z-50 p-2.5 rounded-full bg-black/80 text-white hover:bg-[#15E558] hover:text-black border border-white/20 transition-all shadow-xl"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Cover Hero */}
        <div className="relative h-60 w-full overflow-hidden bg-[#18222e]">
          <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121820] via-[#121820]/40 to-transparent" />
          <div className="absolute top-4 left-6">
            <span className="px-2.5 py-1 rounded bg-[#15E558] text-black font-mono text-[10px] font-bold uppercase tracking-wider">
              Letterbook Journal
            </span>
          </div>
        </div>

        {/* Article Body */}
        <div className="px-6 -mt-10 relative space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {article.title}
            </h1>
            <p className="text-sm text-[#9eb0c3] font-serif italic mt-2">
              {article.subtitle}
            </p>
          </div>

          {/* Author line */}
          <div className="flex items-center justify-between py-3 border-y border-[#232f3e] text-xs text-[#8fa0b5]">
            <div className="flex items-center gap-2.5">
              <img
                src={article.authorAvatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"}
                alt={article.author || "Author"}
                className="w-8 h-8 rounded-full object-cover border border-[#394c61]"
              />
              <div>
                <span className="font-bold text-white block">{article.author || "Author"}</span>
                <div className="flex items-center gap-2 text-[10px] text-[#6c7f96]">
                  <span>{article.date}</span>
                  <span>•</span>
                  <span>{article.readTime}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#FF8000]">
              <Heart className="w-4 h-4 fill-[#FF8000]" />
              <span className="font-mono">{article.likesCount}</span>
            </div>
          </div>

          {/* Paragraphs */}
          <div className="space-y-4 text-sm leading-relaxed text-[#d0dbe7] font-light">
            {article.content.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          {/* Featured Books in Article */}
          {featuredBooks.length > 0 && (
            <div className="pt-6 border-t border-[#232f3e] space-y-3">
              <h3 className="text-xs font-mono font-bold text-[#8fa0b5] uppercase tracking-wider">
                Books Discussed in this Essay
              </h3>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {featuredBooks.map(b => (
                  <BookCoverCard
                    key={b.id}
                    book={b}
                    size="sm"
                    isWatchlisted={watchlistBookIds.includes(b.id)}
                    onSelect={onSelectBook}
                    onToggleWatchlist={onToggleWatchlist}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
