import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
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
 * StrokeWidthSelector component with collapsible width options
 * Shows only the selected width by default, expands on click
 */
export default function StrokeWidthSelector({
  selectedWidth,
  onWidthChange,
  currentColor = '#1a1a2e',
  className = '',
}: StrokeWidthSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredWidth, setHoveredWidth] = useState<number | null>(null);

  const selectedStroke = strokeWidths.find((s) => s.value === selectedWidth) || strokeWidths[1];

  const handleWidthSelect = (width: number) => {
    onWidthChange(width);
    setIsExpanded(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Collapsed state - just show selected width */}
      {!isExpanded && (
        <Tooltip content="Choose thickness" position="right">
          <button
            onClick={() => setIsExpanded(true)}
            className="relative w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg
                     hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out
                     flex items-center justify-center group"
            style={{
              backdropFilter: 'blur(12px)',
              background: 'rgba(255, 255, 255, 0.1)',
            }}
            aria-label="Open stroke width selector"
          >
            {/* Selected width preview */}
            <div
              className="rounded-full"
              style={{
                width: selectedStroke.size === 'small' ? '8px' : selectedStroke.size === 'medium' ? '12px' : '16px',
                height: selectedStroke.size === 'small' ? '8px' : selectedStroke.size === 'medium' ? '12px' : '16px',
                backgroundColor: currentColor,
              }}
            />
            {/* Expand indicator */}
            <ChevronRight className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-white/50 
                                   group-hover:text-yellow-500 transition-colors" />
          </button>
        </Tooltip>
      )}

      {/* Expanded state - show all widths */}
      {isExpanded && (
        <div
          className="absolute left-0 top-0 flex flex-col gap-2 p-3 bg-white/10 backdrop-blur-md rounded-xl 
                     shadow-xl border border-white/20 animate-scale-in z-50"
          style={{
            backdropFilter: 'blur(12px)',
            background: 'rgba(255, 255, 255, 0.1)',
          }}
          onMouseLeave={() => setIsExpanded(false)}
          role="group"
          aria-label="Stroke width selector"
        >
          {strokeWidths.map((stroke) => {
            const isSelected = selectedWidth === stroke.value;
            const isHovered = hoveredWidth === stroke.value;

            return (
              <Tooltip key={stroke.value} content={stroke.label} position="right">
                <button
                  onClick={() => handleWidthSelect(stroke.value)}
                  onMouseEnter={() => setHoveredWidth(stroke.value)}
                  onMouseLeave={() => setHoveredWidth(null)}
                  className={`
                    relative w-11 h-11 flex items-center justify-center rounded-lg
                    transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2
                    ${
                      isSelected
                        ? 'bg-yellow-500 scale-105 shadow-lg shadow-yellow-500/50'
                        : isHovered
                        ? 'bg-white/20 scale-105'
                        : 'bg-white/10 hover:bg-white/20 hover:scale-105'
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
                      backgroundColor: isSelected ? '#1F2937' : currentColor,
                    }}
                    aria-hidden="true"
                  />

                  {/* Selection border */}
                  {isSelected && (
                    <div className="absolute inset-0 border-2 border-yellow-600 rounded-lg" aria-hidden="true" />
                  )}
                </button>
              </Tooltip>
            );
          })}
        </div>
      )}
    </div>
  );
}
