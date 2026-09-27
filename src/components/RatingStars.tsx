import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number; // 0 to 5 in 0.5 steps
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showNumber?: boolean;
  interactive?: boolean;
  onRatingChange?: (newRating: number) => void;
  color?: string;
  label?: string;
}

const SIZES = {
  xs: 'w-3 h-3',
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-7 h-7',
  xl: 'w-9 h-9',
};

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  size = 'md',
  showNumber = false,
  interactive = false,
  onRatingChange,
  color = '#00E054',
  label = 'Rating',
}) => {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? rating;

  const set = (v: number) => {
    if (!onRatingChange) return;
    const clamped = Math.max(0, Math.min(5, v));
    onRatingChange(clamped === rating ? 0 : clamped); // tapping the current value clears it
  };

  const valueFromEvent = (e: React.MouseEvent<HTMLElement> | React.PointerEvent<HTMLElement>, index: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return e.clientX - rect.left < rect.width / 2 ? index + 0.5 : index + 1;
  };

  const stars = Array.from({ length: 5 }, (_, i) => {
    const full = shown >= i + 1;
    const half = !full && shown >= i + 0.5;
    const glyph = (
      <span className="relative inline-block">
        <Star className={SIZES[size]} style={{ color: '#2d3a4b', fill: '#1d2733' }} strokeWidth={1.5} />
        {(full || half) && (
          <span className="absolute inset-0 overflow-hidden" style={{ width: full ? '100%' : '50%' }}>
            <Star className={SIZES[size]} style={{ color, fill: color }} strokeWidth={1.5} />
          </span>
        )}
      </span>
    );
    if (!interactive) return <span key={i}>{glyph}</span>;
    return (
      <span
        key={i}
        className="cursor-pointer px-0.5 transition-transform active:scale-110"
        onPointerMove={(e) => e.pointerType === 'mouse' && setHover(valueFromEvent(e, i))}
        onClick={(e) => set(valueFromEvent(e, i))}
      >
        {glyph}
      </span>
    );
  });

  return (
    <span className="inline-flex items-center gap-1">
      {interactive ? (
        <span
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={5}
          aria-valuenow={rating}
          aria-valuetext={rating ? `${rating} stars` : 'Not rated'}
          onPointerLeave={() => setHover(null)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
              e.preventDefault();
              onRatingChange?.(Math.min(5, rating + 0.5));
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
              e.preventDefault();
              onRatingChange?.(Math.max(0, rating - 0.5));
            } else if (e.key === 'Delete' || e.key === 'Backspace' || e.key === '0') {
              onRatingChange?.(0);
            }
          }}
          className="inline-flex items-center rounded-md"
        >
          {stars}
        </span>
      ) : (
        <span className="inline-flex items-center gap-px" role="img" aria-label={rating ? `${rating} out of 5 stars` : 'Not rated'}>
          {stars}
        </span>
      )}
      {showNumber && (
        <span className="text-xs font-mono font-medium text-[#8fa0b5] ml-1 w-7">{shown > 0 ? shown.toFixed(1) : '—'}</span>
      )}
    </span>
  );
};
