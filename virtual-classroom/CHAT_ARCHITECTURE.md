# Chat Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Browser)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Chat Component (Chat.tsx)                    │  │
│  │                                                            │  │
│  │  ┌──────────────┐         ┌──────────────┐              │  │
│  │  │  Peer Chat   │         │   AI Chat    │              │  │
│  │  │    Mode      │         │     Mode     │              │  │
│  │  └──────┬───────┘         └──────┬───────┘              │  │
│  │         │                        │                        │  │
│  │         ▼                        ▼                        │  │
│  │  ┌──────────────┐         ┌──────────────┐              │  │
│  │  │ ChatSync     │         │  AIService   │              │  │
│  │  │  Service     │         │              │              │  │
│  │  └──────┬───────┘         └──────┬───────┘              │  │
│  └─────────┼────────────────────────┼───────────────────────┘  │
│            │                        │                           │
│            │ Socket.IO              │ HTTPS                     │
│            │                        │                           │
└────────────┼────────────────────────┼───────────────────────────┘
             │                        │
             ▼                        ▼
┌────────────────────────────────────────────────────────────────┐
│                      Backend Server (Node.js)                   │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              Socket.IO Server (server.ts)                 │ │
│  │                                                            │ │
│  │  Chat Rooms:                                              │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │  chat:session-123                                    │ │ │
│  │  │  ├─ User A (socket-abc)                              │ │ │
│  │  │  ├─ User B (socket-def)                              │ │ │
│  │  │  └─ User C (socket-ghi)                              │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  Events:                                                  │ │
│  │  • join-chat-session                                      │ │
│  │  • send-chat-message  ──► Broadcast to room              │ │
│  │  • typing-indicator   ──► Broadcast to room              │ │
│  │  • leave-chat-session                                     │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              Express REST API                             │ │
│  │  /api/auth, /api/tokens, /api/sessions, etc.            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
                          ┌──────────────┐
                          │   OpenAI     │
                          │     API      │
                          └──────────────┘
```

## Message Flow Sequence

### Peer-to-Peer Chat Message

```
User A Browser                ChatSyncService           Backend Server              User B Browser
     │                              │                          │                          │
     │ 1. Type message              │                          │                          │
     ├─────────────────────────────►│                          │                          │
     │                              │                          │                          │
     │                              │ 2. emit('send-chat-     │                          │
     │                              │    message', {...})      │                          │
     │                              ├─────────────────────────►│                          │
     │                              │                          │                          │
     │                              │                          │ 3. Broadcast to room     │
     │                              │                          │    'chat:session-123'    │
     │                              │                          ├─────────────────────────►│
     │                              │                          │                          │
     │                              │                          │ 4. emit('chat-message')  │
     │                              │◄─────────────────────────┤                          │
     │                              │                          │                          │
     │ 5. Update UI                 │                          │                          │
     │◄─────────────────────────────┤                          │                          │
     │                              │                          │                          │
```

### Typing Indicator Flow

```
User A Browser                ChatSyncService           Backend Server              User B Browser
     │                              │                          │                          │
     │ 1. Start typing              │                          │                          │
     ├─────────────────────────────►│                          │                          │
     │                              │                          │                          │
     │                              │ 2. emit('typing-         │                          │
     │                              │    indicator', true)     │                          │
     │                              ├─────────────────────────►│                          │
     │                              │                          │                          │
     │                              │                          │ 3. Broadcast to others   │
     │                              │                          ├─────────────────────────►│
     │                              │                          │                          │
     │                              │                          │ 4. Show "User A typing"  │
     │                              │                          │                          ├──► UI
     │                              │                          │                          │
     │ 5. Stop typing (2s timeout)  │                          │                          │
     ├─────────────────────────────►│                          │                          │
     │                              │                          │                          │
     │                              │ 6. emit('typing-         │                          │
     │                              │    indicator', false)    │                          │
     │                              ├─────────────────────────►│                          │
     │                              │                          │                          │
     │                              │                          │ 7. Hide typing indicator │
     │                              │                          ├─────────────────────────►│
     │                              │                          │                          │
```

## Component Hierarchy

```
ClassroomPage
    │
    ├─ ClassroomLayout
    │   │
    │   ├─ VideoCallModule
    │   │
    │   ├─ PresentationPanel
    │   │
    │   ├─ AIOutputPanel
    │   │
    │   └─ Chat ◄─── Enhanced with Socket.IO
    │       │
    │       ├─ Message List
    │       │   ├─ User Messages (yellow)
    │       │   ├─ AI Messages (glass)
    │       │   └─ Peer Messages (glass)
    │       │
    │       ├─ Typing Indicator
    │       │
    │       └─ Input Area
    │           ├─ Text Input
    │           ├─ Send Button
    │           └─ "Ask AI" Toggle
    │
    └─ ControlToolbar
```

## Data Models

### ChatMessage (Socket.IO)
```typescript
{
  id: string;              // Unique message ID
  senderId: string;        // User ID of sender
  senderName: string;      // Display name
  content: string;         // Message text
  timestamp: Date;         // When sent
  sessionId: string;       // Which session/room
}
```

### AIMessage (UI Display)
```typescript
{
  id: string;              // Unique message ID
  role: 'user' | 'assistant';  // Message type
  content: string;         // Message text
  timestamp: Date;         // When sent
  media?: MediaContent[];  // Optional images/videos
}
```

## State Management

### Chat Component State
- `messages: AIMessage[]` - All messages (peer + AI)
- `inputMessage: string` - Current input text
- `isAIEnabled: boolean` - AI mode toggle
- `typingUsers: Map<userId, userName>` - Who's typing
- `isLoading: boolean` - AI response loading

### ChatSyncService State
- `socket: Socket` - Socket.IO connection
- `currentSessionId: string` - Active session
- `currentUserId: string` - Current user
- `messageCallbacks: Map` - Message subscribers
- `typingCallbacks: Map` - Typing subscribers

## Error Handling

### Connection Failures
```
ChatSyncService
    │
    ├─ Backend unavailable?
    │   └─► Log warning, continue (graceful degradation)
    │
    ├─ Connection lost?
    │   └─► Auto-reconnect (Socket.IO built-in)
    │
    └─ Message send fails?
        └─► Silent fail (message stays in local UI)
```

### Graceful Degradation
- If backend unavailable: Chat works locally, no sync
- If connection drops: Auto-reconnect, messages queued
- If reconnect fails: User can still use AI mode
- No errors shown to user unless critical

## Security Considerations

### Current Implementation
- ✅ CORS configured for allowed origins
- ✅ Session-based room isolation
- ✅ User ID validation required
- ⚠️ No message encryption (WebSocket)
- ⚠️ No message persistence
- ⚠️ No rate limiting

### Future Enhancements
- [ ] Add message encryption
- [ ] Implement rate limiting
- [ ] Add profanity filter
- [ ] Add message moderation
- [ ] Add user blocking
- [ ] Add message reporting
