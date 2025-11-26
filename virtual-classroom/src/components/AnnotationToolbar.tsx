import { useState, useRef, useEffect } from 'react';
import { Tooltip } from './Tooltip';
import ColorPicker from './ColorPicker';
import StrokeWidthSelector from './StrokeWidthSelector';
import { useScreenReaderAnnouncement } from '../hooks/useScreenReaderAnnouncement';

export type AnnotationTool = 'hand' | 'laser' | 'pen' | 'highlighter' | 'eraser';

interface Tool {
  type: AnnotationTool;
  icon: string;
  label: string;
}

const tools: Tool[] = [
  { type: 'hand', icon: '✋', label: 'Hand Tool' },
  { type: 'laser', icon: '🔴', label: 'Laser Pointer' },
  { type: 'pen', icon: '✏️', label: 'Pen' },
  { type: 'highlighter', icon: '🖍️', label: 'Highlighter' },
  { type: 'eraser', icon: '🧽', label: 'Eraser' },
];

interface AnnotationToolbarProps {
  selectedTool: AnnotationTool;
  onToolChange: (tool: AnnotationTool) => void;
  currentColor: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  onClear?: () => void;
  className?: string;
}

// Helper function to check if a tool is a drawing tool (pen or highlighter)
// Non-drawing tools (hand, laser, eraser) don't need color/stroke width controls
const isDrawingTool = (tool: AnnotationTool): boolean => {
  return tool === 'pen' || tool === 'highlighter';
};

/**
 * AnnotationToolbar provides drawing tools for presentation annotations
 * Reuses ToolPalette styling with annotation-specific tools
 */
export default function AnnotationToolbar({
  selectedTool,
  onToolChange,
  currentColor,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  onClear,
  className = '',
}: AnnotationToolbarProps) {
  const [hoveredTool, setHoveredTool] = useState<AnnotationTool | 'color' | 'stroke' | 'clear' | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showStrokeSelector, setShowStrokeSelector] = useState(false);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  
  // Announce tool changes
  useScreenReaderAnnouncement(announcement, 'polite');
  
  useEffect(() => {
    const toolNames: Record<AnnotationTool, string> = {
      hand: 'Hand tool',
      laser: 'Laser pointer',
      pen: 'Pen',
      highlighter: 'Highlighter',
      eraser: 'Eraser'
    };
    setAnnouncement(`${toolNames[selectedTool]} selected`);
  }, [selectedTool]);

  // Close pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
        setShowStrokeSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Keyboard navigation handlers
  const handleToolKeyDown = (e: React.KeyboardEvent, tool: AnnotationTool) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToolChange(tool);
      setShowColorPicker(false);
      setShowStrokeSelector(false);
    }
  };

  const handleColorKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setShowColorPicker(!showColorPicker);
      setShowStrokeSelector(false);
    }
  };

  const handleStrokeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setShowStrokeSelector(!showStrokeSelector);
      setShowColorPicker(false);
    }
  };

  const handleClearKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClear?.();
    }
  };

  return (
    <div
      ref={toolbarRef}
      className={`flex flex-col gap-1 py-4 px-3 bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-gray-200 ${className}`}
      style={{
        backdropFilter: 'blur(12px)',
      }}
      role="toolbar"
      aria-label="Annotation tools"
      aria-orientation="vertical"
    >
      {/* Drawing Tools */}
      {tools.map((tool) => {
        const isActive = selectedTool === tool.type;
        const isHovered = hoveredTool === tool.type;

        return (
          <Tooltip key={tool.type} content={tool.label} position="right">
            <button
              onClick={() => {
                onToolChange(tool.type);
                // Close pickers when switching tools
                setShowColorPicker(false);
                setShowStrokeSelector(false);
              }}
              onKeyDown={(e) => handleToolKeyDown(e, tool.type)}
              onMouseEnter={() => setHoveredTool(tool.type)}
              onMouseLeave={() => setHoveredTool(null)}
              className={`
                relative w-12 h-12 flex items-center justify-center rounded-lg
                transition-all duration-300 ease-in-out
                ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md scale-105'
                    : isHovered
                    ? 'bg-purple-100 text-gray-900'
                    : 'bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-gray-900'
                }
              `}
              style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
              aria-label={tool.label}
              aria-pressed={isActive}
              title={tool.label}
              tabIndex={0}
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

      {/* Divider - only show if current tool is a drawing tool */}
      {isDrawingTool(selectedTool) && <div className="h-px bg-gray-200 my-1" />}

      {/* Color Picker Toggle - only show for drawing tools */}
      {isDrawingTool(selectedTool) && (
        <Tooltip content="Color" position="right">
          <button
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowStrokeSelector(false);
            }}
            onKeyDown={handleColorKeyDown}
            onMouseEnter={() => setHoveredTool('color')}
            onMouseLeave={() => setHoveredTool(null)}
            className={`
              relative w-12 h-12 flex items-center justify-center rounded-lg
              transition-all duration-300 ease-in-out
              ${
                showColorPicker
                  ? 'bg-purple-600 shadow-md scale-105'
                  : hoveredTool === 'color'
                  ? 'bg-purple-100 scale-105'
                  : 'bg-gray-100'
              }
            `}
            style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            aria-label="Choose color"
            aria-expanded={showColorPicker}
            title="Choose color"
            tabIndex={0}
          >
            <div
              className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm transition-transform duration-200"
              style={{ 
                backgroundColor: currentColor,
                transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
          </button>
        </Tooltip>
      )}

      {/* Color Picker Popup */}
      {showColorPicker && isDrawingTool(selectedTool) && (
        <div className="absolute left-full ml-2 top-0">
          <ColorPicker
            selectedColor={currentColor}
            onColorChange={(color) => {
              onColorChange(color);
              setShowColorPicker(false);
            }}
          />
        </div>
      )}

      {/* Stroke Width Toggle - only show for drawing tools */}
      {isDrawingTool(selectedTool) && (
        <Tooltip content="Stroke Width" position="right">
          <button
            onClick={() => {
              setShowStrokeSelector(!showStrokeSelector);
              setShowColorPicker(false);
            }}
            onKeyDown={handleStrokeKeyDown}
            onMouseEnter={() => setHoveredTool('stroke')}
            onMouseLeave={() => setHoveredTool(null)}
            className={`
              relative w-12 h-12 flex items-center justify-center rounded-lg
              transition-all duration-300 ease-in-out
              ${
                showStrokeSelector
                  ? 'bg-purple-600 shadow-md scale-105'
                  : hoveredTool === 'stroke'
                  ? 'bg-purple-100 scale-105'
                  : 'bg-gray-100'
              }
            `}
            style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            aria-label="Stroke width"
            aria-expanded={showStrokeSelector}
            title="Choose stroke width"
            tabIndex={0}
          >
            <svg
              className={`w-6 h-6 transition-colors duration-200 ${showStrokeSelector ? 'text-white' : 'text-gray-700'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={strokeWidth}
                d="M4 12h16"
              />
            </svg>
          </button>
        </Tooltip>
      )}

      {/* Stroke Width Selector Popup */}
      {showStrokeSelector && isDrawingTool(selectedTool) && (
        <div className="absolute left-full ml-2 top-12">
          <StrokeWidthSelector
            selectedWidth={strokeWidth}
            onWidthChange={(width) => {
              onStrokeWidthChange(width);
              setShowStrokeSelector(false);
            }}
          />
        </div>
      )}

      {/* Divider */}
      {onClear && <div className="h-px bg-gray-200 my-1" />}

      {/* Clear All */}
      {onClear && (
        <Tooltip content="Clear All" position="right">
          <button
            onClick={onClear}
            onKeyDown={handleClearKeyDown}
            onMouseEnter={() => setHoveredTool('clear')}
            onMouseLeave={() => setHoveredTool(null)}
            className={`
              w-12 h-12 flex items-center justify-center rounded-lg
              transition-all duration-300 ease-in-out
              ${
                hoveredTool === 'clear'
                  ? 'bg-red-50 text-red-700 scale-105'
                  : 'bg-gray-100 text-red-600'
              }
            `}
            style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            aria-label="Clear all annotations"
            title="Clear all annotations"
            tabIndex={0}
          >
            <svg
              className="w-6 h-6 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </Tooltip>
      )}
    </div>
  );
}
