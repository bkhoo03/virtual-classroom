# Real-Time Chat Setup

## Overview
The virtual classroom now supports real-time peer-to-peer chat using Socket.IO. Messages are synchronized across all participants in the same session.

## Features
- ✅ Real-time message synchronization
- ✅ Typing indicators
- ✅ AI chat mode (existing functionality)
- ✅ Peer-to-peer chat mode
- ✅ Graceful degradation (works locally if backend unavailable)
- ✅ Auto-scroll and unread message indicators

## Architecture

### Frontend
- **ChatSyncService** (`src/services/ChatSyncService.ts`): Manages Socket.IO connection and chat events
- **Chat Component** (`src/components/Chat.tsx`): UI component with dual mode (peer chat + AI chat)

### Backend
- **Socket.IO Events** (in `backend/src/server.ts`):
  - `join-chat-session`: User joins a chat room
  - `send-chat-message`: Send message to all users in session
  - `typing-indicator`: Broadcast typing status
  - `leave-chat-session`: User leaves chat room

## Testing Instructions

### Prerequisites
1. Backend server running with Socket.IO enabled
2. `VITE_BACKEND_URL` environment variable configured in frontend

### Local Testing
1. Start the backend server:
   ```bash
   cd virtual-classroom/backend
   npm run dev
   ```

2. Start the frontend (in separate terminal):
   ```bash
   cd virtual-classroom
   npm run dev
   ```

3. Open two browser windows/tabs
4. Join the same session in both windows
5. Type messages in one window - they should appear in the other

### Testing Checklist
- [ ] Messages appear in real-time across multiple clients
- [ ] Typing indicators show when peer is typing
- [ ] Messages persist in chat history
- [ ] AI mode still works independently
- [ ] Chat works locally when backend is unavailable (no errors)
- [ ] Unread message indicators work correctly
- [ ] Auto-scroll behavior is correct

## Configuration

### Environment Variables
```bash
# Frontend (.env)
VITE_BACKEND_URL=http://localhost:3001  # or your ngrok URL

# Backend (.env)
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

### Socket.IO Connection
The chat service automatically:
- Connects to backend URL from `VITE_BACKEND_URL`
- Handles reconnection on disconnect
- Gracefully degrades if backend unavailable
- Logs connection status to console

## Debugging

### Check Socket.IO Connection
Open browser console and look for:
```
💬 [ChatSync] Connected to WebSocket server
💬 [ChatSync] Joined chat session: {sessionId}
```

### Check Message Flow
Messages are logged with emoji prefixes:
- `💬 [ChatSync] Sent message:` - Outgoing messages
- `💬 [ChatSync] Received message:` - Incoming messages
- `💬 {userName} is typing` - Typing indicators

### Common Issues

**Messages not syncing:**
- Check backend is running
- Verify `VITE_BACKEND_URL` is correct
- Check browser console for connection errors
- Verify both users are in same session

**Typing indicators not working:**
- Check Socket.IO connection is established
- Verify users have unique `userId` values
- Check console for typing events

**Backend connection fails:**
- Verify CORS settings in backend
- Check firewall/network settings
- Try using ngrok for remote testing

## Future Enhancements
- [ ] Message persistence (database storage)
- [ ] Message history on join
- [ ] Read receipts
- [ ] File/image sharing in chat
- [ ] Message reactions
- [ ] User presence indicators
- [ ] Message search
- [ ] Chat notifications

## Notes
- Chat messages are currently ephemeral (not persisted to database)
- Each session has its own isolated chat room
- AI mode and peer chat mode are mutually exclusive
- Socket.IO automatically handles reconnection
