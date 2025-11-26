import React from 'react';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onZoomChange?: (zoom: number) => void;
  minZoom?: number;
  maxZoom?: number;
}

export default function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  minZoom = 0.5,
  maxZoom = 3,
}: ZoomControlsProps) {
  const zoomPercentage = Math.round(zoom * 100);
  const canZoomIn = zoom < maxZoom;
  const canZoomOut = zoom > minZoom;

  const [showHint, setShowHint] = React.useState(false);

  return (
    <div 
      className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#03071E]/80 backdrop-blur-md rounded-xl shadow-xl px-2 py-2 flex flex-col items-center gap-1.5 z-50 border border-white/10 group"
      onMouseEnter={() => setShowHint(true)}
      onMouseLeave={() => setShowHint(false)}
    >
      {/* Zoom In */}
      <button
        onClick={onZoomIn}
        disabled={!canZoomIn}
        className={`
          w-9 h-9 rounded-md flex items-center justify-center transition-all p-0
          ${
            canZoomIn
              ? 'bg-[#5C0099] hover:bg-[#C86BFA] text-white hover:scale-110'
              : 'bg-white/5 text-white/30 cursor-not-allowed'
          }
        `}
        aria-label="Zoom in"
        title="Zoom in"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Zoom Percentage */}
      <div className="px-2 py-1 text-[10px] font-bold text-white text-center min-w-[2.5rem] bg-white/10 rounded">
        {zoomPercentage}%
      </div>

      {/* Zoom Out */}
      <button
        onClick={onZoomOut}
        disabled={!canZoomOut}
        className={`
          w-9 h-9 rounded-md flex items-center justify-center transition-all p-0
          ${
            canZoomOut
              ? 'bg-[#5C0099] hover:bg-[#C86BFA] text-white hover:scale-110'
              : 'bg-white/5 text-white/30 cursor-not-allowed'
          }
        `}
        aria-label="Zoom out"
        title="Zoom out"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
        </svg>
      </button>

      {/* Divider */}
      <div className="w-full h-px bg-white/20 my-0.5" />

      {/* Reset Zoom */}
      <button
        onClick={onResetZoom}
        className="w-9 h-9 rounded-md flex items-center justify-center transition-all bg-[#FDC500] hover:bg-[#FFD500] text-[#03071E] hover:scale-110 p-0"
        aria-label="Reset zoom"
        title="Reset zoom (100%)"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
          />
        </svg>
      </button>

      {/* Hover Hint */}
      {showHint && (
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-[#03071E]/95 backdrop-blur-md text-white px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap border border-white/10 shadow-xl pointer-events-none">
          Hold <span className="text-[#FDC500] font-bold">Alt</span> + Scroll to zoom
        </div>
      )}
    </div>
  );
}
