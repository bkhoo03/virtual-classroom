/**
 * SVG-based Annotation Types
 * Type definitions for the new SVG annotation system
 */

export type AnnotationTool = 'pen' | 'highlighter' | 'eraser' | 'laser' | 'none';

export interface Point {
  x: number;
  y: number;
}

export interface SVGStroke {
  id: string;
  tool: AnnotationTool;
  points: Point[];
  color: string;
  width: number;
  timestamp: number;
  pageNumber: number;
  userId?: string;
}

export interface SVGAnnotationState {
  strokes: SVGStroke[];
  currentStroke: SVGStroke | null;
  tool: AnnotationTool;
  color: string;
  width: number;
  isDrawing: boolean;
}

export interface AnnotationLayerProps {
  pageNumber: number;
  width: number;
  height: number;
  scale: number;
  strokes: SVGStroke[];
  tool: AnnotationTool;
  color: string;
  strokeWidth: number;
  onStrokeComplete: (stroke: SVGStroke) => void;
  onStrokeUpdate: (stroke: SVGStroke) => void;
  onErase: (strokeId: string) => void;
}
