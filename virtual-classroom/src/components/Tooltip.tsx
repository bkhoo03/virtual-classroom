import React, { useState } from 'react';

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
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-8',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-8',
    left: 'right-full top-1/2 -translate-y-1/2 mr-8',
    right: 'left-full top-1/2 -translate-y-1/2 ml-8',
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
          className={`absolute z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap ${positionStyles[position]}`}
          role="tooltip"
        >
          <div className="flex items-center gap-2">
            <span>{content}</span>
            {shortcut && (
              <span className="text-xs opacity-75">({shortcut})</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
