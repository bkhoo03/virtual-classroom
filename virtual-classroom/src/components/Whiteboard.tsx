import { useState, useEffect, useCallback } from 'react';
import type { Room } from 'white-web-sdk';
import WhiteboardCanvas from './WhiteboardCanvas';
import ToolPalette from './ToolPalette';
import ColorPicker from './ColorPicker';
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
  const [selectedColor, setSelectedColor] = useState('#000000'); // Black by default
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

    // Poll for undo/redo state changes less frequently to reduce overhead
    const interval = setInterval(updateUndoRedoState, 1000); // Reduced from 500ms to 1000ms

    return () => {
      clearInterval(interval);
    };
  }, [room]);

  const handleConnected = useCallback((connectedRoom: Room) => {
    setRoom(connectedRoom);
    
    // Set initial tool state with fixed medium stroke width
    whiteboardService.setTool(selectedTool);
    whiteboardService.setColor(selectedColor);
    whiteboardService.setStrokeWidth(6); // Fixed medium width
  }, [selectedTool, selectedColor]);

  const handleDisconnected = useCallback(() => {
    setRoom(null);
  }, []);

  const handleToolChange = useCallback((tool: DrawingToolType) => {
    setSelectedTool(tool);
    // Set tool with current color and stroke width to prevent ghost tools
    whiteboardService.setTool(tool);
  }, []);

  const handleColorChange = useCallback((color: string) => {
    setSelectedColor(color);
    whiteboardService.setColor(color);
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

      {/* Left Toolbar - Tool Palette */}
      {room && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
          <ToolPalette
            selectedTool={selectedTool}
            onToolChange={handleToolChange}
          />
        </div>
      )}

      {/* Right Toolbar - Colors and Actions */}
      {room && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-3">
          {/* Color Picker */}
          <ColorPicker
            selectedColor={selectedColor}
            onColorChange={handleColorChange}
          />
          
          {/* Action Controls */}
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
