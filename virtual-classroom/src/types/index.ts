// Core types for the virtual classroom application

export type UserRole = 'tutor' | 'tutee';

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

export type ConnectionQuality = 'excellent' | 'good' | 'poor' | 'bad';

export type PresentationMode = 'pdf' | 'screenshare' | 'whiteboard' | 'ai-output';

export type SessionStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';

export interface ConnectionStatus {
  state: ConnectionState;
  quality: ConnectionQuality;
}

export interface Participant {
  userId: string;
  name: string;
  role: UserRole;
  joinedAt: Date;
  connectionStatus: 'online' | 'offline';
  agoraUid: number;
}

export interface SessionInfo {
  sessionId: string;
  userId: string;
  userRole: UserRole;
  participants: Participant[];
  startTime: Date;
  isActive: boolean;
}

export interface Session {
  id: string;
  tutorId: string;
  tuteeId: string;
  scheduledTime: Date;
  duration: number; // minutes
  status: SessionStatus;
  agoraChannelName: string;
  whiteboardRoomId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Presentation types
export interface PresentationContent {
  type: PresentationMode;
  data: PDFDocument | MediaStream | WhiteboardRoom | null;
  currentPage?: number;
  totalPages?: number;
}

export interface PDFDocument {
  url: string;
  numPages: number;
}

export interface WhiteboardRoom {
  roomId: string;
  roomToken: string;
}

export interface PresentationState {
  mode: PresentationMode;
  content: PresentationContent | null;
  currentPage: number;
  zoom: number;
}

// Re-export whiteboard types
export * from './whiteboard.types';

// Re-export AI types
export * from './ai.types';

// Re-export toast types
export * from './toast.types';
