import React, { useEffect, useRef, useState } from 'react';
import { formatBRL } from '../../utils/formatters';

interface AnimatedNumberProps {
  value: number;
  isCurrency?: boolean;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  isCurrency = true,
  prefix = '',
  suffix = '',
  className = '',
  duration = 500,
}) => {
  const [displayValue, setDisplayValue] = useState<number>(value);
  const prevValueRef = useRef<number>(value);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayValue(value);
      prevValueRef.current = value;
      return;
    }

    const startVal = prevValueRef.current;
    const endVal = value;

    // If change is tiny or 0, update directly without animation loop
    if (Math.abs(startVal - endVal) < 0.01) {
      setDisplayValue(endVal);
      prevValueRef.current = endVal;
      return;
    }

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth cubic out easing
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = startVal + (endVal - startVal) * easeProgress;

      setDisplayValue(currentVal);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endVal);
        prevValueRef.current = endVal;
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [value, duration]);

  const formatted = isCurrency
    ? formatBRL(displayValue)
    : displayValue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return (
    <span className={`inline-block tabular-nums transition-colors duration-150 ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};
