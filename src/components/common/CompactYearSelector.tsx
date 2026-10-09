import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface CompactYearSelectorProps {
  variant?: 'header' | 'inline';
  className?: string;
  showIcon?: boolean;
}

export const CompactYearSelector: React.FC<CompactYearSelectorProps> = ({
  variant = 'header',
  className = '',
  showIcon = false,
}) => {
  const { selectedYear, setSelectedYear } = useFinance();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Generate range of available years dynamically:
  // Starts comfortably from 2024 up to at least max(2035, selectedYear + 5), expandable without artificial limits!
  const minYear = 2024;
  const maxYear = Math.max(2036, selectedYear + 4);
  const years: number[] = [];
  for (let y = minYear; y <= maxYear; y++) {
    years.push(y);
  }

  // Smoothly center the selected year button when mounted or when selectedYear changes
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const activeButton = scrollContainerRef.current.querySelector<HTMLButtonElement>(`[data-year="${selectedYear}"]`);
    if (activeButton) {
      const container = scrollContainerRef.current;
      const leftPos = activeButton.offsetLeft - container.offsetWidth / 2 + activeButton.offsetWidth / 2;
      container.scrollTo({ left: Math.max(0, leftPos), behavior: 'smooth' });
    }
  }, [selectedYear]);

  const handlePrevYear = () => {
    setSelectedYear(selectedYear - 1);
  };

  const handleNextYear = () => {
    setSelectedYear(selectedYear + 1);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -120, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 120, behavior: 'smooth' });
    }
  };

  return (
    <div
      id="compact-year-selector"
      className={`relative flex items-center bg-slate-900/95 border border-slate-800 rounded-xl shadow-xs select-none ${
        variant === 'header' ? 'p-0.5 max-w-[210px] sm:max-w-[260px]' : 'p-1 max-w-[320px]'
      } ${className}`}
    >
      {showIcon && (
        <div className="pl-2 pr-1 hidden sm:flex items-center text-slate-500">
          <Calendar className="w-3.5 h-3.5 text-blue-400" />
        </div>
      )}

      {/* Prev Navigation Button */}
      <button
        type="button"
        onClick={handlePrevYear}
        onDoubleClick={scrollLeft}
        className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
        title="Ano anterior"
        aria-label="Ano anterior"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>

      {/* Horizontal Scroll Ribbon */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-1 overflow-x-auto scroll-smooth py-0.5 px-0.5 scrollbar-none no-scrollbar touch-pan-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {years.map((yr) => {
          const isSelected = yr === selectedYear;
          return (
            <button
              key={yr}
              type="button"
              data-year={yr}
              onClick={() => {
                if (yr !== selectedYear) {
                  setSelectedYear(yr);
                }
              }}
              className={`shrink-0 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs scale-102 ring-1 ring-blue-400/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              title={`Exercício Fiscal ${yr}`}
            >
              {yr}
            </button>
          );
        })}
      </div>

      {/* Next Navigation Button */}
      <button
        type="button"
        onClick={handleNextYear}
        onDoubleClick={scrollRight}
        className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
        title="Próximo ano"
        aria-label="Próximo ano"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
