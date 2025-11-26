import { useCallback, useEffect, useRef } from 'react';
import { useClassroomContext } from '../contexts/ClassroomContext';
import { whiteboardService } from '../services/WhiteboardService';
import type { WhiteboardConfig, DrawingToolType } from '../types/whiteboard.types';
import type { Room, RoomState, RoomPhase } from 'white-web-sdk';

/**
 * Custom hook for managing whiteboard state and operations
 */
export function useWhiteboard() {
  const { state, dispatch } = useClassroomContext();
  const roomRef = useRef<Room | null>(null);

  /**
   * Initialize whiteboard SDK
   */
  const initialize = useCallback((appId: string) => {
    try {
      whiteboardService.initialize(appId);
    } catch (error) {
      console.error('Failed to initialize whiteboard:', error);
      throw error;
    }
  }, []);

  /**
   * Join a whiteboard room
   */
  const joinRoom = useCallback(async (config: WhiteboardConfig) => {
    try {
      const room = await whiteboardService.joinRoom(config);
      roomRef.current = room;

      // Update connection state
      dispatch({ type: 'SET_WHITEBOARD_CONNECTED', payload: true });

      // Set up state change listener
      whiteboardService.onStateChange((roomState: RoomState) => {
        // Update undo/redo availability
        const canUndo = whiteboardService.canUndo();
        const canRedo = whiteboardService.canRedo();
        dispatch({
          type: 'SET_WHITEBOARD_UNDO_REDO',
          payload: { canUndo, canRedo }
        });
      });

      // Set up phase change listener
      whiteboardService.onPhaseChange((phase: RoomPhase) => {
        const isConnected = phase === 'connected';
        dispatch({ type: 'SET_WHITEBOARD_CONNECTED', payload: isConnected });
      });

      return room;
    } catch (error) {
      console.error('Failed to join whiteboard room:', error);
      dispatch({ type: 'SET_WHITEBOARD_CONNECTED', payload: false });
      throw error;
    }
  }, [dispatch]);

  /**
   * Leave the whiteboard room
   */
  const leaveRoom = useCallback(async () => {
    try {
      await whiteboardService.leaveRoom();
      roomRef.current = null;
      dispatch({ type: 'SET_WHITEBOARD_CONNECTED', payload: false });
    } catch (error) {
      console.error('Error leaving whiteboard room:', error);
    }
  }, [dispatch]);

  /**
   * Set the current drawing tool
   */
  const setTool = useCallback((tool: DrawingToolType) => {
    whiteboardService.setTool(tool);
    dispatch({ type: 'SET_WHITEBOARD_TOOL', payload: tool });
  }, [dispatch]);

  /**
   * Set the stroke color
   */
  const setColor = useCallback((color: string) => {
    whiteboardService.setColor(color);
    dispatch({ type: 'SET_WHITEBOARD_COLOR', payload: color });
  }, [dispatch]);

  /**
   * Set the stroke width
   */
  const setStrokeWidth = useCallback((width: number) => {
    whiteboardService.setStrokeWidth(width);
    dispatch({ type: 'SET_WHITEBOARD_STROKE_WIDTH', payload: width });
  }, [dispatch]);

  /**
   * Undo the last action
   */
  const undo = useCallback(() => {
    whiteboardService.undo();
    
    // Update undo/redo state
    const canUndo = whiteboardService.canUndo();
    const canRedo = whiteboardService.canRedo();
    dispatch({
      type: 'SET_WHITEBOARD_UNDO_REDO',
      payload: { canUndo, canRedo }
    });
  }, [dispatch]);

  /**
   * Redo the last undone action
   */
  const redo = useCallback(() => {
    whiteboardService.redo();
    
    // Update undo/redo state
    const canUndo = whiteboardService.canUndo();
    const canRedo = whiteboardService.canRedo();
    dispatch({
      type: 'SET_WHITEBOARD_UNDO_REDO',
      payload: { canUndo, canRedo }
    });
  }, [dispatch]);

  /**
   * Clear all content from the whiteboard
   */
  const clearAll = useCallback(() => {
    whiteboardService.clearAll();
    
    // Update undo/redo state
    const canUndo = whiteboardService.canUndo();
    const canRedo = whiteboardService.canRedo();
    dispatch({
      type: 'SET_WHITEBOARD_UNDO_REDO',
      payload: { canUndo, canRedo }
    });
  }, [dispatch]);

  /**
   * Export whiteboard as image
   */
  const exportImage = useCallback(async () => {
    try {
      return await whiteboardService.exportImage();
    } catch (error) {
      console.error('Error exporting whiteboard image:', error);
      throw error;
    }
  }, []);

  /**
   * Get the current room instance
   */
  const getRoom = useCallback(() => {
    return whiteboardService.getRoom();
  }, []);

  /**
   * Check if connected to a room
   */
  const isConnected = useCallback(() => {
    return whiteboardService.isConnected();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (roomRef.current) {
        whiteboardService.leaveRoom();
      }
    };
  }, []);

  return {
    // State
    isConnected: state.whiteboard.isConnected,
    currentTool: state.whiteboard.currentTool,
    currentColor: state.whiteboard.currentColor,
    strokeWidth: state.whiteboard.strokeWidth,
    canUndo: state.whiteboard.canUndo,
    canRedo: state.whiteboard.canRedo,

    // Actions
    initialize,
    joinRoom,
    leaveRoom,
    setTool,
    setColor,
    setStrokeWidth,
    undo,
    redo,
    clearAll,
    exportImage,
    getRoom,
    isConnected: isConnected
  };
}
