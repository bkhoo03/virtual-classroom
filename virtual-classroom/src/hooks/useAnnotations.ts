import { useState, useCallback, useRef } from 'react';
import annotationService from '../services/AnnotationService';
import type { AnnotationData } from '../components/AnnotationLayer';

export type AnnotationTool = 'hand' | 'laser' | 'pen' | 'highlighter' | 'eraser';

interface UseAnnotationsOptions {
  enabled?: boolean;
  onSyncError?: (error: Error) => void;
}

/**
 * Custom hook for managing annotation state and synchronization
 */
export function useAnnotations(options: UseAnnotationsOptions = {}) {
  const { enabled = true, onSyncError } = options;

  const [currentTool, setCurrentTool] = useState<AnnotationTool>('hand');
  const [currentColor, setCurrentColor] = useState<string>('#DC2626'); // Teacher red
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  const [isAnnotating, setIsAnnotating] = useState(false);
  
  const annotationsRef = useRef<AnnotationData[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  /**
   * Handle annotation start
   */
  const handleAnnotationStart = useCallback(() => {
    setIsAnnotating(true);
  }, []);

  /**
   * Handle annotation end and sync with whiteboard
   */
  const handleAnnotationEnd = useCallback(
    async (annotation: AnnotationData) => {
      setIsAnnotating(false);

      if (!enabled) return;

      // Store annotation locally
      annotationsRef.current.push(annotation);

      // Sync with whiteboard service
      try {
        await annotationService.syncAnnotation(annotation);
      } catch (error) {
        console.error('Failed to sync annotation:', error);
        onSyncError?.(error instanceof Error ? error : new Error('Sync failed'));
      }
    },
    [enabled, onSyncError]
  );

  /**
   * Clear all annotations
   */
  const clearAnnotations = useCallback(() => {
    if (canvasRef.current) {
      annotationService.clearAnnotations(canvasRef.current);
    }
    annotationsRef.current = [];
  }, []);

  /**
   * Set the canvas reference for rendering
   */
  const setCanvasRef = useCallback((canvas: HTMLCanvasElement | null) => {
    canvasRef.current = canvas;
  }, []);

  /**
   * Render a remote annotation (from other participants)
   */
  const renderRemoteAnnotation = useCallback((annotation: AnnotationData) => {
    if (canvasRef.current) {
      annotationService.renderRemoteAnnotation(canvasRef.current, annotation);
      annotationsRef.current.push(annotation);
    }
  }, []);

  /**
   * Get all annotations
   */
  const getAnnotations = useCallback(() => {
    return [...annotationsRef.current];
  }, []);

  /**
   * Change the current tool
   */
  const changeTool = useCallback((tool: AnnotationTool) => {
    setCurrentTool(tool);
  }, []);

  /**
   * Change the current color
   */
  const changeColor = useCallback((color: string) => {
    setCurrentColor(color);
  }, []);

  /**
   * Change the stroke width
   */
  const changeStrokeWidth = useCallback((width: number) => {
    setStrokeWidth(width);
  }, []);

  return {
    // State
    currentTool,
    currentColor,
    strokeWidth,
    isAnnotating,
    
    // Actions
    handleAnnotationStart,
    handleAnnotationEnd,
    clearAnnotations,
    setCanvasRef,
    renderRemoteAnnotation,
    getAnnotations,
    changeTool,
    changeColor,
    changeStrokeWidth,
  };
}
