import { useRef, useEffect, useState, useCallback, memo } from 'react';
import type { Point } from '../types';

interface AnnotationLayerProps {
  width: number;
  height: number;
  isEnabled?: boolean;
  currentTool?: 'pen' | 'highlighter' | 'eraser' | null;
  currentColor?: string;
  strokeWidth?: number;
  onAnnotationStart?: () => void;
  onAnnotationEnd?: (data: AnnotationData) => void;
  className?: string;
}

export interface AnnotationData {
  type: 'stroke';
  points: Point[];
  color: string;
  width: number;
  timestamp: number;
}

/**
 * AnnotationLayer component provides a transparent canvas overlay
 * for drawing annotations on top of PDF/screen share content
 */
function AnnotationLayer({
  width,
  height,
  isEnabled = true,
  currentTool = 'pen',
  currentColor = '#5C0099',
  strokeWidth = 2,
  onAnnotationStart,
  onAnnotationEnd,
  className = '',
}: AnnotationLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Configure context for smooth drawing
    context.lineCap = 'round';
    context.lineJoin = 'round';

    contextRef.current = context;
  }, [width, height]);

  // Update drawing style when tool/color/width changes
  useEffect(() => {
    const context = contextRef.current;
    if (!context) return;

    context.strokeStyle = currentColor;
    context.lineWidth = strokeWidth;

    // Highlighter effect: semi-transparent with lighter color
    if (currentTool === 'highlighter') {
      context.globalAlpha = 0.3;
      context.lineWidth = strokeWidth * 3; // Thicker for highlighter
    } else {
      context.globalAlpha = 1.0;
    }
  }, [currentTool, currentColor, strokeWidth]);

  // Get point coordinates relative to canvas
  const getPointFromEvent = useCallback(
    (e: MouseEvent | TouchEvent): Point | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      let clientX: number;
      let clientY: number;

      if (e instanceof MouseEvent) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else if (e instanceof TouchEvent && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        return null;
      }

      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    },
    []
  );

  // Start drawing
  const startDrawing = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isEnabled || !currentTool || currentTool === 'eraser') return;

      e.preventDefault();
      const point = getPointFromEvent(e);
      if (!point) return;

      setIsDrawing(true);
      setCurrentPoints([point]);
      onAnnotationStart?.();

      const context = contextRef.current;
      if (!context) return;

      context.beginPath();
      context.moveTo(point.x, point.y);
    },
    [isEnabled, currentTool, getPointFromEvent, onAnnotationStart]
  );

  // Continue drawing with debouncing for 60fps (16ms)
  const draw = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;

      e.preventDefault();
      const point = getPointFromEvent(e);
      if (!point) return;

      // Use requestAnimationFrame for smooth 60fps drawing
      requestAnimationFrame(() => {
        setCurrentPoints((prev) => [...prev, point]);

        const context = contextRef.current;
        if (!context) return;

        context.lineTo(point.x, point.y);
        context.stroke();
      });
    },
    [isDrawing, getPointFromEvent]
  );

  // Stop drawing
  const stopDrawing = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;

      e.preventDefault();
      setIsDrawing(false);

      const context = contextRef.current;
      if (!context) return;

      context.closePath();

      // Emit annotation data
      if (currentPoints.length > 0 && onAnnotationEnd) {
        const annotationData: AnnotationData = {
          type: 'stroke',
          points: currentPoints,
          color: currentColor,
          width: currentTool === 'highlighter' ? strokeWidth * 3 : strokeWidth,
          timestamp: Date.now(),
        };
        onAnnotationEnd(annotationData);
      }

      setCurrentPoints([]);
    },
    [isDrawing, currentPoints, currentColor, strokeWidth, currentTool, onAnnotationEnd]
  );

  // Handle eraser
  const handleEraser = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isEnabled || currentTool !== 'eraser') return;

      e.preventDefault();
      const point = getPointFromEvent(e);
      if (!point) return;

      const context = contextRef.current;
      if (!context) return;

      // Clear a circular area around the point
      const eraserSize = strokeWidth * 5;
      context.clearRect(
        point.x - eraserSize / 2,
        point.y - eraserSize / 2,
        eraserSize,
        eraserSize
      );
    },
    [isEnabled, currentTool, strokeWidth, getPointFromEvent]
  );

  // Set up event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Mouse events
    const handleMouseDown = (e: MouseEvent) => {
      if (currentTool === 'eraser') {
        handleEraser(e);
      } else {
        startDrawing(e);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (currentTool === 'eraser' && e.buttons === 1) {
        handleEraser(e);
      } else {
        draw(e);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      stopDrawing(e);
    };

    // Touch events
    const handleTouchStart = (e: TouchEvent) => {
      if (currentTool === 'eraser') {
        handleEraser(e);
      } else {
        startDrawing(e);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (currentTool === 'eraser') {
        handleEraser(e);
      } else {
        draw(e);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      stopDrawing(e);
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);

      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [startDrawing, draw, stopDrawing, handleEraser, currentTool]);

  // Clear canvas method (exposed via ref if needed)
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Expose clear method
  useEffect(() => {
    if (canvasRef.current) {
      (canvasRef.current as any).clearAnnotations = clearCanvas;
    }
  }, [clearCanvas]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 ${isEnabled ? 'cursor-crosshair' : 'pointer-events-none'} ${className}`}
      style={{
        touchAction: 'none',
        zIndex: 10,
        // Use CSS transform for GPU acceleration
        transform: 'translateZ(0)',
        willChange: 'transform',
      }}
    />
  );
}

export default memo(AnnotationLayer);
