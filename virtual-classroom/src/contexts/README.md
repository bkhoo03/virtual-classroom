# State Management System

This directory contains the global state management system for the virtual classroom application.

## Overview

The state management system is built using React Context and useReducer, providing a centralized store for all classroom-related state with automatic persistence.

## Architecture

### ClassroomContext

The main context that holds all application state:

- **Session State**: Current session information and participants
- **Video State**: Video call streams, connection status, and controls
- **Presentation State**: Current presentation mode, content, and annotations
- **Whiteboard State**: Whiteboard connection and drawing tools
- **AI State**: AI assistant messages and shared media
- **UI State**: Sidebar, panels, and notifications

### Custom Hooks

Each module has a dedicated hook that provides state and actions:

- `useVideo()` - Video call management
- `useWhiteboard()` - Whiteboard operations
- `usePresentation()` - Presentation controls
- `useAI()` - AI assistant interactions
- `useSessionPersistence()` - Session state persistence

## Usage

### 1. Wrap your app with ClassroomProvider

```tsx
import { ClassroomProvider } from './contexts';

function App() {
  return (
    <ClassroomProvider>
      <YourApp />
    </ClassroomProvider>
  );
}
```

### 2. Use hooks in your components

```tsx
import { useVideo, usePresentation, useAI } from './hooks';

function ClassroomPage() {
  const {
    localStream,
    remoteStreams,
    joinCall,
    toggleAudio,
    toggleVideo
  } = useVideo();

  const {
    currentPage,
    totalPages,
    nextPage,
    previousPage,
    loadPDF
  } = usePresentation();

  const {
    messages,
    sendMessage,
    isLoading
  } = useAI();

  // Use the state and actions...
}
```

### 3. Session Persistence

The `useSessionPersistence` hook automatically saves and restores critical state:

```tsx
import { useSessionPersistence } from './hooks';

function ClassroomPage() {
  const { endSession, hasPersistedSession } = useSessionPersistence();

  // Session state is automatically persisted
  // Call endSession() when leaving the classroom
}
```

## State Structure

```typescript
interface ClassroomState {
  session: SessionInfo | null;
  video: VideoState;
  presentation: PresentationState;
  whiteboard: WhiteboardState;
  ai: AIState;
  ui: UIState;
}
```

## Persistence

Critical state is automatically persisted to sessionStorage:

- Session information
- Video call configuration
- AI conversation messages
- Presentation state (mode, page, zoom)
- UI preferences

State is restored on page reload if the session is still valid (< 24 hours old).

## Best Practices

1. **Use hooks instead of context directly** - Hooks provide a cleaner API
2. **Don't store large objects in state** - Use refs for service instances
3. **Batch related updates** - Dispatch multiple actions when needed
4. **Clean up on unmount** - Use the cleanup functions provided by hooks
5. **Handle errors gracefully** - All hooks include error handling

## Example: Complete Classroom Setup

```tsx
import { useEffect } from 'react';
import { useVideo, useWhiteboard, usePresentation, useSessionPersistence } from './hooks';

function ClassroomPage() {
  const video = useVideo();
  const whiteboard = useWhiteboard();
  const presentation = usePresentation();
  const { endSession } = useSessionPersistence();

  useEffect(() => {
    // Initialize classroom
    const initClassroom = async () => {
      // Join video call
      await video.joinCall({
        appId: 'your-app-id',
        channel: 'classroom-123',
        token: 'your-token',
        uid: 12345,
        userId: 'user-123',
        userName: 'John Doe'
      });

      // Join whiteboard
      await whiteboard.joinRoom({
        appId: 'your-app-id',
        roomId: 'room-123',
        roomToken: 'your-token',
        userId: 'user-123',
        userRole: 'writer'
      });

      // Load presentation
      presentation.loadPDF('/path/to/document.pdf', 10);
    };

    initClassroom();

    // Cleanup on unmount
    return () => {
      video.leaveCall();
      whiteboard.leaveRoom();
      endSession();
    };
  }, []);

  return (
    <div>
      {/* Your classroom UI */}
    </div>
  );
}
```
