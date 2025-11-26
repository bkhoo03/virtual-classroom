import { useState } from 'react';
import { Tooltip } from './Tooltip';

interface WhiteboardActionsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onSave: () => void;
  className?: string;
}

/**
 * WhiteboardActions component provides action controls
 * for undo, redo, clear, and save operations
 */
export default function WhiteboardActions({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  onSave,
  className = '',
}: WhiteboardActionsProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const handleClearClick = () => {
    if (!showClearConfirm) {
      setShowClearConfirm(true);
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => setShowClearConfirm(false), 3000);
    } else {
      onClear();
      setShowClearConfirm(false);
    }
  };

  const handleSave = async () => {
    try {
      await onSave();
      // Could show a success toast here
    } catch (error) {
      console.error('Failed to save whiteboard:', error);
      // Could show an error toast here
    }
  };

  return (
    <div
      className={`flex flex-col gap-1 p-2 bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-gray-200 ${className}`}
      style={{
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Undo */}
      <Tooltip content="Undo (Ctrl+Z)" position="right">
        <button
          onClick={onUndo}
          onMouseEnter={() => setHoveredAction('undo')}
          onMouseLeave={() => setHoveredAction(null)}
          disabled={!canUndo}
          className={`
            w-11 h-11 flex items-center justify-center rounded-lg
            transition-all duration-200 ease-in-out
            ${
              !canUndo
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : hoveredAction === 'undo'
                ? 'bg-purple-100 text-gray-900'
                : 'bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-gray-900'
            }
          `}
          aria-label="Undo"
          aria-disabled={!canUndo}
        >
          <span className="text-xl font-medium select-none">↶</span>
        </button>
      </Tooltip>

      {/* Redo */}
      <Tooltip content="Redo (Ctrl+Y)" position="right">
        <button
          onClick={onRedo}
          onMouseEnter={() => setHoveredAction('redo')}
          onMouseLeave={() => setHoveredAction(null)}
          disabled={!canRedo}
          className={`
            w-11 h-11 flex items-center justify-center rounded-lg
            transition-all duration-200 ease-in-out
            ${
              !canRedo
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : hoveredAction === 'redo'
                ? 'bg-purple-100 text-gray-900'
                : 'bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-gray-900'
            }
          `}
          aria-label="Redo"
          aria-disabled={!canRedo}
        >
          <span className="text-xl font-medium select-none">↷</span>
        </button>
      </Tooltip>

      {/* Divider */}
      <div className="h-px bg-gray-200 my-1" />

      {/* Clear All */}
      <Tooltip
        content={showClearConfirm ? 'Click again to confirm' : 'Clear All'}
        position="right"
      >
        <button
          onClick={handleClearClick}
          onMouseEnter={() => setHoveredAction('clear')}
          onMouseLeave={() => setHoveredAction(null)}
          className={`
            w-11 h-11 flex items-center justify-center rounded-lg
            transition-all duration-200 ease-in-out
            ${
              showClearConfirm
                ? 'bg-red-500 text-white animate-pulse'
                : hoveredAction === 'clear'
                ? 'bg-red-50 text-red-600 hover:bg-red-500 hover:text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600'
            }
          `}
          aria-label="Clear all"
        >
          <span className="text-xl font-medium select-none">🗑️</span>
        </button>
      </Tooltip>

      {/* Save */}
      <Tooltip content="Save as Image" position="right">
        <button
          onClick={handleSave}
          onMouseEnter={() => setHoveredAction('save')}
          onMouseLeave={() => setHoveredAction(null)}
          className={`
            w-11 h-11 flex items-center justify-center rounded-lg
            transition-all duration-200 ease-in-out
            ${
              hoveredAction === 'save'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-600'
            }
          `}
          aria-label="Save as image"
        >
          <span className="text-xl font-medium select-none">💾</span>
        </button>
      </Tooltip>
    </div>
  );
}
