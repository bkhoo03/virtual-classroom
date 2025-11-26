import { useState } from 'react';
import { Tooltip } from './Tooltip';

const strokeWidths = [
  { value: 2, label: 'Thin', size: 'small' },
  { value: 6, label: 'Medium', size: 'medium' },
  { value: 12, label: 'Thick', size: 'large' },
];

interface StrokeWidthSelectorProps {
  selectedWidth: number;
  onWidthChange: (width: number) => void;
  currentColor?: string;
  className?: string;
}

/**
 * StrokeWidthSelector component provides visual stroke width selection
 * with preview of the selected width
 */
export default function StrokeWidthSelector({
  selectedWidth,
  onWidthChange,
  currentColor = '#1a1a2e',
  className = '',
}: StrokeWidthSelectorProps) {
  const [hoveredWidth, setHoveredWidth] = useState<number | null>(null);

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent, width: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onWidthChange(width);
    }
  };

  return (
    <div
      className={`flex gap-3 p-3 bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-gray-200 ${className}`}
      style={{
        backdropFilter: 'blur(12px)',
      }}
      role="group"
      aria-label="Stroke width selector"
    >
      {strokeWidths.map((stroke) => {
        const isSelected = selectedWidth === stroke.value;
        const isHovered = hoveredWidth === stroke.value;

        return (
          <Tooltip key={stroke.value} content={stroke.label} position="top">
            <button
              onClick={() => onWidthChange(stroke.value)}
              onKeyDown={(e) => handleKeyDown(e, stroke.value)}
              onMouseEnter={() => setHoveredWidth(stroke.value)}
              onMouseLeave={() => setHoveredWidth(null)}
              className={`
                relative w-12 h-12 flex items-center justify-center rounded-lg
                transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2
                ${
                  isSelected
                    ? 'bg-purple-600 scale-105'
                    : isHovered
                    ? 'bg-purple-100'
                    : 'bg-gray-100 hover:bg-gray-200'
                }
              `}
              style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
              aria-label={`${stroke.label} stroke width`}
              aria-pressed={isSelected}
              title={`${stroke.label} stroke width`}
              tabIndex={0}
            >
              {/* Visual preview of stroke width */}
              <div
                className="rounded-full transition-colors duration-200"
                style={{
                  width: stroke.size === 'small' ? '8px' : stroke.size === 'medium' ? '12px' : '16px',
                  height: stroke.size === 'small' ? '8px' : stroke.size === 'medium' ? '12px' : '16px',
                  backgroundColor: isSelected ? '#FFFFFF' : currentColor,
                }}
                aria-hidden="true"
              />

              {/* Selection border */}
              {isSelected && (
                <div className="absolute inset-0 border-3 border-purple-700 rounded-lg" aria-hidden="true" />
              )}
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}
