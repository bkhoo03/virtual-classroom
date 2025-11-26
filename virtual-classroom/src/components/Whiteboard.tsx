import { useState, useEffect, useCallback } from 'react';
import type { Room } from 'white-web-sdk';
import WhiteboardCanvas from './WhiteboardCanvas';
import ToolPalette from './ToolPalette';
import ColorPicker from './ColorPicker';
import StrokeWidthSelector from './StrokeWidthSelector';
import WhiteboardActions from './WhiteboardActions';
import whiteboardService from '../services/WhiteboardService';
import type { WhiteboardConfig, DrawingToolType } from '../types/whiteboard.types';

interface WhiteboardProps {
  config: WhiteboardConfig;
  onError?: (error: Error) => void;
  className?: string;
}

/**
 * Whiteboard component integrates all whiteboard functionality
 * including canvas, tools, colors, and actions
 */
export default function Whiteboard({
  config,
  onError,
  className = '',
}: WhiteboardProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [selectedTool, setSelectedTool] = useState<DrawingToolType>('pencil');
  const [selectedColor, setSelectedColor] = useState('#1a1a2e'); // Dark color for light background
  const [strokeWidth, setStrokeWidth] = useState(6);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Update undo/redo state when room state changes
  useEffect(() => {
    if (!room) return;

    const updateUndoRedoState = () => {
      setCanUndo(whiteboardService.canUndo());
      setCanRedo(whiteboardService.canRedo());
    };

    // Initial state
    updateUndoRedoState();

    // Listen for state changes
    whiteboardService.onStateChange(() => {
      updateUndoRedoState();
    });

    // Poll for undo/redo state changes (as a fallback)
    const interval = setInterval(updateUndoRedoState, 500);

    return () => {
      clearInterval(interval);
    };
  }, [room]);

  const handleConnected = useCallback((connectedRoom: Room) => {
    setRoom(connectedRoom);
    
    // Set initial tool state
    whiteboardService.setTool(selectedTool);
    whiteboardService.setColor(selectedColor);
    whiteboardService.setStrokeWidth(strokeWidth);
  }, [selectedTool, selectedColor, strokeWidth]);

  const handleDisconnected = useCallback(() => {
    setRoom(null);
  }, []);

  const handleToolChange = useCallback((tool: DrawingToolType) => {
    setSelectedTool(tool);
    whiteboardService.setTool(tool);
  }, []);

  const handleColorChange = useCallback((color: string) => {
    setSelectedColor(color);
    whiteboardService.setColor(color);
  }, []);

  const handleStrokeWidthChange = useCallback((width: number) => {
    setStrokeWidth(width);
    whiteboardService.setStrokeWidth(width);
  }, []);

  const handleUndo = useCallback(() => {
    whiteboardService.undo();
  }, []);

  const handleRedo = useCallback(() => {
    whiteboardService.redo();
  }, []);

  const handleClear = useCallback(() => {
    whiteboardService.clearAll();
  }, []);

  const handleSave = useCallback(async () => {
    try {
      const imageDataUrl = await whiteboardService.exportImage();
      
      // Create a download link
      const link = document.createElement('a');
      link.href = imageDataUrl;
      link.download = `whiteboard-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Whiteboard saved successfully');
    } catch (error) {
      console.error('Failed to save whiteboard:', error);
      throw error;
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) handleUndo();
      }
      
      // Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z for redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo) handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, handleUndo, handleRedo]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Whiteboard Canvas */}
      <WhiteboardCanvas
        config={config}
        onConnected={handleConnected}
        onDisconnected={handleDisconnected}
        onError={onError}
      />

      {/* Tool Palette - Left side */}
      {room && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
          <ToolPalette
            selectedTool={selectedTool}
            onToolChange={handleToolChange}
          />
        </div>
      )}

      {/* Color Picker - Bottom left */}
      {room && (
        <div className="absolute left-4 bottom-4 z-10">
          <ColorPicker
            selectedColor={selectedColor}
            onColorChange={handleColorChange}
          />
        </div>
      )}

      {/* Stroke Width Selector - Bottom center-left */}
      {room && (
        <div className="absolute left-56 bottom-4 z-10">
          <StrokeWidthSelector
            selectedWidth={strokeWidth}
            onWidthChange={handleStrokeWidthChange}
            currentColor={selectedColor}
          />
        </div>
      )}

      {/* Action Controls - Right side */}
      {room && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
          <WhiteboardActions
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onClear={handleClear}
            onSave={handleSave}
          />
        </div>
      )}
    </div>
  );
}
