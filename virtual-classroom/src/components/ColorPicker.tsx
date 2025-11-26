import { useState } from 'react';
import { Tooltip } from './Tooltip';

// Teacher-friendly colors for annotations - commonly used in education
const colors = [
  { value: '#DC2626', label: 'Red' },           // Classic teacher red
  { value: '#000000', label: 'Black' },         // Standard black
  { value: '#2563EB', label: 'Blue' },          // Classic blue
  { value: '#16A34A', label: 'Green' },         // Approval green
  { value: '#EA580C', label: 'Orange' },        // Attention orange
  { value: '#7C3AED', label: 'Purple' },        // Brand purple
  { value: '#CA8A04', label: 'Yellow' },        // Highlight yellow
  { value: '#EC4899', label: 'Pink' },          // Bright pink
  { value: '#0891B2', label: 'Cyan' },          // Light blue
  { value: '#65A30D', label: 'Lime' },          // Bright green
  { value: '#6B7280', label: 'Gray' },          // Neutral gray
  { value: '#FFFFFF', label: 'White' },         // White
];

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  className?: string;
}

/**
 * ColorPicker component displays a palette of colors
 * with brand colors and common drawing colors
 */
export default function ColorPicker({
  selectedColor,
  onColorChange,
  className = '',
}: ColorPickerProps) {
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent, colorValue: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onColorChange(colorValue);
    }
  };

  return (
    <div
      className={`flex flex-wrap gap-2 p-3 bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-gray-200 ${className}`}
      style={{
        backdropFilter: 'blur(12px)',
        maxWidth: '200px',
      }}
      role="group"
      aria-label="Color picker"
    >
      {colors.map((color) => {
        const isSelected = selectedColor.toLowerCase() === color.value.toLowerCase();
        const isHovered = hoveredColor === color.value;

        return (
          <Tooltip key={color.value} content={color.label} position="top">
            <button
              onClick={() => onColorChange(color.value)}
              onKeyDown={(e) => handleKeyDown(e, color.value)}
              onMouseEnter={() => setHoveredColor(color.value)}
              onMouseLeave={() => setHoveredColor(null)}
              className={`
                relative w-8 h-8 rounded-full transition-all duration-200 ease-in-out
                active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2
                ${isSelected ? 'scale-110' : isHovered ? 'scale-105' : 'scale-100'}
                ${color.value === '#FFFFFF' ? 'border-2 border-gray-300' : ''}
              `}
              style={{
                backgroundColor: color.value,
                boxShadow: isSelected
                  ? `0 0 0 3px #c86bfa, 0 4px 6px rgba(0, 0, 0, 0.1)`
                  : isHovered
                  ? `0 2px 4px rgba(0, 0, 0, 0.2)`
                  : `0 1px 2px rgba(0, 0, 0, 0.1)`,
              }}
              aria-label={`Select ${color.label} color`}
              aria-pressed={isSelected}
              title={`${color.label} color`}
              tabIndex={0}
            >
              {/* Checkmark for selected color */}
              {isSelected && (
                <span
                  className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${
                    color.value === '#FFFFFF' || color.value === '#FDC500' || color.value === '#C86BFA'
                      ? 'text-purple-700'
                      : 'text-white'
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
