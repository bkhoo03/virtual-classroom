/**
 * PDFViewerWithAnnotations Component
 * 
 * Manages PDF rendering and annotation canvas overlay with proper coordinate transformation.
 * Integrates AnnotationCanvas and LaserPointerIndicator components.
 * Handles annotation persistence per page using AnnotationStorageService.
 */

import { useState, useCallback, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import '../utils/pdfWorker';
import AnnotationCanvas from './AnnotationCanvas';
import type { AnnotationCanvasRef } from './AnnotationCanvas';
import LaserPointerIndicator from './LaserPointerIndicator';
import { annotationStorageService } from '../services/AnnotationStorageService';
import type { AnnotationStroke } from '../types/annotation-storage.types';
import type { AnnotationTool } from './AnnotationToolbar';
import { useToast } from '../contexts/ToastContext';
import ErrorBoundary from './ErrorBoundary';
import { useScreenReaderAnnouncement } from '../hooks/useScreenReaderAnnouncement';

interface PDFViewerWithAnnotationsProps {
  fileUrl: string;
  currentPage: number;
  zoom: number;
  tool: AnnotationTool;
  color: string;
  strokeWidth: number;
  documentId?: string;
  onPageLoad?: (pageNumber: number, width: number, height: number) => void;
  onAnnotationsChange?: (pageNumber: number, annotations: AnnotationStroke[]) => void;
  onDocumentLoad?: (numPages: number) => void;
}

export interface PDFViewerWithAnnotationsRef {
  clearCurrentPageAnnotations: () => void;
  saveCurrentPageAnnotations: () => void;
}

const PDFViewerWithAnnotations = forwardRef<PDFViewerWithAnnotationsRef, PDFViewerWithAnnotationsProps>(
  (props, ref) => {
    const {
      fileUrl,
      currentPage,
      zoom,
      tool,
      color,
      strokeWidth,
      documentId: externalDocumentId,
      onPageLoad,
      onAnnotationsChange,
      onDocumentLoad,
    } = props;
  const [_numPages, setNumPages] = useState<number>(0);
  const [pageWidth, setPageWidth] = useState<number>(0);
  const [pageHeight, setPageHeight] = useState<number>(0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [laserPointerPosition, setLaserPointerPosition] = useState<{ x: number; y: number } | null>(null);
  const [documentId, setDocumentId] = useState<string>('');
  const [storedStrokes, setStoredStrokes] = useState<AnnotationStroke[]>([]);
  const [pdfLoadError, setPdfLoadError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [annotationsFailed, setAnnotationsFailed] = useState<boolean>(false);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  
  const canvasRef = useRef<AnnotationCanvasRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  const { showToast } = useToast();
  
  // Announce tool changes
  useScreenReaderAnnouncement(announcement, 'polite');

  // Use external document ID if provided, otherwise generate one when file URL changes
  useEffect(() => {
    if (externalDocumentId) {
      setDocumentId(externalDocumentId);
    } else {
      const newDocId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      setDocumentId(newDocId);
    }
    setPanOffset({ x: 0, y: 0 });
  }, [fileUrl, externalDocumentId]);

  /**
   * Load annotations for a specific page
   */
  const loadPageAnnotations = useCallback((pageNumber: number) => {
    if (!documentId) return;

    try {
      const annotations = annotationStorageService.loadPageAnnotations(documentId, pageNumber);
      setStoredStrokes(annotations);
      
      // Redraw annotations on canvas
      if (canvasRef.current) {
        canvasRef.current.redrawStrokes(annotations);
      }
    } catch (error) {
      console.error('Error loading page annotations:', error);
      setAnnotationsFailed(true);
      showToast('Failed to load annotations', 'warning');
    }
  }, [documentId, showToast]);

  // Load annotations when page changes
  useEffect(() => {
    if (documentId && currentPage > 0) {
      loadPageAnnotations(currentPage);
    }
  }, [documentId, currentPage, loadPageAnnotations]);
  
  // Announce tool changes
  useEffect(() => {
    const toolNames: Record<AnnotationTool, string> = {
      hand: 'Hand tool for panning',
      laser: 'Laser pointer',
      pen: 'Pen for drawing',
      highlighter: 'Highlighter',
      eraser: 'Eraser'
    };
    setAnnouncement(toolNames[tool]);
  }, [tool]);

  // Handle zoom changes - resize canvas and maintain alignment
  useEffect(() => {
    if (pageWidth > 0 && pageHeight > 0) {
      // Canvas will automatically resize via props
      // Existing annotations remain aligned because they're stored in canvas coordinates
    }
  }, [zoom]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    console.log('PDF loaded successfully:', numPages, 'pages');
    setNumPages(numPages);
    setPdfLoadError(null);
    setRetryCount(0);
    onDocumentLoad?.(numPages);
    
    // Clean up old documents (older than 7 days) when loading a new PDF
    try {
      const cleanedCount = annotationStorageService.cleanupOldDocuments(7);
      if (cleanedCount > 0) {
        console.log(`Cleaned up ${cleanedCount} old document(s) from storage`);
      }
    } catch (error) {
      console.error('Error cleaning up old documents:', error);
    }
  }, [onDocumentLoad]);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('Error loading PDF:', error);
    setPdfLoadError(error);
    showToast('Failed to load PDF. Please try again.', 'error');
  }, [showToast]);

  /**
   * Retry loading the PDF
   */
  const handleRetryPDF = useCallback(() => {
    if (retryCount >= 3) {
      showToast('Maximum retry attempts reached. Please upload a different file.', 'error');
      return;
    }
    
    setPdfLoadError(null);
    setRetryCount(prev => prev + 1);
    showToast('Retrying PDF load...', 'info');
  }, [retryCount, showToast]);

  const onPageLoadSuccess = useCallback((page: any) => {
    const { width, height } = page;
    const scaledWidth = width * zoom;
    const scaledHeight = height * zoom;
    
    setPageWidth(scaledWidth);
    setPageHeight(scaledHeight);
    
    onPageLoad?.(currentPage, scaledWidth, scaledHeight);
  }, [zoom, currentPage, onPageLoad]);

  /**
   * Transform screen coordinates to canvas coordinates accounting for zoom and pan
   */
  const transformCoordinates = (clientX: number, clientY: number): { x: number; y: number } | null => {
    try {
      if (!containerRef.current) return null;

      const rect = containerRef.current.getBoundingClientRect();
      // Account for pan offset in coordinate transformation
      const x = clientX - rect.left - panOffset.x;
      const y = clientY - rect.top - panOffset.y;

      // Validate coordinates
      if (!isFinite(x) || !isFinite(y)) {
        console.error('Invalid coordinates calculated:', { x, y, clientX, clientY, panOffset });
        return null;
      }

      return { x, y };
    } catch (error) {
      console.error('Error transforming coordinates:', error);
      return null;
    }
  };

  /**
   * Save current page annotations to storage
   * Note: This is automatically called when strokes change, but can be called manually if needed
   */
  const saveCurrentPageAnnotations = useCallback(() => {
    try {
      if (documentId && currentPage > 0) {
        const saved = annotationStorageService.savePageAnnotations(documentId, currentPage, storedStrokes);
        if (!saved) {
          showToast('Failed to save annotations. Storage may be full.', 'warning');
        }
        onAnnotationsChange?.(currentPage, storedStrokes);
      }
    } catch (error) {
      console.error('Error saving annotations:', error);
      showToast('Failed to save annotations', 'error');
    }
  }, [documentId, currentPage, storedStrokes, onAnnotationsChange, showToast]);
  
  // Automatically save annotations when they change
  useEffect(() => {
    saveCurrentPageAnnotations();
  }, [saveCurrentPageAnnotations]);

  /**
   * Handle stroke completion from AnnotationCanvas
   */
  const handleStrokeComplete = useCallback((stroke: AnnotationStroke) => {
    try {
      const newStrokes = [...storedStrokes, stroke];
      
      // Check if we're approaching the max strokes limit
      const MAX_STROKES_WARNING_THRESHOLD = 900;
      if (newStrokes.length >= MAX_STROKES_WARNING_THRESHOLD && newStrokes.length < 1000) {
        showToast(`Approaching stroke limit (${newStrokes.length}/1000)`, 'warning');
      }
      
      setStoredStrokes(newStrokes);
      
      // Save to storage (storage service will enforce max limit)
      if (documentId && currentPage > 0) {
        const saved = annotationStorageService.savePageAnnotations(documentId, currentPage, newStrokes);
        if (!saved) {
          showToast('Storage full. Some annotations may not be saved.', 'warning');
        }
        onAnnotationsChange?.(currentPage, newStrokes);
      }
    } catch (error) {
      console.error('Error handling stroke completion:', error);
      showToast('Failed to save annotation', 'error');
    }
  }, [storedStrokes, documentId, currentPage, onAnnotationsChange, showToast]);

  /**
   * Clear all annotations on current page
   */
  const handleClearAnnotations = useCallback(() => {
    try {
      setStoredStrokes([]);
      
      if (canvasRef.current) {
        canvasRef.current.clearCanvas();
      }
      
      if (documentId && currentPage > 0) {
        annotationStorageService.clearPageAnnotations(documentId, currentPage);
        onAnnotationsChange?.(currentPage, []);
      }
    } catch (error) {
      console.error('Error clearing annotations:', error);
      showToast('Failed to clear annotations', 'error');
    }
  }, [documentId, currentPage, onAnnotationsChange, showToast]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    clearCurrentPageAnnotations: handleClearAnnotations,
    saveCurrentPageAnnotations,
  }), [handleClearAnnotations, saveCurrentPageAnnotations]);

  /**
   * Handle mouse down - route to appropriate tool behavior
   */
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    try {
      if (tool === 'hand') {
        // Hand/pan tool - only enable panning when zoomed beyond 100%
        if (zoom > 1.0) {
          setIsPanning(true);
          panStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
        }
      }
      // Other tools are handled by AnnotationCanvas
    } catch (error) {
      console.error('Error handling mouse down:', error);
    }
  };

  /**
   * Handle mouse move - route to appropriate tool behavior
   */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    try {
      // Handle hand tool panning
      if (tool === 'hand') {
        if (isPanning && panStartRef.current) {
          setPanOffset({
            x: e.clientX - panStartRef.current.x,
            y: e.clientY - panStartRef.current.y,
          });
        }
      }
      
      // Update laser pointer position
      if (tool === 'laser') {
        const coords = transformCoordinates(e.clientX, e.clientY);
        if (coords) {
          setLaserPointerPosition(coords);
        }
      } else {
        // Hide laser pointer for other tools
        setLaserPointerPosition(null);
      }
    } catch (error) {
      console.error('Error handling mouse move:', error);
    }
  };

  /**
   * Handle mouse up - route to appropriate tool behavior
   */
  const handleMouseUp = () => {
    try {
      if (isPanning) {
        setIsPanning(false);
        panStartRef.current = null;
      }
    } catch (error) {
      console.error('Error handling mouse up:', error);
    }
  };

  /**
   * Handle mouse leave - cleanup states
   */
  const handleMouseLeave = () => {
    try {
      setLaserPointerPosition(null);
      if (isPanning) {
        setIsPanning(false);
        panStartRef.current = null;
      }
    } catch (error) {
      console.error('Error handling mouse leave:', error);
    }
  };

  /**
   * Get cursor style based on tool
   */
  const getCursorStyle = (): string => {
    if (tool === 'hand') {
      // Only show grab cursor when zoom is beyond 100%
      if (zoom > 1.0) {
        return isPanning ? 'grabbing' : 'grab';
      }
      return 'default';
    }
    if (tool === 'laser') {
      return 'default';
    }
    if (tool === 'pen' || tool === 'highlighter' || tool === 'eraser') {
      return 'crosshair';
    }
    return 'default';
  };

  // Show error state with retry option if PDF failed to load
  if (pdfLoadError) {
    return (
      <div className="h-full flex flex-col bg-gray-50 relative">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-600 font-medium text-lg mb-2">Failed to load PDF</p>
            <p className="text-gray-500 text-sm mb-4">
              {pdfLoadError.message || 'An error occurred while loading the PDF file'}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRetryPDF}
                disabled={retryCount >= 3}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {retryCount >= 3 ? 'Max Retries Reached' : `Retry (${retryCount}/3)`}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="h-full flex flex-col bg-gray-50 relative">
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-red-600 font-medium text-lg mb-2">PDF Viewer Error</p>
              <p className="text-gray-500 text-sm mb-4">
                An unexpected error occurred. Please try uploading a different file.
              </p>
            </div>
          </div>
        </div>
      }
      onError={(error, errorInfo) => {
        console.error('PDF Viewer Error:', error, errorInfo);
        showToast('PDF viewer encountered an error', 'error');
      }}
    >
      <div 
        className="h-full flex flex-col bg-gray-50 relative"
        role="region"
        aria-label="PDF viewer with annotations"
      >
        {/* PDF Document Container */}
        <div 
          className="flex-1 overflow-auto relative"
          role="document"
          aria-label={`PDF document, page ${currentPage}`}
        >
          <div className="flex items-center justify-center min-h-full p-8">
            <div
              ref={containerRef}
              className="relative"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
                cursor: getCursorStyle(),
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              role="img"
              aria-label={`PDF page ${currentPage}, ${tool === 'hand' ? 'pan mode' : tool === 'laser' ? 'laser pointer mode' : tool === 'eraser' ? 'eraser mode' : 'drawing mode'}`}
            >
              <Document
                file={fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mb-4"></div>
                    <p className="text-gray-600">Loading PDF...</p>
                  </div>
                }
                error={
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <p className="text-red-600 font-medium">Failed to load PDF</p>
                    <p className="text-gray-500 text-sm mt-2">Please try uploading a different file</p>
                  </div>
                }
              >
                <Page
                  pageNumber={currentPage}
                  scale={zoom}
                  onLoadSuccess={onPageLoadSuccess}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="shadow-lg"
                />
              </Document>

              {/* Annotation Canvas Overlay - only render if annotations haven't failed */}
              {pageWidth > 0 && pageHeight > 0 && !annotationsFailed && (
                <AnnotationCanvas
                  ref={canvasRef}
                  width={pageWidth}
                  height={pageHeight}
                  tool={tool}
                  color={color}
                  strokeWidth={strokeWidth}
                  zoom={zoom}
                  onStrokeComplete={handleStrokeComplete}
                  storedStrokes={storedStrokes}
                />
              )}

              {/* Laser Pointer Indicator */}
              {tool === 'laser' && laserPointerPosition && (
                <LaserPointerIndicator
                  position={laserPointerPosition}
                  zoom={zoom}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
  }
);

PDFViewerWithAnnotations.displayName = 'PDFViewerWithAnnotations';

export default PDFViewerWithAnnotations;
