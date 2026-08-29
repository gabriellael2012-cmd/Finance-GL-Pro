import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showProductTag?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showProductTag = true,
  className = '',
}) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <div id="gl-studios-logo" className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* GL Studios Square Badge Icon (Aspect-Square, Slightly Rounded Corners, Blue Gradient) */}
      <div
        className={`relative flex flex-col items-center justify-center aspect-square rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 border border-blue-400/35 shadow-md shadow-blue-950/50 shrink-0 transition-transform ${
          isSm
            ? 'w-8 h-8 sm:w-9 sm:h-9 p-0.5'
            : isLg
            ? 'w-13 h-13 sm:w-14 sm:h-14 p-1.5 rounded-2xl'
            : 'w-10 h-10 sm:w-11 sm:h-11 p-1'
        }`}
        title="GL Studios"
      >
        {/* Line 1: GL (White, bold, highlighted) */}
        <span
          className={`font-display font-extrabold text-white tracking-tight leading-none drop-shadow-xs text-center ${
            isSm ? 'text-[11px] sm:text-xs' : isLg ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'
          }`}
        >
          GL
        </span>

        {/* Line 2: Studios (Light gray, smaller, directly below GL) */}
        <span
          className={`font-sans font-medium text-slate-300 tracking-wider leading-none text-center ${
            isSm
              ? 'text-[7px] sm:text-[7.5px] mt-0.5'
              : isLg
              ? 'text-[10px] sm:text-[11px] mt-1'
              : 'text-[8px] sm:text-[8.5px] mt-0.5'
          }`}
        >
          Studios
        </span>
      </div>

      {/* Product Name (Finance PRO) */}
      {showProductTag && (
        <div className="flex items-center leading-none">
          <span
            className={`font-display font-bold tracking-tight text-white ${
              isSm ? 'text-xs sm:text-sm' : isLg ? 'text-lg' : 'text-sm sm:text-base'
            }`}
          >
            Finance <span className="text-blue-400 font-extrabold">PRO</span>
          </span>
        </div>
      )}
    </div>
  );
};
