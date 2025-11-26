import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import type { AnnotationStroke, Point } from '../types/annotation-storage.types';
import type { AnnotationTool } from './AnnotationToolbar';
import { useToast } from '../contexts/ToastContext';

interface AnnotationCanvasProps {
  width: number;
  height: number;
  tool: AnnotationTool;
  color: string;
  strokeWidth: number;
  zoom?: number;
  onStrokeComplete?: (stroke: AnnotationStroke) => void;
  storedStrokes?: AnnotationStroke[];
}

export interface AnnotationCanvasRef {
  clearCanvas: () => void;
  redrawStrokes: (strokes: AnnotationStroke[]) => void;
}

// Performance constants
const MAX_STROKES_PER_PAGE = 1000;
const POINT_BATCH_SIZE = 5; // Batch points during drawing for smoother performance
const POINT_SIMPLIFICATION_THRESHOLD = 100; // Simplify strokes with more than this many points
const MIN_POINT_DISTANCE = 2; // Minimum distance between points for simplification

/**
 * AnnotationCanvas Component
 * 
 * Dedicated canvas component for drawing annotations with proper tool handling.
 * Supports pen, highlighter, and eraser tools with proper rendering.
 * 
 * Features:
 * - Tool-specific drawing logic (pen, highlighter, eraser)
 * - Proper stroke rendering with line caps and opacity
 * - Drawing state management
 * - Canvas clearing and stroke redrawing via ref methods
 * 
 * @param width - Canvas width in pixels
 * @param height - Canvas height in pixels
 * @param tool - Currently selected annotation tool
 * @param color - Current drawing color
 * @param strokeWidth - Base stroke width
 * @param zoom - Current zoom level (default: 1)
 * @param onStrokeComplete - Callback when a stroke is completed
 * @param storedStrokes - Previously saved strokes to render
 */
const AnnotationCanvas = forwardRef<AnnotationCanvasRef, AnnotationCanvasProps>(
  ({ width, height, tool, color, strokeWidth, zoom: _zoom = 1, onStrokeComplete, storedStrokes = [] }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
    const [hasCanvasError, setHasCanvasError] = useState(false);
    const { showToast } = useToast();
    const pointBatchRef = useRef<Point[]>([]);
    const lastRedrawTimeRef = useRef<number>(0);
    const redrawRequestedRef = useRef<boolean>(false);
    
    // Note: zoom parameter (_zoom) is available for future scaling features
    // Currently not used but kept in interface for consistency with design

    /**
     * Simplify stroke points using Douglas-Peucker algorithm
     * Reduces point count for long strokes to improve performance
     */
    const simplifyPoints = (points: Point[], tolerance: number = MIN_POINT_DISTANCE): Point[] => {
      if (points.length <= 2) return points;

      // Douglas-Peucker algorithm
      const simplifyDouglasPeucker = (pts: Point[], epsilon: number): Point[] => {
        if (pts.length <= 2) return pts;

        // Find the point with maximum distance from line segment
        let maxDistance = 0;
        let maxIndex = 0;
        const start = pts[0];
        const end = pts[pts.length - 1];

        for (let i = 1; i < pts.length - 1; i++) {
          const distance = perpendicularDistance(pts[i], start, end);
          if (distance > maxDistance) {
            maxDistance = distance;
            maxIndex = i;
          }
        }

        // If max distance is greater than epsilon, recursively simplify
        if (maxDistance > epsilon) {
          const left = simplifyDouglasPeucker(pts.slice(0, maxIndex + 1), epsilon);
          const right = simplifyDouglasPeucker(pts.slice(maxIndex), epsilon);
          return [...left.slice(0, -1), ...right];
        } else {
          return [start, end];
        }
      };

      // Calculate perpendicular distance from point to line segment
      const perpendicularDistance = (point: Point, lineStart: Point, lineEnd: Point): number => {
        const dx = lineEnd.x - lineStart.x;
        const dy = lineEnd.y - lineStart.y;
        const norm = Math.sqrt(dx * dx + dy * dy);
        
        if (norm === 0) {
          return Math.sqrt(
            Math.pow(point.x - lineStart.x, 2) + Math.pow(point.y - lineStart.y, 2)
          );
        }

        return Math.abs(dy * point.x - dx * point.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x) / norm;
      };

      return simplifyDouglasPeucker(points, tolerance);
    };

    /**
     * Request a redraw with throttling to avoid excessive redraws
     */
    const requestRedraw = (ctx: CanvasRenderingContext2D, strokes: AnnotationStroke[]) => {
      const now = Date.now();
      const timeSinceLastRedraw = now - lastRedrawTimeRef.current;

      // Throttle redraws to max 60fps (16ms)
      if (timeSinceLastRedraw < 16 && redrawRequestedRef.current) {
        return;
      }

      redrawRequestedRef.current = true;
      requestAnimationFrame(() => {
        redrawAllStrokes(ctx, strokes);
        lastRedrawTimeRef.current = Date.now();
        redrawRequestedRef.current = false;
      });
    };

    // Initialize canvas context
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      try {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.error('Failed to get canvas 2D context');
          setHasCanvasError(true);
          showToast('Annotations unavailable. Viewing PDF only.', 'warning');
          return;
        }

        // Set canvas size
        canvas.width = width;
        canvas.height = height;

        // Reset error state if canvas initializes successfully
        setHasCanvasError(false);

        // Redraw stored strokes when canvas is resized (throttled)
        requestRedraw(ctx, storedStrokes);
      } catch (error) {
        console.error('Error initializing canvas:', error);
        setHasCanvasError(true);
        showToast('Annotations unavailable. Viewing PDF only.', 'warning');
      }
    }, [width, height]);

    // Redraw stored strokes when they change (throttled)
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      try {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        requestRedraw(ctx, storedStrokes);
      } catch (error) {
        console.error('Error redrawing strokes:', error);
      }
    }, [storedStrokes]);

    /**
     * Redraw all stored strokes on the canvas
     * Optimized to handle max strokes limit and batch rendering
     */
    const redrawAllStrokes = (ctx: CanvasRenderingContext2D, strokes: AnnotationStroke[]) => {
      try {
        // Clear canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Limit strokes to MAX_STROKES_PER_PAGE (keep most recent)
        const strokesToRender = strokes.length > MAX_STROKES_PER_PAGE
          ? strokes.slice(-MAX_STROKES_PER_PAGE)
          : strokes;

        // Warn if strokes were limited
        if (strokes.length > MAX_STROKES_PER_PAGE && strokes.length !== storedStrokes.length) {
          console.warn(`Stroke limit reached. Rendering ${MAX_STROKES_PER_PAGE} most recent strokes.`);
        }

        // Batch render strokes for better performance
        ctx.save();
        strokesToRender.forEach(stroke => {
          renderStroke(ctx, stroke);
        });
        ctx.restore();
      } catch (error) {
        console.error('Error redrawing all strokes:', error);
      }
    };

    /**
     * Render a single stroke on the canvas
     */
    const renderStroke = (ctx: CanvasRenderingContext2D, stroke: AnnotationStroke) => {
      try {
        if (stroke.points.length < 2) return;

        ctx.save();

        // Set stroke properties based on tool type
        if (stroke.tool === 'pen') {
          ctx.strokeStyle = stroke.color;
          ctx.lineWidth = stroke.strokeWidth;
          ctx.globalAlpha = 1.0;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
        } else if (stroke.tool === 'highlighter') {
          ctx.strokeStyle = stroke.color;
          ctx.lineWidth = stroke.strokeWidth * 3; // Highlighter is 3x wider
          ctx.globalAlpha = 0.3; // 30% opacity
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
        }

        // Draw the stroke
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }

        ctx.stroke();
        ctx.restore();
      } catch (error) {
        console.error('Error rendering stroke:', error);
      }
    };

    /**
     * Handle mouse down event - start drawing
     */
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
      // Only draw with pen, highlighter, or eraser (not hand or laser)
      if (tool !== 'pen' && tool !== 'highlighter' && tool !== 'eraser') {
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setIsDrawing(true);
      setCurrentStroke([{ x, y }]);

      // For eraser, start erasing immediately
      if (tool === 'eraser') {
        eraseAtPoint(x, y);
      }
    };

    /**
     * Handle mouse move event - continue drawing with point batching
     */
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      try {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (tool === 'eraser') {
          // Erase at current point
          eraseAtPoint(x, y);
          setCurrentStroke(prev => [...prev, { x, y }]);
        } else if (tool === 'pen' || tool === 'highlighter') {
          // Add point to batch
          pointBatchRef.current.push({ x, y });

          // Process batch when it reaches threshold
          if (pointBatchRef.current.length >= POINT_BATCH_SIZE) {
            const batchPoints = [...pointBatchRef.current];
            pointBatchRef.current = [];

            // Add batched points to current stroke
            setCurrentStroke(prev => {
              const newStroke = [...prev, ...batchPoints];
              
              // Draw all segments in the batch
              batchPoints.forEach((point, index) => {
                const prevPoint = index === 0 
                  ? (prev.length > 0 ? prev[prev.length - 1] : point)
                  : batchPoints[index - 1];
                drawCurrentSegment(ctx, prevPoint, point);
              });

              return newStroke;
            });
          } else {
            // Draw immediately for smooth feedback
            const lastPoint = currentStroke.length > 0 
              ? currentStroke[currentStroke.length - 1]
              : { x, y };
            drawCurrentSegment(ctx, lastPoint, { x, y });
          }
        }
      } catch (error) {
        console.error('Error during mouse move:', error);
      }
    };

    /**
     * Handle mouse up event - finish drawing
     */
    const handleMouseUp = () => {
      if (!isDrawing) return;

      setIsDrawing(false);

      // Flush any remaining batched points
      if (pointBatchRef.current.length > 0) {
        setCurrentStroke(prev => [...prev, ...pointBatchRef.current]);
        pointBatchRef.current = [];
      }

      // Only save strokes for pen and highlighter (not eraser)
      if ((tool === 'pen' || tool === 'highlighter') && currentStroke.length > 1) {
        // Simplify points if stroke is too long
        const finalPoints = currentStroke.length > POINT_SIMPLIFICATION_THRESHOLD
          ? simplifyPoints(currentStroke)
          : currentStroke;

        const stroke: AnnotationStroke = {
          id: `${Date.now()}_${Math.random()}`,
          tool: tool as 'pen' | 'highlighter',
          color,
          strokeWidth,
          points: finalPoints,
          timestamp: Date.now(),
        };

        onStrokeComplete?.(stroke);
      }

      setCurrentStroke([]);
    };

    /**
     * Draw a segment of the current stroke
     */
    const drawCurrentSegment = (ctx: CanvasRenderingContext2D, from: Point, to: Point) => {
      try {
        ctx.save();

        if (tool === 'pen') {
          ctx.strokeStyle = color;
          ctx.lineWidth = strokeWidth;
          ctx.globalAlpha = 1.0;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
        } else if (tool === 'highlighter') {
          ctx.strokeStyle = color;
          ctx.lineWidth = strokeWidth * 3;
          ctx.globalAlpha = 0.3;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
        }

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();

        ctx.restore();
      } catch (error) {
        console.error('Error drawing segment:', error);
      }
    };

    /**
     * Erase at a specific point with 20px radius
     */
    const eraseAtPoint = (x: number, y: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      try {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const eraseRadius = 20;

        // Clear a circular area
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, eraseRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } catch (error) {
        console.error('Error erasing at point:', error);
      }
    };

    /**
     * Clear the entire canvas
     */
    const clearCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      try {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } catch (error) {
        console.error('Error clearing canvas:', error);
      }
    };

    /**
     * Redraw strokes from external call
     */
    const redrawStrokes = (strokes: AnnotationStroke[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      try {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        redrawAllStrokes(ctx, strokes);
      } catch (error) {
        console.error('Error redrawing strokes:', error);
      }
    };

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      clearCanvas,
      redrawStrokes,
    }));

    // Determine cursor style based on tool
    const getCursorStyle = (): string => {
      switch (tool) {
        case 'pen':
          return 'crosshair';
        case 'highlighter':
          return 'crosshair';
        case 'eraser':
          return 'crosshair';
        case 'hand':
          return 'default'; // Hand cursor is handled by parent container
        case 'laser':
          return 'default'; // Laser cursor is handled by parent container
        default:
          return 'default';
      }
    };

    // If canvas has an error, render nothing (fallback to PDF-only view)
    if (hasCanvasError) {
      return null;
    }

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          cursor: getCursorStyle(),
          touchAction: 'none',
        }}
        aria-label="Annotation canvas"
      />
    );
  }
);

AnnotationCanvas.displayName = 'AnnotationCanvas';

export default AnnotationCanvas;
