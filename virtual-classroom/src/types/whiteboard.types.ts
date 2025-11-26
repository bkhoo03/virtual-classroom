// Whiteboard types for Agora Interactive Whiteboard integration

export type DrawingToolType = 'pencil' | 'rectangle' | 'circle' | 'line' | 'text' | 'eraser' | 'selector' | 'hand';

export type WhiteboardUserRole = 'admin' | 'writer' | 'reader';

export interface WhiteboardConfig {
  appId: string;
  roomId: string;
  roomToken: string;
  userId: string;
  userRole: WhiteboardUserRole;
}

export interface WhiteboardState {
  isConnected: boolean;
  currentTool: DrawingToolType;
  currentColor: string;
  strokeWidth: number;
  canUndo: boolean;
  canRedo: boolean;
}

export interface DrawingTool {
  type: DrawingToolType;
  config: ToolConfig;
}

export interface ToolConfig {
  color?: string;
  strokeWidth?: number;
  fontSize?: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface StrokeData {
  points: Point[];
  color: string;
  width: number;
}

export interface ShapeData {
  type: 'rectangle' | 'circle' | 'line';
  start: Point;
  end: Point;
  color: string;
  strokeWidth: number;
}

export interface TextData {
  content: string;
  position: Point;
  fontSize: number;
  color: string;
}

export interface Annotation {
  id: string;
  userId: string;
  type: 'stroke' | 'shape' | 'text';
  data: StrokeData | ShapeData | TextData;
  pageNumber: number;
  timestamp: Date;
}
