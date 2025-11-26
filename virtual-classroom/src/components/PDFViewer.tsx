import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import PanZoomContainer from './PanZoomContainer';
import ZoomControls from './ZoomControls';
import PDFAnnotationLayer, { type AnnotationTool } from './PDFAnnotationLayer';

// Configure PDF.js worker - use local worker from node_modules
// Vite will handle bundling this correctly
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface PDFViewerProps {
  url: string;
  currentPage: number;
  onPageChange: (page: number) => void;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  enableAnnotations?: boolean;
  currentTool?: AnnotationTool;
  currentColor?: string;
  strokeWidth?: number;
  onClearAnnotations?: () => void;
}

export default function PDFViewer({
  url,
  currentPage,
  onPageChange,
  zoom = 1,
  onZoomChange,
  enableAnnotations = false,
  currentTool = 'pointer',
  currentColor = '#5C0099',
  strokeWidth = 2,
  onClearAnnotations,
}: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [internalZoom, setInternalZoom] = useState<number>(zoom);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Load PDF document
  useEffect(() => {
    const loadPDF = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Failed to load PDF document');
        setIsLoading(false);
      }
    };

    if (url) {
      loadPDF();
    }

    return () => {
      if (pdfDoc) {
        pdfDoc.destroy();
      }
    };
  }, [url]);

  // Sync internal zoom with prop
  useEffect(() => {
    setInternalZoom(zoom);
  }, [zoom]);

  // Render current page
  useEffect(() => {
    let renderTask: any = null;

    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current) return;

      try {
        const page = await pdfDoc.getPage(currentPage);
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        // Cancel any ongoing render task
        if (renderTask) {
          renderTask.cancel();
        }

        // Use base scale of 1.5 for better quality, then apply zoom
        const baseScale = 1.5;
        const viewport = page.getViewport({ scale: baseScale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Update canvas size for annotation layer
        setCanvasSize({
          width: viewport.width,
          height: viewport.height,
        });

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        renderTask = page.render(renderContext);
        await renderTask.promise;
        renderTask = null;
      } catch (err: any) {
        // Ignore cancellation errors
        if (err?.name !== 'RenderingCancelledException') {
          console.error('Error rendering page:', err);
        }
      }
    };

    renderPage();

    // Cleanup function to cancel render task
    return () => {
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfDoc, currentPage]);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < numPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(3, internalZoom + 0.25);
    setInternalZoom(newZoom);
    if (onZoomChange) {
      onZoomChange(newZoom);
    }
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(0.5, internalZoom - 0.25);
    setInternalZoom(newZoom);
    if (onZoomChange) {
      onZoomChange(newZoom);
    }
  };

  const handleResetZoom = () => {
    setInternalZoom(1);
    if (onZoomChange) {
      onZoomChange(1);
    }
  };

  const handleZoomChange = (newZoom: number) => {
    setInternalZoom(newZoom);
    if (onZoomChange) {
      onZoomChange(newZoom);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0f0f1e]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#5C0099] border-t-[#FDC500] mb-4"></div>
          <p className="text-white/70">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0f0f1e]">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-400 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Zoom Controls - Vertical slider on right side */}
      <ZoomControls
        zoom={internalZoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onZoomChange={handleZoomChange}
        minZoom={0.5}
        maxZoom={3}
      />

      {/* Canvas Container with Pan & Zoom */}
      <div ref={containerRef} className="flex-1 overflow-hidden relative">
        <PanZoomContainer
          zoom={internalZoom}
          onZoomChange={handleZoomChange}
          onPanChange={setPanOffset}
          onScrollPage={(direction) => {
            if (direction === 'down') {
              handleNext();
            } else {
              handlePrevious();
            }
          }}
          minZoom={0.5}
          maxZoom={3}
          disabled={false}
        >
          <canvas ref={canvasRef} className="shadow-md" />
        </PanZoomContainer>

        {/* Annotation Layer - Outside PanZoomContainer */}
        {enableAnnotations && canvasSize.width > 0 && (
          <PDFAnnotationLayer
            width={canvasSize.width}
            height={canvasSize.height}
            zoom={internalZoom}
            panOffset={panOffset}
            currentTool={currentTool}
            currentColor={currentColor}
            strokeWidth={strokeWidth}
            pageNumber={currentPage}
            onClearRequest={onClearAnnotations}
          />
        )}
      </div>

      {/* Navigation Controls - Fixed at bottom right */}
      {numPages > 0 && (
        <div className="absolute bottom-4 right-16 z-50 flex items-center gap-2 bg-[#03071E]/80 backdrop-blur-md px-2 py-2 rounded-full border border-white/10 shadow-xl">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className={`
              w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 p-0
              ${
                currentPage === 1
                  ? 'bg-white/5 text-white/30 cursor-not-allowed'
                  : 'bg-[#5C0099] text-white hover:bg-[#C86BFA] shadow-md hover:scale-110'
              }
            `}
            style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            aria-label="Previous page"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="text-sm font-medium text-white px-3">
            {currentPage} / {numPages}
          </div>

          <button
            onClick={handleNext}
            disabled={currentPage === numPages}
            className={`
              w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 p-0
              ${
                currentPage === numPages
                  ? 'bg-white/5 text-white/30 cursor-not-allowed'
                  : 'bg-[#5C0099] text-white hover:bg-[#C86BFA] shadow-md hover:scale-110'
              }
            `}
            style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            aria-label="Next page"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
