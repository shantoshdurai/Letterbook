import React from 'react';
import { Star, Heart } from 'lucide-react';

interface RatingStarsProps {
  rating: number; // 0.0 to 5.0
  maxRating?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showNumber?: boolean;
  interactive?: boolean;
  liked?: boolean;
  showLiked?: boolean;
  onRatingChange?: (newRating: number) => void;
  onLikeToggle?: () => void;
  color?: string; // default #00e054 / #15E558
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  showNumber = false,
  interactive = false,
  liked = false,
  showLiked = false,
  onRatingChange,
  onLikeToggle,
  color = '#15E558'
}) => {
  const sizeMap = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-7 h-7'
  };

  const handleStarClick = (index: number, isHalf: boolean) => {
    if (!interactive || !onRatingChange) return;
    const value = isHalf ? index + 0.5 : index + 1;
    onRatingChange(rating === value ? 0 : value);
  };

  const stars = [];
  for (let i = 0; i < maxRating; i++) {
    const isFull = rating >= i + 1;
    const isHalf = !isFull && rating >= i + 0.5;

    stars.push(
      <div 
        key={i} 
        className={`relative inline-block ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
      >
        {interactive ? (
          <div className="flex items-center">
            {/* Left half clickable */}
            <div 
              className="absolute left-0 top-0 w-1/2 h-full z-10"
              onClick={() => handleStarClick(i, true)}
              title={`${i + 0.5} stars`}
            />
            {/* Right half clickable */}
            <div 
              className="absolute right-0 top-0 w-1/2 h-full z-10"
              onClick={() => handleStarClick(i, false)}
              title={`${i + 1} stars`}
            />
          </div>
        ) : null}

        {/* Star Graphic */}
        {isFull ? (
          <Star className={`${sizeMap[size]} fill-[${color}] text-[${color}]`} style={{ fill: color, color }} />
        ) : isHalf ? (
          <div className="relative">
            <Star className={`${sizeMap[size]} text-[#2d3a4b] fill-[#1d2733]`} />
            <div className="absolute inset-0 overflow-hidden w-[50%]">
              <Star className={`${sizeMap[size]} fill-[${color}] text-[${color}]`} style={{ fill: color, color }} />
            </div>
          </div>
        ) : (
          <Star className={`${sizeMap[size]} text-[#2a3746] fill-[#151c24]`} />
        )}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1" id="letterbook-rating-stars">
      <div className="flex items-center gap-0.5">
        {stars}
      </div>

      {showLiked && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onLikeToggle?.();
          }}
          className={`ml-1 transition-transform ${interactive ? 'cursor-pointer hover:scale-125' : ''}`}
        >
          <Heart 
            className={`${sizeMap[size]} ${liked ? 'fill-[#FF8000] text-[#FF8000]' : 'text-[#485b73] fill-transparent'}`} 
          />
        </button>
      )}

      {showNumber && (
        <span className="text-xs font-mono font-medium text-[#8fa0b5] ml-1">
          {rating > 0 ? rating.toFixed(1) : '—'}
        </span>
      )}
    </div>
  );
};
