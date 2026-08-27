import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  className = ''
}) => {
  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
    xl: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-sm font-bold tracking-tight',
    md: 'text-base font-extrabold tracking-tight',
    lg: 'text-xl font-extrabold tracking-tight',
    xl: 'text-2xl font-black tracking-tight'
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`} id="letterbox-brand-logo">
      {/* Bespoke Letterbox Modern Geometric Book-Box Emblem */}
      <div className={`relative ${iconSizes[size]} flex items-center justify-center shrink-0`}>
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_10px_rgba(21,229,88,0.4)]"
        >
          {/* Background Box Container */}
          <rect
            x="3"
            y="5"
            width="34"
            height="30"
            rx="7"
            fill="#18222d"
            stroke="#2a3a4d"
            strokeWidth="2"
          />
          {/* Subtle glowing interior accent */}
          <rect
            x="5"
            y="7"
            width="30"
            height="26"
            rx="5"
            fill="url(#box-gradient)"
            opacity="0.35"
          />
          {/* Letter / Bookmark Notch Slot on top */}
          <path
            d="M14 5V13C14 14.1 14.9 15 16 15H24C25.1 15 26 14.1 26 13V5"
            stroke="#15E558"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Glowing Green Bookmark Ribbon Dropping Through */}
          <path
            d="M20 12V25L17.5 23L15 25V12"
            fill="#15E558"
            opacity="0.95"
          />
          {/* Modern Letter 'L' + 'B' book pages geometric lines */}
          <path
            d="M10 28H30"
            stroke="#40BCF4"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.9"
          />
          <circle cx="28" cy="12" r="2" fill="#15E558" />

          {/* Gradients */}
          <defs>
            <linearGradient id="box-gradient" x1="5" y1="7" x2="35" y2="33" gradientUnits="userSpaceOnUse">
              <stop stopColor="#15E558" stopOpacity="0.4" />
              <stop offset="1" stopColor="#40BCF4" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <span className={`text-white font-sans ${textSizes[size]} flex items-center`}>
          <span>Letter</span>
          <span className="text-[#15E558]">box</span>
        </span>
      )}
    </div>
  );
};
