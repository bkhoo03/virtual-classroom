import { useState } from 'react';
import { Tooltip } from './Tooltip';

// Brand colors only - simple and clean
const colors = [
  { value: '#000000', label: 'Black' },
  { value: '#FDC500', label: 'Yellow' },
  { value: '#5C0099', label: 'Purple' },
];

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  className?: string;
}

/**
 * ColorPicker component displays a simple color palette
 * with glass-morphism styling
 */
export default function ColorPicker({
  selectedColor,
  onColorChange,
  className = '',
}: ColorPickerProps) {
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);

  return (
    <div
      className={`flex flex-col gap-2 p-2 bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20 ${className}`}
      style={{
        backdropFilter: 'blur(12px)',
        background: 'rgba(255, 255, 255, 0.1)',
      }}
      role="group"
      aria-label="Color picker"
    >
      {colors.map((color) => {
        const isSelected = selectedColor.toLowerCase() === color.value.toLowerCase();
        const isHovered = hoveredColor === color.value;

        return (
          <Tooltip key={color.value} content={color.label} position="left">
            <button
              onClick={() => onColorChange(color.value)}
              onMouseEnter={() => setHoveredColor(color.value)}
              onMouseLeave={() => setHoveredColor(null)}
              className={`
                relative w-11 h-11 rounded-xl transition-all duration-200 ease-in-out
                active:scale-95 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2
                ${isSelected ? 'scale-105 shadow-lg' : isHovered ? 'scale-105' : 'scale-100'}
              `}
              style={{
                backgroundColor: color.value,
                boxShadow: isSelected
                  ? `0 0 0 3px #FDC500, 0 4px 6px rgba(253, 197, 0, 0.3)`
                  : isHovered
                  ? `0 2px 4px rgba(0, 0, 0, 0.2)`
                  : `0 1px 2px rgba(0, 0, 0, 0.1)`,
              }}
              aria-label={`Select ${color.label} color`}
              aria-pressed={isSelected}
              title={`${color.label} color`}
              tabIndex={0}
            >
              {isSelected && (
                <span
                  className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${
                    color.value === '#FDC500' ? 'text-gray-900' : 'text-white'
                  }`}
                  aria-hidden="true"
                >
                  ✓
                </span>
              )}
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}
