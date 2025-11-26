import { useRef, useEffect, useState, useCallback } from 'react';

export type AnnotationTool = 'pointer' | 'pen' | 'highlighter' | 'eraser';

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
  tool: 'pen' | 'highlighter';
}

interface PDFAnnotationLayerProps {
  width: number;
  height: number;
  zoom: number;
  panOffset: { x: number; y: number };
  currentTool: AnnotationTool;
  currentColor: string;
  strokeWidth: number;
  pageNumber: number;
  onClearRequest?: () => void;
}

// Store annotations per page
const pageAnnotations = new Map<number, Stroke[]>();

export default function PDFAnnotationLayer({
  width,
  height,
  zoom,
  panOffset,
  currentTool,
  currentColor,
  strokeWidth,
  pageNumber,
  onClearRequest,
}: PDFAnnotationLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [showLaserDot, setShowLaserDot] = useState(false);
  const [laserPosition, setLaserPosition] = useState<Point>({ x: 0, y: 0 });

  // Get or initialize annotations for current page
  const getPageStrokes = useCallback(() => {
    if (!pageAnnotations.has(pageNumber)) {
      pageAnnotations.set(pageNumber, []);
    }
    return pageAnnotations.get(pageNumber)!;
  }, [pageNumber]);

  // Clear all annotations for current page
  const clearPage = useCallback(() => {
    pageAnnotations.set(pageNumber, []);
    redrawCanvas();
  }, [pageNumber]);

  // Expose clear function
  useEffect(() => {
    if (onClearRequest) {
      (window as any).clearPDFAnnotations = clearPage;
    }
  }, [clearPage, onClearRequest]);

  // Convert screen coordinates to canvas coordinates (PDF space, not screen space)
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      // Convert to canvas space (accounting for the transform)
      const x = (screenX - rect.left) / zoom - panOffset.x / zoom;
      const y = (screenY - rect.top) / zoom - panOffset.y / zoom;

      return { x, y };
    },
    [zoom, panOffset]
  );

  // Redraw all strokes on canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all strokes for current page
    const strokes = getPageStrokes();
    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;

      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.tool === 'highlighter') {
        ctx.globalAlpha = 0.3;
      } else {
        ctx.globalAlpha = 1.0;
      }

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });

    ctx.globalAlpha = 1.0;
  }, [getPageStrokes]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;

    redrawCanvas();
  }, [width, height, redrawCanvas]);

  // Redraw when page changes
  useEffect(() => {
    redrawCanvas();
  }, [pageNumber, redrawCanvas]);

  // Handle mouse down
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (currentTool === 'pointer') return;

      const point = screenToCanvas(e.clientX, e.clientY);

      if (currentTool === 'eraser') {
        // Erase strokes near this point
        const strokes = getPageStrokes();
        const eraserRadius = strokeWidth * 3;
        
        const remainingStrokes = strokes.filter((stroke) => {
          return !stroke.points.some((p) => {
            const dist = Math.sqrt(
              Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2)
            );
            return dist < eraserRadius;
          });
        });

        pageAnnotations.set(pageNumber, remainingStrokes);
        redrawCanvas();
      } else {
        setIsDrawing(true);
        setCurrentStroke([point]);
      }
    },
    [currentTool, screenToCanvas, strokeWidth, getPageStrokes, pageNumber, redrawCanvas]
  );

  // Handle mouse move
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const point = screenToCanvas(e.clientX, e.clientY);

      // Pointer tool - do nothing, let PanZoomContainer handle panning
      if (currentTool === 'pointer') {
        return;
      }

      // Continue erasing
      if (currentTool === 'eraser' && e.buttons === 1) {
        const strokes = getPageStrokes();
        const eraserRadius = strokeWidth * 3;
        
        const remainingStrokes = strokes.filter((stroke) => {
          return !stroke.points.some((p) => {
            const dist = Math.sqrt(
              Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2)
            );
            return dist < eraserRadius;
          });
        });

        pageAnnotations.set(pageNumber, remainingStrokes);
        redrawCanvas();
        return;
      }

      // Continue drawing
      if (isDrawing && (currentTool === 'pen' || currentTool === 'highlighter')) {
        setCurrentStroke((prev) => [...prev, point]);

        // Draw current stroke in real-time
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.strokeStyle = currentColor;
        ctx.lineWidth = currentTool === 'highlighter' ? strokeWidth * 3 : strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = currentTool === 'highlighter' ? 0.3 : 1.0;

        if (currentStroke.length > 0) {
          const lastPoint = currentStroke[currentStroke.length - 1];
          ctx.beginPath();
          ctx.moveTo(lastPoint.x, lastPoint.y);
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
        }

        ctx.globalAlpha = 1.0;
      }
    },
    [
      currentTool,
      screenToCanvas,
      isDrawing,
      currentStroke,
      currentColor,
      strokeWidth,
      getPageStrokes,
      pageNumber,
      redrawCanvas,
    ]
  );

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (isDrawing && currentStroke.length > 1) {
      // Save stroke to page annotations
      const stroke: Stroke = {
        points: currentStroke,
        color: currentColor,
        width: currentTool === 'highlighter' ? strokeWidth * 3 : strokeWidth,
        tool: currentTool as 'pen' | 'highlighter',
      };

      const strokes = getPageStrokes();
      strokes.push(stroke);
      pageAnnotations.set(pageNumber, strokes);
    }

    setIsDrawing(false);
    setCurrentStroke([]);
  }, [isDrawing, currentStroke, currentColor, strokeWidth, currentTool, getPageStrokes, pageNumber]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setShowLaserDot(false);
    if (isDrawing) {
      handleMouseUp();
    }
  }, [isDrawing, handleMouseUp]);

  // Track mouse globally for laser pointer when pointer tool is active
  useEffect(() => {
    if (currentTool !== 'pointer') {
      setShowLaserDot(false);
      return;
    }

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      
      // Check if mouse is within canvas bounds
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        // Calculate position in canvas coordinates (accounting for transform)
        const x = (e.clientX - rect.left - panOffset.x) / zoom;
        const y = (e.clientY - rect.top - panOffset.y) / zoom;
        
        setShowLaserDot(true);
        setLaserPosition({ x, y });
      } else {
        setShowLaserDot(false);
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [currentTool, zoom, panOffset]);

  // Get cursor style
  const getCursorStyle = () => {
    switch (currentTool) {
      case 'pointer':
        return 'none'; // Hide cursor for laser pointer
      case 'pen':
      case 'highlighter':
        return 'crosshair';
      case 'eraser':
        return 'grab';
      default:
        return 'default';
    }
  };

  return (
    <>
      {/* Annotation canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{
          cursor: getCursorStyle(),
          zIndex: 15,
          transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
          transformOrigin: 'top left',
          pointerEvents: currentTool === 'pen' || currentTool === 'highlighter' || currentTool === 'eraser' ? 'auto' : 'none',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />

      {/* Laser pointer tracking layer - transparent overlay for pointer tool */}
      {currentTool === 'pointer' && (
        <div
          className="absolute inset-0"
          style={{ 
            zIndex: 15,
            pointerEvents: 'none',
            background: 'transparent',
          }}
        />
      )}

      {/* Laser pointer dot */}
      {showLaserDot && currentTool === 'pointer' && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: laserPosition.x * zoom + panOffset.x,
            top: laserPosition.y * zoom + panOffset.y,
            zIndex: 31,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="relative">
            {/* Outer glow */}
            <div className="absolute w-8 h-8 bg-red-500 rounded-full opacity-30 blur-md animate-pulse" />
            {/* Inner dot */}
            <div className="absolute w-3 h-3 bg-red-600 rounded-full shadow-lg" style={{ left: '10px', top: '10px' }} />
          </div>
        </div>
      )}
    </>
  );
}

// Export function to clear all annotations
export function clearAllPDFAnnotations() {
  if (typeof window !== 'undefined' && (window as any).clearPDFAnnotations) {
    (window as any).clearPDFAnnotations();
  }
}
