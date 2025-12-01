import { useState } from 'react';
import { MousePointer2, Pencil, Square, Circle, Minus, Type, Eraser, Hand } from 'lucide-react';
import type { DrawingToolType } from '../types/whiteboard.types';
import { Tooltip } from './Tooltip';

interface Tool {
  type: DrawingToolType;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const tools: Tool[] = [
  { type: 'selector', icon: MousePointer2, label: 'Select' },
  { type: 'pencil', icon: Pencil, label: 'Pen' },
  { type: 'rectangle', icon: Square, label: 'Rectangle' },
  { type: 'circle', icon: Circle, label: 'Circle' },
  { type: 'line', icon: Minus, label: 'Line' },
  { type: 'text', icon: Type, label: 'Text' },
  { type: 'eraser', icon: Eraser, label: 'Eraser' },
  { type: 'hand', icon: Hand, label: 'Pan' },
];

interface ToolPaletteProps {
  selectedTool: DrawingToolType;
  onToolChange: (tool: DrawingToolType) => void;
  className?: string;
}

/**
 * ToolPalette component provides a floating vertical toolbar
 * for selecting drawing tools with glass-morphism styling and modern icons
 */
export default function ToolPalette({
  selectedTool,
  onToolChange,
  className = '',
}: ToolPaletteProps) {
  const [hoveredTool, setHoveredTool] = useState<DrawingToolType | null>(null);

  return (
    <div
      className={`flex flex-col gap-1 p-2 bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20 ${className}`}
      style={{
        backdropFilter: 'blur(12px)',
        background: 'rgba(255, 255, 255, 0.1)',
      }}
    >
      {tools.map((tool) => {
        const isActive = selectedTool === tool.type;
        const isHovered = hoveredTool === tool.type;
        const Icon = tool.icon;

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
                    ? 'bg-yellow-500 text-gray-900 shadow-lg shadow-yellow-500/50 scale-105'
                    : isHovered
                    ? 'bg-white/20 text-gray-900 scale-105'
                    : 'bg-white/10 text-gray-700 hover:bg-white/20 hover:text-gray-900 hover:scale-105'
                }
              `}
              aria-label={tool.label}
              aria-pressed={isActive}
            >
              <Icon className="w-5 h-5" />
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-yellow-600 rounded-full shadow-md" />
              )}
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}
