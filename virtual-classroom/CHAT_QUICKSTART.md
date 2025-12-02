# Chat Quick Start Guide

## ✅ What's Done

The real-time chat feature is **fully implemented** and ready to test once your AWS backend is set up.

### Files Created/Modified
1. ✅ `src/services/ChatSyncService.ts` - Socket.IO chat service
2. ✅ `src/components/Chat.tsx` - Enhanced with peer-to-peer chat
3. ✅ `backend/src/server.ts` - Added chat Socket.IO events
4. ✅ `src/pages/ClassroomPage.tsx` - Passes required props to Chat

### Dependencies
- ✅ `socket.io-client` already installed (from PDF sync)
- ✅ `socket.io` already installed in backend

## 🚀 How to Test (When Backend is Ready)

### Step 1: Start Backend
```bash
cd virtual-classroom/backend
npm run dev
```

You should see:
```
╔═══════════════════════════════════════════════════════════╗
║   Socket.IO Events:                                       ║
║   - join-session / leave-session                          ║
║   - pdf-page-change                                       ║
║   - join-chat-session / leave-chat-session                ║
║   - send-chat-message                                     ║
║   - typing-indicator                                      ║
╚═══════════════════════════════════════════════════════════╝
```

### Step 2: Start Frontend
```bash
cd virtual-classroom
npm run dev
```

### Step 3: Test Chat
1. Open browser window #1: `http://localhost:5173`
2. Join a session (e.g., `session-test-123`)
3. Open browser window #2: `http://localhost:5173`
4. Join the **same** session
5. Type a message in window #1
6. ✨ Message should appear in window #2 instantly!

### Step 4: Test Typing Indicators
1. Start typing in window #1 (don't send)
2. Window #2 should show "User is typing..."
3. Stop typing for 2 seconds
4. Typing indicator should disappear

### Step 5: Test AI Mode
1. Click "Ask AI" button in chat
2. Type a question
3. AI should respond (existing functionality)
4. Click "Exit" to return to peer chat mode

## 🔍 Debugging

### Check Console Logs
Open browser DevTools console and look for:

**Connection Success:**
```
💬 [ChatSync] Connected to WebSocket server
💬 [ChatSync] Joined chat session: session-test-123
```

**Message Sent:**
```
💬 [ChatSync] Sent message: { content: "Hello!", ... }
```

**Message Received:**
```
💬 [ChatSync] Received message: { content: "Hello!", ... }
```

### Check Backend Logs
Backend terminal should show:
```
💬 Socket abc123 (John) joined chat session: session-test-123
💬 Chat message in session session-test-123 from John: Hello!
💬 John is typing in session session-test-123
```

### Common Issues

**"WebSocket disabled" message:**
- Check `VITE_BACKEND_URL` is set in `.env`
- Verify backend is running
- Chat will still work locally, just won't sync

**Messages not syncing:**
- Verify both users are in the **same session ID**
- Check browser console for connection errors
- Verify backend CORS settings allow your origin

**Typing indicators not showing:**
- This is normal - you don't see your own typing indicator
- Check the other browser window

## 📝 Environment Variables

### Frontend `.env`
```bash
VITE_BACKEND_URL=http://localhost:3001
# or for ngrok:
# VITE_BACKEND_URL=https://your-ngrok-url.ngrok-free.app
```

### Backend `.env`
```bash
PORT=3001
CORS_ORIGIN=http://localhost:5173
# or for production:
# CORS_ORIGIN=https://your-vercel-app.vercel.app
```

## 🎯 What to Expect

### Peer Chat Mode (Default)
- Messages sync in real-time across all users in session
- Typing indicators show when others are typing
- Messages appear with glass morphism design
- Your messages appear in yellow on the right

### AI Chat Mode
- Click "Ask AI" to enable
- Messages go to OpenAI API (not to peers)
- AI responses appear with purple sparkle icon
- Click "Exit" to return to peer chat

## 📊 Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend connects to backend (check console)
- [ ] Messages sync between two browser windows
- [ ] Typing indicators work
- [ ] AI mode still works independently
- [ ] Can switch between peer and AI mode
- [ ] Unread message badge appears when scrolled up
- [ ] Auto-scroll works correctly
- [ ] Chat works when backend is stopped (graceful degradation)

## 🎨 UI Features

### Message Display
- **Your messages**: Yellow gradient, right-aligned
- **Peer messages**: Glass morphism, left-aligned
- **AI messages**: Glass with purple header, left-aligned
- **Timestamps**: Below each message
- **Date separators**: "Today", "Yesterday", or date

### Typing Indicator
- Shows "{Name} is typing..." with animated dots
- Auto-hides after 2 seconds of no typing
- Multiple users: "John, Jane are typing..."

### Unread Messages
- Badge shows count when scrolled up
- "Scroll to bottom" button with count
- Auto-clears when scrolled to bottom

## 🔮 Future Enhancements

When you're ready to add more features:
- Message persistence (save to database)
- Message history on join
- File/image sharing
- Message reactions (👍, ❤️, etc.)
- Read receipts
- User presence (online/offline)
- Message search
- Push notifications

## 📚 Documentation

For more details, see:
- `CHAT_SETUP.md` - Full setup guide
- `CHAT_ARCHITECTURE.md` - System architecture diagrams
- `CHAT_IMPLEMENTATION_SUMMARY.md` - What was implemented

## 🆘 Need Help?

If something doesn't work:
1. Check browser console for errors
2. Check backend terminal for errors
3. Verify environment variables are set
4. Try restarting both frontend and backend
5. Check CORS settings if using ngrok/Vercel

---

**Status**: ✅ Implementation complete, ready for testing after AWS setup
