/**
 * SVG Annotation Layer Component
 * Handles all drawing interactions using SVG coordinates
 * Annotations are in document space and stick to the PDF regardless of zoom/scroll
 */

import React, { useRef, useCallback, useState, useEffect } from 'react';
import type { SVGStroke, Point, AnnotationLayerProps } from '../types/svg-annotations.types';

const SVGAnnotationLayer: React.FC<AnnotationLayerProps> = ({
  pageNumber,
  width,
  height,
  scale: _scale, // Not used - scaling handled by parent transform
  strokes,
  tool,
  color,
  strokeWidth,
  onStrokeComplete,
  onStrokeUpdate,
  onErase
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tempStroke, setTempStroke] = useState<SVGStroke | null>(null);
  const [laserPosition, setLaserPosition] = useState<Point | null>(null);

  // Get SVG coordinates from mouse/touch event
  // This converts screen coordinates to document coordinates
  const getSVGPoint = useCallback((clientX: number, clientY: number): Point | null => {
    if (!svgRef.current) return null;
    
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    
    // Transform screen coordinates to SVG coordinates
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    
    const svgP = pt.matrixTransform(ctm.inverse());
    return { x: svgP.x, y: svgP.y };
  }, []);

  // Start drawing
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (tool === 'none' || tool === 'laser') return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const point = getSVGPoint(e.clientX, e.clientY);
    if (!point) return;

    setIsDrawing(true);
    
    const newStroke: SVGStroke = {
      id: `${Date.now()}-${Math.random()}`,
      tool,
      points: [point],
      color,
      width: strokeWidth,
      timestamp: Date.now(),
      pageNumber
    };
    
    setTempStroke(newStroke);
  }, [tool, color, strokeWidth, pageNumber, getSVGPoint]);

  // Continue drawing
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const point = getSVGPoint(e.clientX, e.clientY);
    if (!point) return;

    // Update laser pointer position
    if (tool === 'laser') {
      setLaserPosition(point);
      
      // Create temporary stroke for laser
      const laserStroke: SVGStroke = {
        id: 'laser-temp',
        tool: 'laser',
        points: [point],
        color: '#ff0000',
        width: 3,
        timestamp: Date.now(),
        pageNumber
      };
      onStrokeUpdate(laserStroke);
      return;
    }

    // Continue drawing for pen/highlighter
    if (isDrawing && tempStroke && (tool === 'pen' || tool === 'highlighter')) {
      e.preventDefault();
      e.stopPropagation();
      
      const updatedStroke = {
        ...tempStroke,
        points: [...tempStroke.points, point]
      };
      
      setTempStroke(updatedStroke);
    }
  }, [isDrawing, tempStroke, tool, pageNumber, getSVGPoint, onStrokeUpdate]);

  // End drawing
  const handlePointerUp = useCallback(() => {
    if (!isDrawing || !tempStroke) return;
    
    setIsDrawing(false);
    
    // Save permanent stroke (not for laser)
    if (tool !== 'laser' && tempStroke.points.length > 1) {
      onStrokeComplete(tempStroke);
    }
    
    setTempStroke(null);
  }, [isDrawing, tempStroke, tool, onStrokeComplete]);

  // Handle eraser click
  const handleEraserClick = useCallback((e: React.MouseEvent, strokeId: string) => {
    if (tool === 'eraser') {
      e.preventDefault();
      e.stopPropagation();
      onErase(strokeId);
    }
  }, [tool, onErase]);

  // Clear laser position when tool changes
  useEffect(() => {
    if (tool !== 'laser') {
      setLaserPosition(null);
    }
  }, [tool]);

  // Convert points to SVG path with smoothing
  const pointsToPath = useCallback((points: Point[]): string => {
    if (points.length === 0) return '';
    if (points.length === 1) {
      // Single point - draw a small circle
      return `M ${points[0].x} ${points[0].y} L ${points[0].x + 0.1} ${points[0].y + 0.1}`;
    }
    
    // Start path
    let path = `M ${points[0].x} ${points[0].y}`;
    
    // Draw lines through all points
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    
    return path;
  }, []);

  // Get stroke style based on tool
  const getStrokeStyle = useCallback((stroke: SVGStroke) => {
    const baseStyle = {
      stroke: stroke.color,
      strokeWidth: stroke.width,
      fill: 'none',
      strokeLinecap: 'round' as const,
      strokeLinejoin: 'round' as const
    };

    switch (stroke.tool) {
      case 'highlighter':
        return {
          ...baseStyle,
          opacity: 0.3,
          strokeWidth: stroke.width * 3
        };
      case 'laser':
        return {
          ...baseStyle,
          stroke: '#ff0000',
          strokeWidth: 3,
          opacity: 0.8,
          filter: 'url(#glow)'
        };
      default:
        return baseStyle;
    }
  }, []);

  // Get cursor style
  const getCursor = () => {
    if (tool === 'none') return 'default';
    if (tool === 'laser') return 'none';
    if (tool === 'eraser') return 'crosshair';
    return 'crosshair';
  };

  return (
    <>
      <svg
        ref={svgRef}
        className="svg-annotation-layer"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: tool === 'none' ? 'none' : 'all',
          cursor: getCursor(),
          zIndex: 10
        }}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Glow filter for laser pointer */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Render saved strokes */}
        {strokes.map(stroke => (
          <path
            key={stroke.id}
            d={pointsToPath(stroke.points)}
            {...getStrokeStyle(stroke)}
            onClick={(e) => handleEraserClick(e, stroke.id)}
            style={{
              pointerEvents: tool === 'eraser' ? 'stroke' : 'none',
              cursor: tool === 'eraser' ? 'pointer' : 'default'
            }}
          />
        ))}

        {/* Render current stroke being drawn */}
        {tempStroke && (
          <path
            d={pointsToPath(tempStroke.points)}
            {...getStrokeStyle(tempStroke)}
            style={{ pointerEvents: 'none' }}
          />
        )}

        {/* Laser pointer dot */}
        {tool === 'laser' && laserPosition && (
          <g>
            {/* Outer glow */}
            <circle
              cx={laserPosition.x}
              cy={laserPosition.y}
              r="8"
              fill="#ff0000"
              opacity="0.3"
              filter="url(#glow)"
            />
            {/* Inner dot */}
            <circle
              cx={laserPosition.x}
              cy={laserPosition.y}
              r="3"
              fill="#ff0000"
              opacity="0.9"
            />
          </g>
        )}
      </svg>
    </>
  );
};

export default SVGAnnotationLayer;
