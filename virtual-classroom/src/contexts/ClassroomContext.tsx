import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type {
  ClassroomState,
  ClassroomAction,
  VideoState,
  PresentationState,
  AIState,
  UIState
} from '../types/state.types';
import type { WhiteboardState } from '../types/whiteboard.types';

// Initial states
const initialVideoState: VideoState = {
  localStream: null,
  remoteStreams: new Map(),
  connectionStatus: {
    state: 'disconnected',
    quality: 'good'
  },
  isAudioMuted: false,
  isVideoOff: false,
  isReconnecting: false,
  reconnectAttempts: 0,
  config: null
};

const initialPresentationState: PresentationState = {
  mode: 'pdf',
  content: null,
  currentPage: 1,
  totalPages: 0,
  zoom: 1,
  annotations: [],
  activeTool: null
};

const initialWhiteboardState: WhiteboardState = {
  isConnected: false,
  currentTool: 'pencil',
  currentColor: '#5C0099',
  strokeWidth: 2,
  canUndo: false,
  canRedo: false
};

const initialAIState: AIState = {
  messages: [],
  isLoading: false,
  error: null,
  sharedMedia: null
};

const initialUIState: UIState = {
  isSidebarOpen: true,
  activePanel: null,
  showToolbar: true,
  notifications: []
};

const initialState: ClassroomState = {
  session: null,
  video: initialVideoState,
  presentation: initialPresentationState,
  whiteboard: initialWhiteboardState,
  ai: initialAIState,
  ui: initialUIState
};

// Reducer function
function classroomReducer(state: ClassroomState, action: ClassroomAction): ClassroomState {
  switch (action.type) {
    // Session actions
    case 'SET_SESSION':
      return { ...state, session: action.payload };
    case 'CLEAR_SESSION':
      return { ...state, session: null };

    // Video actions
    case 'SET_LOCAL_STREAM':
      return {
        ...state,
        video: { ...state.video, localStream: action.payload }
      };
    case 'ADD_REMOTE_STREAM': {
      const newRemoteStreams = new Map(state.video.remoteStreams);
      newRemoteStreams.set(action.payload.userId, action.payload);
      return {
        ...state,
        video: { ...state.video, remoteStreams: newRemoteStreams }
      };
    }
    case 'REMOVE_REMOTE_STREAM': {
      const newRemoteStreams = new Map(state.video.remoteStreams);
      newRemoteStreams.delete(action.payload);
      return {
        ...state,
        video: { ...state.video, remoteStreams: newRemoteStreams }
      };
    }
    case 'UPDATE_CONNECTION_STATUS':
      return {
        ...state,
        video: { ...state.video, connectionStatus: action.payload }
      };
    case 'TOGGLE_AUDIO':
      return {
        ...state,
        video: { ...state.video, isAudioMuted: action.payload }
      };
    case 'TOGGLE_VIDEO':
      return {
        ...state,
        video: { ...state.video, isVideoOff: action.payload }
      };
    case 'SET_RECONNECTING':
      return {
        ...state,
        video: {
          ...state.video,
          isReconnecting: action.payload.isReconnecting,
          reconnectAttempts: action.payload.attempts
        }
      };
    case 'SET_VIDEO_CONFIG':
      return {
        ...state,
        video: { ...state.video, config: action.payload }
      };

    // Presentation actions
    case 'SET_PRESENTATION_MODE':
      return {
        ...state,
        presentation: { ...state.presentation, mode: action.payload }
      };
    case 'SET_PRESENTATION_CONTENT':
      return {
        ...state,
        presentation: {
          ...state.presentation,
          content: action.payload,
          totalPages: action.payload.totalPages || 0
        }
      };
    case 'SET_CURRENT_PAGE':
      return {
        ...state,
        presentation: { ...state.presentation, currentPage: action.payload }
      };
    case 'SET_ZOOM':
      return {
        ...state,
        presentation: { ...state.presentation, zoom: action.payload }
      };
    case 'ADD_ANNOTATION':
      return {
        ...state,
        presentation: {
          ...state.presentation,
          annotations: [...state.presentation.annotations, action.payload]
        }
      };
    case 'REMOVE_ANNOTATION':
      return {
        ...state,
        presentation: {
          ...state.presentation,
          annotations: state.presentation.annotations.filter(a => a.id !== action.payload)
        }
      };
    case 'CLEAR_ANNOTATIONS':
      return {
        ...state,
        presentation: { ...state.presentation, annotations: [] }
      };
    case 'SET_ACTIVE_TOOL':
      return {
        ...state,
        presentation: { ...state.presentation, activeTool: action.payload }
      };

    // Whiteboard actions
    case 'SET_WHITEBOARD_CONNECTED':
      return {
        ...state,
        whiteboard: { ...state.whiteboard, isConnected: action.payload }
      };
    case 'SET_WHITEBOARD_TOOL':
      return {
        ...state,
        whiteboard: { ...state.whiteboard, currentTool: action.payload as any }
      };
    case 'SET_WHITEBOARD_COLOR':
      return {
        ...state,
        whiteboard: { ...state.whiteboard, currentColor: action.payload }
      };
    case 'SET_WHITEBOARD_STROKE_WIDTH':
      return {
        ...state,
        whiteboard: { ...state.whiteboard, strokeWidth: action.payload }
      };
    case 'SET_WHITEBOARD_UNDO_REDO':
      return {
        ...state,
        whiteboard: {
          ...state.whiteboard,
          canUndo: action.payload.canUndo,
          canRedo: action.payload.canRedo
        }
      };

    // AI actions
    case 'ADD_AI_MESSAGE':
      return {
        ...state,
        ai: {
          ...state.ai,
          messages: [...state.ai.messages, action.payload]
        }
      };
    case 'SET_AI_LOADING':
      return {
        ...state,
        ai: { ...state.ai, isLoading: action.payload }
      };
    case 'SET_AI_ERROR':
      return {
        ...state,
        ai: { ...state.ai, error: action.payload }
      };
    case 'SHARE_MEDIA_TO_PRESENTATION':
      return {
        ...state,
        ai: { ...state.ai, sharedMedia: action.payload }
      };
    case 'CLEAR_SHARED_MEDIA':
      return {
        ...state,
        ai: { ...state.ai, sharedMedia: null }
      };
    case 'CLEAR_AI_MESSAGES':
      return {
        ...state,
        ai: { ...state.ai, messages: [] }
      };

    // UI actions
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        ui: { ...state.ui, isSidebarOpen: !state.ui.isSidebarOpen }
      };
    case 'SET_ACTIVE_PANEL':
      return {
        ...state,
        ui: { ...state.ui, activePanel: action.payload }
      };
    case 'TOGGLE_TOOLBAR':
      return {
        ...state,
        ui: { ...state.ui, showToolbar: !state.ui.showToolbar }
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: [...state.ui.notifications, action.payload]
        }
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.filter(n => n.id !== action.payload)
        }
      };

    default:
      return state;
  }
}

// Context type
interface ClassroomContextType {
  state: ClassroomState;
  dispatch: React.Dispatch<ClassroomAction>;
}

// Create context
const ClassroomContext = createContext<ClassroomContextType | undefined>(undefined);

// Provider props
interface ClassroomProviderProps {
  children: ReactNode;
  initialState?: Partial<ClassroomState>;
}

// Provider component
export function ClassroomProvider({ children, initialState: customInitialState }: ClassroomProviderProps) {
  const [state, dispatch] = useReducer(
    classroomReducer,
    customInitialState ? { ...initialState, ...customInitialState } : initialState
  );

  return (
    <ClassroomContext.Provider value={{ state, dispatch }}>
      {children}
    </ClassroomContext.Provider>
  );
}

// Custom hook to use the classroom context
export function useClassroomContext() {
  const context = useContext(ClassroomContext);
  if (context === undefined) {
    throw new Error('useClassroomContext must be used within a ClassroomProvider');
  }
  return context;
}

export default ClassroomContext;
