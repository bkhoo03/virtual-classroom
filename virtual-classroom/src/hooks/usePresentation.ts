import { useCallback } from 'react';
import { useClassroomContext } from '../contexts/ClassroomContext';
import type { PresentationMode, PresentationContent } from '../types';
import type { Annotation } from '../types/whiteboard.types';

/**
 * Custom hook for managing presentation state and operations
 */
export function usePresentation() {
  const { state, dispatch } = useClassroomContext();

  /**
   * Set the presentation mode
   */
  const setMode = useCallback((mode: PresentationMode) => {
    dispatch({ type: 'SET_PRESENTATION_MODE', payload: mode });
  }, [dispatch]);

  /**
   * Set the presentation content
   */
  const setContent = useCallback((content: PresentationContent) => {
    dispatch({ type: 'SET_PRESENTATION_CONTENT', payload: content });
  }, [dispatch]);

  /**
   * Navigate to a specific page
   */
  const goToPage = useCallback((pageNumber: number) => {
    const { totalPages } = state.presentation;
    
    // Validate page number
    if (pageNumber < 1 || (totalPages > 0 && pageNumber > totalPages)) {
      console.warn('Invalid page number:', pageNumber);
      return;
    }

    dispatch({ type: 'SET_CURRENT_PAGE', payload: pageNumber });
  }, [state.presentation, dispatch]);

  /**
   * Navigate to the next page
   */
  const nextPage = useCallback(() => {
    const { currentPage, totalPages } = state.presentation;
    if (totalPages > 0 && currentPage < totalPages) {
      dispatch({ type: 'SET_CURRENT_PAGE', payload: currentPage + 1 });
    }
  }, [state.presentation, dispatch]);

  /**
   * Navigate to the previous page
   */
  const previousPage = useCallback(() => {
    const { currentPage } = state.presentation;
    if (currentPage > 1) {
      dispatch({ type: 'SET_CURRENT_PAGE', payload: currentPage - 1 });
    }
  }, [state.presentation, dispatch]);

  /**
   * Set the zoom level
   */
  const setZoom = useCallback((zoom: number) => {
    // Clamp zoom between 0.5 and 3.0
    const clampedZoom = Math.max(0.5, Math.min(3.0, zoom));
    dispatch({ type: 'SET_ZOOM', payload: clampedZoom });
  }, [dispatch]);

  /**
   * Zoom in
   */
  const zoomIn = useCallback(() => {
    const newZoom = Math.min(3.0, state.presentation.zoom + 0.25);
    dispatch({ type: 'SET_ZOOM', payload: newZoom });
  }, [state.presentation.zoom, dispatch]);

  /**
   * Zoom out
   */
  const zoomOut = useCallback(() => {
    const newZoom = Math.max(0.5, state.presentation.zoom - 0.25);
    dispatch({ type: 'SET_ZOOM', payload: newZoom });
  }, [state.presentation.zoom, dispatch]);

  /**
   * Reset zoom to 100%
   */
  const resetZoom = useCallback(() => {
    dispatch({ type: 'SET_ZOOM', payload: 1.0 });
  }, [dispatch]);

  /**
   * Add an annotation
   */
  const addAnnotation = useCallback((annotation: Annotation) => {
    dispatch({ type: 'ADD_ANNOTATION', payload: annotation });
  }, [dispatch]);

  /**
   * Remove an annotation by ID
   */
  const removeAnnotation = useCallback((annotationId: string) => {
    dispatch({ type: 'REMOVE_ANNOTATION', payload: annotationId });
  }, [dispatch]);

  /**
   * Clear all annotations
   */
  const clearAnnotations = useCallback(() => {
    dispatch({ type: 'CLEAR_ANNOTATIONS' });
  }, [dispatch]);

  /**
   * Set the active annotation tool
   */
  const setActiveTool = useCallback((tool: string | null) => {
    dispatch({ type: 'SET_ACTIVE_TOOL', payload: tool });
  }, [dispatch]);

  /**
   * Load a PDF document
   */
  const loadPDF = useCallback((url: string, numPages: number) => {
    const content: PresentationContent = {
      type: 'pdf',
      data: { url, numPages },
      totalPages: numPages
    };
    
    dispatch({ type: 'SET_PRESENTATION_MODE', payload: 'pdf' });
    dispatch({ type: 'SET_PRESENTATION_CONTENT', payload: content });
    dispatch({ type: 'SET_CURRENT_PAGE', payload: 1 });
  }, [dispatch]);

  /**
   * Start screen sharing
   */
  const startScreenShare = useCallback((stream: MediaStream) => {
    const content: PresentationContent = {
      type: 'screenshare',
      data: stream
    };
    
    dispatch({ type: 'SET_PRESENTATION_MODE', payload: 'screenshare' });
    dispatch({ type: 'SET_PRESENTATION_CONTENT', payload: content });
  }, [dispatch]);

  /**
   * Stop screen sharing
   */
  const stopScreenShare = useCallback(() => {
    // Stop all tracks in the stream
    if (state.presentation.content?.data instanceof MediaStream) {
      const stream = state.presentation.content.data as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    dispatch({ type: 'SET_PRESENTATION_CONTENT', payload: null });
  }, [state.presentation.content, dispatch]);

  /**
   * Switch to whiteboard mode
   */
  const switchToWhiteboard = useCallback((roomId: string, roomToken: string) => {
    const content: PresentationContent = {
      type: 'whiteboard',
      data: { roomId, roomToken }
    };
    
    dispatch({ type: 'SET_PRESENTATION_MODE', payload: 'whiteboard' });
    dispatch({ type: 'SET_PRESENTATION_CONTENT', payload: content });
  }, [dispatch]);

  return {
    // State
    mode: state.presentation.mode,
    content: state.presentation.content,
    currentPage: state.presentation.currentPage,
    totalPages: state.presentation.totalPages,
    zoom: state.presentation.zoom,
    annotations: state.presentation.annotations,
    activeTool: state.presentation.activeTool,

    // Mode actions
    setMode,
    setContent,

    // Navigation actions
    goToPage,
    nextPage,
    previousPage,

    // Zoom actions
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,

    // Annotation actions
    addAnnotation,
    removeAnnotation,
    clearAnnotations,
    setActiveTool,

    // Content loading actions
    loadPDF,
    startScreenShare,
    stopScreenShare,
    switchToWhiteboard
  };
}
