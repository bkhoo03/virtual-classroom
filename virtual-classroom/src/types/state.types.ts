// Global state types for the virtual classroom application

import type { VideoStream, VideoCallConfig } from './video.types';
import type { WhiteboardState, Annotation } from './whiteboard.types';
import type { AIMessage, MediaContent } from './ai.types';
import type {
  ConnectionStatus,
  SessionInfo,
  PresentationMode,
  PresentationContent
} from './index';

// Video State
export interface VideoState {
  localStream: VideoStream | null;
  remoteStreams: Map<string, VideoStream>;
  connectionStatus: ConnectionStatus;
  isAudioMuted: boolean;
  isVideoOff: boolean;
  isReconnecting: boolean;
  reconnectAttempts: number;
  config: VideoCallConfig | null;
}

// Presentation State
export interface PresentationState {
  mode: PresentationMode;
  content: PresentationContent | null;
  currentPage: number;
  totalPages: number;
  zoom: number;
  annotations: Annotation[];
  activeTool: string | null;
}

// AI Assistant State
export interface AIState {
  messages: AIMessage[];
  isLoading: boolean;
  error: string | null;
  sharedMedia: MediaContent | null;
}

// UI State
export interface UIState {
  isSidebarOpen: boolean;
  activePanel: 'video' | 'presentation' | 'ai' | null;
  showToolbar: boolean;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  duration?: number;
}

// Global Classroom State
export interface ClassroomState {
  session: SessionInfo | null;
  video: VideoState;
  presentation: PresentationState;
  whiteboard: WhiteboardState;
  ai: AIState;
  ui: UIState;
}

// Action types for state updates
export type ClassroomAction =
  // Session actions
  | { type: 'SET_SESSION'; payload: SessionInfo }
  | { type: 'CLEAR_SESSION' }
  
  // Video actions
  | { type: 'SET_LOCAL_STREAM'; payload: VideoStream }
  | { type: 'ADD_REMOTE_STREAM'; payload: VideoStream }
  | { type: 'REMOVE_REMOTE_STREAM'; payload: string }
  | { type: 'UPDATE_CONNECTION_STATUS'; payload: ConnectionStatus }
  | { type: 'TOGGLE_AUDIO'; payload: boolean }
  | { type: 'TOGGLE_VIDEO'; payload: boolean }
  | { type: 'SET_RECONNECTING'; payload: { isReconnecting: boolean; attempts: number } }
  | { type: 'SET_VIDEO_CONFIG'; payload: VideoCallConfig }
  
  // Presentation actions
  | { type: 'SET_PRESENTATION_MODE'; payload: PresentationMode }
  | { type: 'SET_PRESENTATION_CONTENT'; payload: PresentationContent }
  | { type: 'SET_CURRENT_PAGE'; payload: number }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'ADD_ANNOTATION'; payload: Annotation }
  | { type: 'REMOVE_ANNOTATION'; payload: string }
  | { type: 'CLEAR_ANNOTATIONS' }
  | { type: 'SET_ACTIVE_TOOL'; payload: string | null }
  
  // Whiteboard actions
  | { type: 'SET_WHITEBOARD_CONNECTED'; payload: boolean }
  | { type: 'SET_WHITEBOARD_TOOL'; payload: string }
  | { type: 'SET_WHITEBOARD_COLOR'; payload: string }
  | { type: 'SET_WHITEBOARD_STROKE_WIDTH'; payload: number }
  | { type: 'SET_WHITEBOARD_UNDO_REDO'; payload: { canUndo: boolean; canRedo: boolean } }
  
  // AI actions
  | { type: 'ADD_AI_MESSAGE'; payload: AIMessage }
  | { type: 'SET_AI_LOADING'; payload: boolean }
  | { type: 'SET_AI_ERROR'; payload: string | null }
  | { type: 'SHARE_MEDIA_TO_PRESENTATION'; payload: MediaContent }
  | { type: 'CLEAR_SHARED_MEDIA' }
  | { type: 'CLEAR_AI_MESSAGES' }
  
  // UI actions
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_ACTIVE_PANEL'; payload: 'video' | 'presentation' | 'ai' | null }
  | { type: 'TOGGLE_TOOLBAR' }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string };
