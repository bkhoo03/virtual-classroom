import { useRef, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface PanZoomContainerProps {
  children: ReactNode;
  zoom: number;
  onZoomChange?: (zoom: number) => void;
  onPanChange?: (offset: { x: number; y: number }) => void;
  onScrollPage?: (direction: 'up' | 'down') => void;
  disabled?: boolean;
  minZoom?: number;
  maxZoom?: number;
}

export default function PanZoomContainer({
  children,
  zoom,
  onZoomChange,
  onPanChange,
  onScrollPage,
  disabled = false,
  minZoom = 0.5,
  maxZoom = 3,
}: PanZoomContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Reset pan when zoom changes to 1
  useEffect(() => {
    if (zoom === 1) {
      setPanOffset({ x: 0, y: 0 });
    }
  }, [zoom]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't pan if disabled
    if (disabled) return;

    setIsPanning(true);
    setPanStart({
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;

    const newOffset = {
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y,
    };

    setPanOffset(newOffset);
    onPanChange?.(newOffset);
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleMouseLeave = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Alt + Scroll: Zoom
    if (e.altKey && onZoomChange) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(minZoom, Math.min(maxZoom, zoom + delta));
      onZoomChange(newZoom);
      return;
    }
    
    // When zoomed in: Scroll within page (pan vertically)
    if (zoom > 1) {
      const newOffset = {
        x: panOffset.x,
        y: panOffset.y - e.deltaY,
      };
      setPanOffset(newOffset);
      onPanChange?.(newOffset);
      return;
    }
    
    // Normal scroll at 100%: Navigate pages
    if (onScrollPage) {
      e.preventDefault();
      const direction = e.deltaY > 0 ? 'down' : 'up';
      onScrollPage(direction);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
      style={{
        cursor: disabled ? 'default' : (isPanning ? 'grabbing' : 'grab'),
      }}
    >
      <div
        ref={contentRef}
        className="w-full h-full flex items-center justify-center"
        style={{
          transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
          transformOrigin: 'center center',
          transition: isPanning ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        {children}
      </div>

      {/* Pan hint when zoomed in */}
      {!disabled && zoom > 1 && !isPanning && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-[#03071E]/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-medium pointer-events-none border border-white/10 shadow-lg">
          Click and drag to pan • Alt + Scroll to zoom
        </div>
      )}
    </div>
  );
}
