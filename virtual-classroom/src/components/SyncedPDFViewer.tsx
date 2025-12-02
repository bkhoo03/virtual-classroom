import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

interface SyncedPDFViewerProps {
  pdfUrl: string;
  sessionId: string;
  onPageChange?: (page: number) => void;
  externalPage?: number;
  className?: string;
}

export default function SyncedPDFViewer({
  pdfUrl,
  sessionId,
  onPageChange,
  externalPage,
  className = '',
}: SyncedPDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFallbackNotice, setShowFallbackNotice] = useState(true);
  const [scale, setScale] = useState(1.0);

  // Sync with external page changes (from other users)
  useEffect(() => {
    if (externalPage && externalPage !== pageNumber) {
      setPageNumber(externalPage);
    }
  }, [externalPage]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF document');
    setLoading(false);
  };

  const changePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= numPages) {
      setPageNumber(newPage);
      onPageChange?.(newPage);
    }
  };

  const previousPage = () => changePage(pageNumber - 1);
  const nextPage = () => changePage(pageNumber + 1);

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const resetZoom = () => setScale(1.0);

  return (
    <div className={`relative w-full h-full bg-gray-100 ${className}`}>
      {/* Fallback Notice */}
      {showFallbackNotice && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 max-w-2xl">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg shadow-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-yellow-700 font-medium">
                  Fallback PDF Viewer
                </p>
                <p className="mt-1 text-sm text-yellow-600">
                  This is a fallback viewer. For the best experience with annotations and collaboration, please use the Agora Whiteboard document viewer first. Use this viewer if the whiteboard document upload doesn't work.
                </p>
              </div>
              <button
                onClick={() => setShowFallbackNotice(false)}
                className="ml-3 flex-shrink-0 text-yellow-400 hover:text-yellow-600 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Document */}
      <div className="h-full overflow-auto flex flex-col items-center py-8">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mb-4"></div>
              <p className="text-gray-600">Loading PDF...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md px-6">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Failed to Load PDF
              </h3>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
            error={null}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="shadow-lg"
            />
          </Document>
        )}
      </div>

      {/* Controls */}
      {!loading && !error && numPages > 0 && (
        <>
          {/* Page Navigation */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-3">
            <button
              onClick={previousPage}
              disabled={pageNumber <= 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Previous page"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <span className="text-sm font-medium text-gray-700 min-w-[100px] text-center">
              Page {pageNumber} / {numPages}
            </span>

            <button
              onClick={nextPage}
              disabled={pageNumber >= numPages}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Next page"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="absolute bottom-6 right-6 z-10 bg-white rounded-lg shadow-lg px-3 py-2 flex flex-col gap-2">
            <button
              onClick={zoomIn}
              disabled={scale >= 3.0}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Zoom in"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </button>

            <button
              onClick={resetZoom}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-xs font-medium"
              title="Reset zoom"
            >
              {Math.round(scale * 100)}%
            </button>

            <button
              onClick={zoomOut}
              disabled={scale <= 0.5}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Zoom out"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
          </div>

          {/* Sync Indicator */}
          <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-sm rounded-full shadow-sm border border-gray-200 px-3 py-1.5 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-medium text-gray-900">Synced</span>
          </div>
        </>
      )}
    </div>
  );
}
