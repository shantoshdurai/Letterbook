import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

// Letterbook mark: three book spines on a shelf (orange, green, and a leaning blue).
// Kept in sync with public/logo.svg and the story-card renderer in lib/storyCard.ts.
export const BrandMark: React.FC<{ className?: string; title?: string }> = ({ className = 'w-7 h-7', title }) => (
  <svg viewBox="0 0 48 48" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
    <g transform="translate(-3.4 0.9)">
    <rect x="9" y="13" width="8" height="25" rx="2" fill="#FF8000" />
    <rect x="9" y="17" width="8" height="2.2" fill="#14181c" opacity=".35" />
    <rect x="19" y="8" width="8" height="30" rx="2" fill="#15E558" />
    <rect x="19" y="12" width="8" height="2.2" fill="#14181c" opacity=".35" />
    <g transform="rotate(20 36.5 38)">
      <rect x="29" y="12" width="8" height="26" rx="2" fill="#40BCF4" />
      <rect x="29" y="16" width="8" height="2.2" fill="#14181c" opacity=".35" />
    </g>
    </g>
  </svg>
);

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  className = ''
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-11 h-11',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-1.5 select-none ${className}`}>
      <BrandMark className={`${iconSizes[size]} shrink-0`} title={showText ? undefined : 'Letterbook'} />
      {showText && (
        <span className={`text-white font-sans font-extrabold tracking-tight ${textSizes[size]}`}>
          Letterbook
        </span>
      )}
    </div>
  );
};
