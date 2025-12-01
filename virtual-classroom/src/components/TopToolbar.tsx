import { useRef } from 'react';
import type { PresentationMode } from '../types';

interface TopToolbarProps {
  mode: PresentationMode;
  onModeChange: (mode: PresentationMode) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onPDFUpload: (file: File) => void;
  currentFileName: string | null;
  isUploadingPDF?: boolean;
}

export default function TopToolbar({
  mode,
  onModeChange,
  currentPage,
  totalPages,
  onPageChange,
  zoom,
  onZoomChange,
  onPDFUpload,
  currentFileName,
  isUploadingPDF = false,
}: TopToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      onPDFUpload(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    if (zoom < 3.0) {
      onZoomChange(Math.min(3.0, zoom + 0.1));
    }
  };

  const handleZoomOut = () => {
    if (zoom > 0.5) {
      onZoomChange(Math.max(0.5, zoom - 0.1));
    }
  };

  const handleZoomReset = () => {
    onZoomChange(1.2);
  };

  return (
    <div 
      className="h-14 px-4 flex items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-sm flex-shrink-0"
      role="toolbar"
      aria-label="Presentation controls"
    >
      {/* Left Section - Mode Selector */}
      <div className="flex items-center gap-2" role="group" aria-label="Presentation mode selector">
        <button
          onClick={() => onModeChange('pdf')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            mode === 'pdf'
              ? 'bg-[#5C0099] text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          aria-pressed={mode === 'pdf'}
          aria-label="PDF mode"
        >
          <svg className="w-4 h-4 inline-block mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          PDF
        </button>
        <button
          onClick={() => onModeChange('screenshare')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            mode === 'screenshare'
              ? 'bg-[#5C0099] text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          aria-pressed={mode === 'screenshare'}
          aria-label="Screen share mode"
        >
          <svg className="w-4 h-4 inline-block mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Screen
        </button>
        <button
          onClick={() => onModeChange('whiteboard')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            mode === 'whiteboard'
              ? 'bg-[#5C0099] text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          aria-pressed={mode === 'whiteboard'}
          aria-label="Whiteboard mode"
        >
          <svg className="w-4 h-4 inline-block mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Board
        </button>
      </div>

      {/* Center Section - Page Navigation & Zoom (PDF mode only) */}
      {mode === 'pdf' && totalPages > 0 && (
        <div className="flex items-center gap-4">
          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm text-gray-700 min-w-[80px] text-center">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Zoom out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
            <button
              onClick={handleZoomReset}
              className="text-sm text-gray-700 hover:text-[#5C0099] min-w-[50px] transition-colors"
              aria-label={`Current zoom ${Math.round(zoom * 100)}%, click to reset`}
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 3.0}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Zoom in"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Right Section - File Info & Upload (PDF mode only) */}
      {mode === 'pdf' && (
        <div className="flex items-center gap-3">
          {currentFileName && (
            <span className="text-sm text-gray-600 max-w-[200px] truncate" title={currentFileName}>
              {currentFileName}
            </span>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Upload PDF file"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingPDF}
            className="px-3 py-1.5 bg-[#FDC500] text-[#03071E] rounded-lg text-sm font-medium hover:bg-[#FFD500] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            aria-label="Upload PDF"
          >
            {isUploadingPDF ? (
              <>
                <svg className="w-4 h-4 inline-block mr-1.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 inline-block mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload PDF
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
