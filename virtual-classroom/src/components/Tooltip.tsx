import React, { useState } from 'react';
import { usePrefersReducedMotion } from '../hooks/useAccessibilityPreferences';

export interface TooltipProps {
  content: string;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  shortcut?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 300,
  shortcut,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const handleMouseEnter = () => {
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setIsVisible(false);
  };

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowStyles = {
    top: 'top-full left-1/2 -translate-x-1/2 -mt-1',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1',
    left: 'left-full top-1/2 -translate-y-1/2 -ml-1',
    right: 'right-full top-1/2 -translate-y-1/2 -mr-1',
  };

  const arrowRotation = {
    top: 'rotate-45',
    bottom: '-rotate-45',
    left: 'rotate-45',
    right: '-rotate-45',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          className={`
            absolute z-50 px-3 py-2 
            glass-strong
            rounded-lg shadow-xl 
            whitespace-nowrap
            ${positionStyles[position]}
            ${prefersReducedMotion ? '' : 'animate-fade-in'}
          `}
          style={{
            animationDuration: prefersReducedMotion ? '0ms' : '200ms',
            animationTimingFunction: 'var(--ease-out)',
          }}
          role="tooltip"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">{content}</span>
            {shortcut && (
              <span className="text-xs font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                {shortcut}
              </span>
            )}
          </div>
          
          {/* Arrow pointer with glass effect */}
          <div
            className={`
              absolute w-2 h-2 
              glass-strong
              ${arrowStyles[position]}
              ${arrowRotation[position]}
            `}
            style={{
              boxShadow: 'none',
            }}
          />
        </div>
      )}
    </div>
  );
};
