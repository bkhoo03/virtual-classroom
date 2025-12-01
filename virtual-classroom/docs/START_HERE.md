# 🚀 Quick Start Guide

## Getting Started in 2 Minutes

### Step 1: Start the Backend Server

Open a terminal and run:

```bash
cd virtual-classroom/backend
npm install
npm run dev
```

You should see:
```
Virtual Classroom Backend Server
Environment: development
Port: 3001
```

**Keep this terminal open!** The backend must be running for login to work.

---

### Step 2: Start the Frontend

Open a **NEW terminal** (keep the backend running) and run:

```bash
cd virtual-classroom
npm run dev
```

Frontend will start on: `http://localhost:5173`

---

### Step 3: Login

Open your browser to `http://localhost:5173`

**Demo Credentials:**
- Email: `tutor@example.com`
- Password: `password`

---

## Troubleshooting

### ❌ "Cannot connect to server" Error

**Problem:** Backend server is not running

**Solution:**
1. Open a terminal
2. Navigate to backend: `cd virtual-classroom/backend`
3. Install dependencies: `npm install`
4. Start server: `npm run dev`
5. Keep terminal open
6. Refresh your browser

---

### ❌ "Login failed" Error

**Check:**
1. Backend is running (see terminal with "Port: 3001")
2. Using correct credentials:
   - Email: `tutor@example.com`
   - Password: `password`
3. No typos in email/password

---

### ❌ Port Already in Use

**Backend (Port 3001):**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3001 | xargs kill -9
```

**Frontend (Port 5173):**
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5173 | xargs kill -9
```

---

## Architecture

```
┌─────────────────────────────────────────┐
│  Frontend (React + Vite)                │
│  http://localhost:5173                  │
│                                         │
│  - Login Page                           │
│  - Classroom Interface                  │
│  - Video Calls (Agora)                  │
│  - AI Assistant                         │
└─────────────────┬───────────────────────┘
                  │
                  │ HTTP Requests
                  │
┌─────────────────▼───────────────────────┐
│  Backend (Express + TypeScript)         │
│  http://localhost:3001                  │
│                                         │
│  - Authentication (JWT)                 │
│  - Token Generation (Agora)             │
│  - Session Management                   │
└─────────────────────────────────────────┘
```

---

## What You Need

### Required
- ✅ Node.js 18+ installed
- ✅ npm or yarn
- ✅ Two terminal windows

### Optional (for full features)
- Agora App ID (for video calls)
- Agora App Certificate (for secure tokens)
- Doubao API Key (for AI assistant)

---

## Environment Setup

### Backend (.env)

Create `virtual-classroom/backend/.env`:

```env
# Required for authentication
JWT_SECRET=your-secret-key-here

# Optional - for video calls
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_certificate

# Optional - for AI assistant
DOUBAO_API_KEY=your_doubao_api_key
```

### Frontend (.env)

Create `virtual-classroom/.env`:

```env
VITE_BACKEND_URL=http://localhost:3001
VITE_ENV=development
```

---

## Testing the Setup

### 1. Check Backend Health

Open browser to: `http://localhost:3001/health`

Should see:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

### 2. Test Login API

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tutor@example.com","password":"password"}'
```

Should return user data and tokens.

### 3. Test Frontend

1. Navigate to `http://localhost:5173`
2. Should see beautiful login page with gradient background
3. Enter demo credentials
4. Should redirect to home page

---

## Common Issues

### Issue: "Module not found"
**Solution:** Run `npm install` in both frontend and backend directories

### Issue: "Port already in use"
**Solution:** Kill the process using that port (see Troubleshooting section)

### Issue: "Cannot find module 'tsx'"
**Solution:** 
```bash
cd backend
npm install
```

### Issue: White screen / blank page
**Solution:**
1. Check browser console for errors (F12)
2. Ensure backend is running
3. Clear browser cache
4. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

---

## Next Steps

Once logged in, you can:

1. ✅ **Create a Session** - Click "Create New Session"
2. ✅ **Join Classroom** - Enter session ID
3. ✅ **Test Video** - See tutor/tutee placeholders
4. ✅ **Try AI Assistant** - Send messages (if API key configured)
5. ✅ **Use Whiteboard** - Draw and annotate
6. ✅ **Collapse Panels** - Click chevron icons to minimize

---

## Development Tips

### Hot Reload
Both frontend and backend support hot reload:
- Frontend: Changes auto-refresh browser
- Backend: Changes auto-restart server (with tsx watch)

### View Logs
- **Frontend:** Browser DevTools Console (F12)
- **Backend:** Terminal where `npm run dev` is running

### Debug Mode
Add to browser console:
```javascript
localStorage.setItem('debug', 'true');
```

---

## Production Deployment

See `AUTHENTICATION.md` for production deployment checklist.

Key points:
- Use strong JWT secret
- Enable HTTPS
- Use real database
- Configure CORS properly
- Set up monitoring

---

## Getting Help

1. Check `QUICKSTART.md` for detailed setup
2. Check `AUTHENTICATION.md` for auth details
3. Check `UI_IMPROVEMENTS.md` for UI features
4. Check browser console for errors
5. Check backend terminal for errors

---

## Demo Accounts

**Tutor:**
- Email: `tutor@example.com`
- Password: `password`
- Role: Can create sessions, end sessions

**Student:**
- Email: `student@example.com`
- Password: `password`
- Role: Can join sessions

---

## Success Checklist

- [ ] Backend running on port 3001
- [ ] Frontend running on port 5173
- [ ] Can access login page
- [ ] Can login with demo credentials
- [ ] Can see home page with user profile
- [ ] Can create new session
- [ ] Can see classroom interface
- [ ] Video placeholders visible
- [ ] AI assistant panel visible
- [ ] Control toolbar at bottom

---

**Ready to start? Run these commands:**

```bash
# Terminal 1 - Backend
cd virtual-classroom/backend
npm install
npm run dev

# Terminal 2 - Frontend
cd virtual-classroom
npm run dev
```

Then open: `http://localhost:5173` 🎉
