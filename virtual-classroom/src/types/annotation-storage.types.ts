/**
 * Point interface for annotation coordinates
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * AnnotationStroke interface for storing drawing data
 */
export interface AnnotationStroke {
  id: string;
  tool: 'pen' | 'highlighter';
  color: string;
  strokeWidth: number;
  points: Point[];
  timestamp: number;
}
