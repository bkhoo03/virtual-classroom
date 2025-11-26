import { useState } from 'react';
import type { DrawingToolType } from '../types/whiteboard.types';
import { Tooltip } from './Tooltip';

interface Tool {
  type: DrawingToolType;
  icon: string;
  label: string;
}

const tools: Tool[] = [
  { type: 'selector', icon: '↖', label: 'Select' },
  { type: 'pencil', icon: '✏️', label: 'Pen' },
  { type: 'rectangle', icon: '▭', label: 'Rectangle' },
  { type: 'circle', icon: '○', label: 'Circle' },
  { type: 'line', icon: '/', label: 'Line' },
  { type: 'text', icon: 'T', label: 'Text' },
  { type: 'eraser', icon: '🧹', label: 'Eraser' },
  { type: 'hand', icon: '✋', label: 'Pan' },
];

interface ToolPaletteProps {
  selectedTool: DrawingToolType;
  onToolChange: (tool: DrawingToolType) => void;
  className?: string;
}

/**
 * ToolPalette component provides a floating vertical toolbar
 * for selecting drawing tools with glass-morphism styling
 */
export default function ToolPalette({
  selectedTool,
  onToolChange,
  className = '',
}: ToolPaletteProps) {
  const [hoveredTool, setHoveredTool] = useState<DrawingToolType | null>(null);

  return (
    <div
      className={`flex flex-col gap-1 p-2 bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-gray-200 ${className}`}
      style={{
        backdropFilter: 'blur(12px)',
      }}
    >
      {tools.map((tool) => {
        const isActive = selectedTool === tool.type;
        const isHovered = hoveredTool === tool.type;

        return (
          <Tooltip key={tool.type} content={tool.label} position="right">
            <button
              onClick={() => onToolChange(tool.type)}
              onMouseEnter={() => setHoveredTool(tool.type)}
              onMouseLeave={() => setHoveredTool(null)}
              className={`
                relative w-11 h-11 flex items-center justify-center rounded-lg
                transition-all duration-200 ease-in-out
                active:scale-95
                ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md scale-105'
                    : isHovered
                    ? 'bg-purple-100 text-gray-900'
                    : 'bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-gray-900'
                }
              `}
              aria-label={tool.label}
              aria-pressed={isActive}
            >
              <span className="text-xl font-medium select-none">
                {tool.icon}
              </span>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-purple-700 rounded-full" />
              )}
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}
