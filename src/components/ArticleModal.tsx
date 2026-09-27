import React from 'react';
import { Heart, Share2, ArrowLeft } from 'lucide-react';
import { useLibrary } from '../state/library';
import { useUI } from '../state/ui';
import { journalArticles } from '../data/seed';
import { shareOrCopy } from '../lib/share';
import { Avatar, BookPoster, EmptyState, OverlayScreen, ScreenHeader } from './ui';

// Journal copy uses *asterisks* for titles; render them as italics.
function renderInline(text: string) {
  return text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith('*') && part.endsWith('*') ? <em key={i} className="font-serif text-white">{part.slice(1, -1)}</em> : <React.Fragment key={i}>{part}</React.Fragment>,
  );
}

export const ArticleModal: React.FC<{ z: number; articleId: string }> = ({ z, articleId }) => {
  const lib = useLibrary();
  const ui = useUI();
  const article = journalArticles.find((a) => a.id === articleId);

  if (!article) {
    return (
      <OverlayScreen z={z} label="Article">
        <ScreenHeader title="Journal" onBack={ui.close} />
        <EmptyState title="Article not found" />
      </OverlayScreen>
    );
  }

  const liked = lib.likedArticleIds.includes(article.id);
  const featured = lib.resolve(article.featuredBookIds);

  return (
    <OverlayScreen z={z} label={article.title} className="pb-safe">
      <div className="relative h-60 w-full overflow-hidden bg-[#18222e]">
        <img src={article.coverImage} alt="" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#14181c] via-[#14181c]/40 to-transparent" />
        <div className="absolute top-0 inset-x-0 pt-safe">
          <div className="px-3 pt-3 flex items-center justify-between">
            <button type="button" onClick={ui.close} aria-label="Back" className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/10">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={async () => {
                const r = await shareOrCopy({ title: article.title, text: `${article.title} — ${article.subtitle}` });
                if (r === 'copied') ui.toast('Copied to clipboard');
              }}
              aria-label="Share article"
              className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/10"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <article className="px-5 -mt-12 relative space-y-5 pb-10">
        <span className="inline-block px-2 py-0.5 rounded bg-[#00E054] text-black font-mono text-[10px] font-bold uppercase tracking-wider">Letterbook Journal</span>
        <header>
          <h1 className="text-2xl font-extrabold text-white tracking-tight leading-tight">{article.title}</h1>
          <p className="text-sm text-[#9eb0c3] font-serif italic mt-2">{article.subtitle}</p>
        </header>

        <div className="flex items-center justify-between py-3 border-y border-[#232f3e] text-xs">
          <div className="flex items-center gap-2.5">
            <Avatar src={article.authorAvatar} name={article.author} className="w-8 h-8" />
            <div>
              <span className="font-bold text-white block">{article.author}</span>
              <span className="text-[10px] text-[#6c7f96]">{article.date} · {article.readTime}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => lib.actions.toggleArticleLike(article.id)}
            aria-pressed={liked}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${liked ? 'border-[#FF8000] text-[#FF8000] bg-[#FF8000]/10' : 'border-[#293849] text-[#8fa0b5]'}`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-[#FF8000]' : ''}`} />
            <span className="font-mono">{article.likesCount + (liked ? 1 : 0)}</span>
          </button>
        </div>

        <div className="space-y-4 text-[15px] leading-relaxed text-[#d0dbe7]">
          {article.content.map((p, idx) => <p key={idx}>{renderInline(p)}</p>)}
        </div>

        {featured.length > 0 && (
          <section className="pt-5 border-t border-[#232f3e] space-y-3" aria-label="Books in this article">
            <h2 className="text-xs font-bold text-[#8fa0b5] uppercase tracking-wider">Books in this piece</h2>
            <div className="grid grid-cols-3 gap-3">
              {featured.map((b) => (
                <BookPoster
                  key={b.id}
                  book={b}
                  showTitle
                  onSelect={(x) => ui.open({ type: 'book', book: x })}
                  onLongPress={(x) => ui.open({ type: 'quickMenu', bookId: x.id })}
                  isWatchlisted={lib.watchlistIds.includes(b.id)}
                  onToggleWatchlist={(x) => ui.toast(lib.actions.toggleWatchlist(x) ? 'Added to watchlist' : 'Removed from watchlist')}
                />
              ))}
            </div>
          </section>
        )}
      </article>
    </OverlayScreen>
  );
};
