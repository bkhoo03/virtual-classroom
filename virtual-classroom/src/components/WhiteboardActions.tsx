import { useState } from 'react';
import { Undo, Redo, Trash2, Save } from 'lucide-react';
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
 * for undo, redo, clear, and save operations with modern icons and glass-morphism
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
      className={`flex flex-col gap-1 p-2 bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20 ${className}`}
      style={{
        backdropFilter: 'blur(12px)',
        background: 'rgba(255, 255, 255, 0.1)',
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
            active:scale-95
            ${
              !canUndo
                ? 'bg-white/5 text-gray-400 cursor-not-allowed opacity-50'
                : hoveredAction === 'undo'
                ? 'bg-yellow-500 text-gray-900 scale-105'
                : 'bg-white/10 text-gray-700 hover:bg-yellow-500 hover:text-gray-900 hover:scale-105'
            }
          `}
          aria-label="Undo"
          aria-disabled={!canUndo}
        >
          <Undo className="w-5 h-5" />
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
            active:scale-95
            ${
              !canRedo
                ? 'bg-white/5 text-gray-400 cursor-not-allowed opacity-50'
                : hoveredAction === 'redo'
                ? 'bg-yellow-500 text-gray-900 scale-105'
                : 'bg-white/10 text-gray-700 hover:bg-yellow-500 hover:text-gray-900 hover:scale-105'
            }
          `}
          aria-label="Redo"
          aria-disabled={!canRedo}
        >
          <Redo className="w-5 h-5" />
        </button>
      </Tooltip>

      {/* Divider */}
      <div className="h-px bg-white/20 my-1" />

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
            active:scale-95
            ${
              showClearConfirm
                ? 'bg-red-500 text-white animate-pulse scale-105'
                : hoveredAction === 'clear'
                ? 'bg-red-500 text-white scale-105'
                : 'bg-white/10 text-gray-700 hover:bg-red-500 hover:text-white hover:scale-105'
            }
          `}
          aria-label="Clear all"
        >
          <Trash2 className="w-5 h-5" />
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
            active:scale-95
            ${
              hoveredAction === 'save'
                ? 'bg-green-500 text-white scale-105'
                : 'bg-white/10 text-gray-700 hover:bg-green-500 hover:text-white hover:scale-105'
            }
          `}
          aria-label="Save as image"
        >
          <Save className="w-5 h-5" />
        </button>
      </Tooltip>
    </div>
  );
}
