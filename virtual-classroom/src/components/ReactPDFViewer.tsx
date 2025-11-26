/**
 * React-PDF Viewer Component with Canvas Annotations
 * PDF viewer using react-pdf with canvas-based annotation overlay
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import '../utils/pdfWorker';

interface ReactPDFViewerProps {
  fileUrl: string;
  tool?: 'pointer' | 'pen' | 'highlighter' | 'eraser';
  color?: string;
  strokeWidth?: number;
}

export default function ReactPDFViewer({ 
  fileUrl, 
  tool = 'pointer',
  color = '#DC2626',
  strokeWidth = 2 
}: ReactPDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [pageWidth, setPageWidth] = useState<number>(0);
  const [pageHeight, setPageHeight] = useState<number>(0);
  
  // Canvas annotation state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    console.log('PDF loaded successfully:', numPages, 'pages');
    setNumPages(numPages);
    setCurrentPage(1);
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('Error loading PDF:', error);
  }, []);

  const onPageLoadSuccess = useCallback((page: any) => {
    const { width, height } = page;
    setPageWidth(width * scale);
    setPageHeight(height * scale);
  }, [scale]);

  // Initialize canvas context
  useEffect(() => {
    if (canvasRef.current && pageWidth > 0 && pageHeight > 0) {
      const canvas = canvasRef.current;
      canvas.width = pageWidth;
      canvas.height = pageHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        setContext(ctx);
      }
    }
  }, [pageWidth, pageHeight]);

  // Drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === 'pointer' || !context) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    context.beginPath();
    context.moveTo(x, y);
    
    // Set drawing style
    context.strokeStyle = color;
    context.lineWidth = tool === 'highlighter' ? strokeWidth * 3 : strokeWidth;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.globalAlpha = tool === 'highlighter' ? 0.3 : 1.0;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context || tool === 'pointer') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (tool === 'eraser') {
      context.clearRect(x - 10, y - 10, 20, 20);
    } else {
      context.lineTo(x, y);
      context.stroke();
    }
  };

  const stopDrawing = () => {
    if (context) {
      context.globalAlpha = 1.0;
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (context && canvasRef.current) {
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  // Page navigation
  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, numPages));
  };

  // Zoom controls
  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const resetZoom = () => {
    setScale(1.2);
  };

  // Get cursor style
  const getCursor = () => {
    if (tool === 'pointer') return 'default';
    if (tool === 'eraser') return 'crosshair';
    return 'crosshair';
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 relative">
      {/* PDF Document Container */}
      <div className="flex-1 overflow-auto relative">
        <div className="flex items-center justify-center min-h-full p-8">
          <div className="relative">
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
                scale={scale}
                onLoadSuccess={onPageLoadSuccess}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="shadow-lg"
              />
            </Document>

            {/* Canvas Annotation Layer */}
            {pageWidth > 0 && pageHeight > 0 && (
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0"
                style={{
                  cursor: getCursor(),
                  pointerEvents: tool === 'pointer' ? 'none' : 'auto',
                }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            )}
          </div>
        </div>
      </div>

      {/* Page Navigation - Bottom Left */}
      {numPages > 0 && (
        <div className="absolute bottom-4 left-4 z-50 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-2 rounded-lg border border-gray-200 shadow-lg">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className={`
              w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200
              ${currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-110'
              }
            `}
            aria-label="Previous page"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="text-sm font-medium text-gray-700 px-3 min-w-[80px] text-center">
            {currentPage} / {numPages}
          </div>

          <button
            onClick={goToNextPage}
            disabled={currentPage === numPages}
            className={`
              w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200
              ${currentPage === numPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-110'
              }
            `}
            aria-label="Next page"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Zoom & Clear Controls - Bottom Right */}
      <div className="absolute bottom-4 right-4 z-50 flex items-center gap-2">
        {/* Clear Annotations Button */}
        {tool !== 'pointer' && (
          <button
            onClick={clearCanvas}
            className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/95 backdrop-blur-md border border-gray-200 shadow-lg text-red-600 hover:bg-red-50 hover:scale-110 transition-all duration-200"
            aria-label="Clear annotations"
            title="Clear all annotations"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}

        {/* Zoom Controls */}
        <div className="flex flex-col gap-2 bg-white/95 backdrop-blur-md px-3 py-3 rounded-lg border border-gray-200 shadow-lg">
          <button
            onClick={zoomIn}
            disabled={scale >= 3.0}
            className={`
              w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200
              ${scale >= 3.0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-110'
              }
            `}
            aria-label="Zoom in"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          <div className="text-xs font-medium text-gray-700 text-center py-1">
            {Math.round(scale * 100)}%
          </div>

          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className={`
              w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200
              ${scale <= 0.5
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-110'
              }
            `}
            aria-label="Zoom out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
            </svg>
          </button>

          <button
            onClick={resetZoom}
            className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-110 transition-all duration-200"
            aria-label="Reset zoom"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
