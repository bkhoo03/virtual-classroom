# Quick Start Guide - Authentication & Security

This guide will help you quickly set up and test the authentication and security features.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## Setup (5 minutes)

### Step 1: Install Backend Dependencies

```bash
cd virtual-classroom/backend
npm install
```

### Step 2: Configure Backend Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env file (use any text editor)
# For quick testing, you can use the default values
# Just make sure to set a JWT_SECRET
```

Minimum required configuration:
```env
JWT_SECRET=your-secret-key-change-this-in-production
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_certificate
```

### Step 3: Start Backend Server

```bash
npm run dev
```

You should see:
```
Virtual Classroom Backend Server
Environment: development
Port: 3001
```

### Step 4: Start Frontend (New Terminal)

```bash
cd virtual-classroom
npm run dev
```

Frontend will start on `http://localhost:5173`

## Testing Authentication (2 minutes)

### 1. Access the Application

Open your browser and navigate to: `http://localhost:5173`

You'll be automatically redirected to the login page.

### 2. Login with Demo Credentials

**Tutor Account:**
- Email: `tutor@example.com`
- Password: `password`

**Student Account:**
- Email: `student@example.com`
- Password: `password`

### 3. Create a Session

After login, you'll see the home page with:
- Your user profile (name and role)
- Option to join existing session
- Button to create new session

Click **"Create New Session"** to generate a secure session ID.

### 4. Test Session Security

The application will:
1. Generate a unique session ID (format: `session-{timestamp}-{random}`)
2. Validate your access to the session
3. Request Agora tokens from the backend
4. Join the classroom

### 5. Test Session Cleanup

Click **"Leave Classroom"** and observe:
- Video connections are terminated
- Whiteboard is disconnected
- Session storage is cleared
- You're redirected to home page

Check the browser console to see cleanup logs.

## API Testing (Optional)

### Test Authentication Endpoint

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tutor@example.com",
    "password": "password"
  }'

# Response will include:
# - user object
# - accessToken
# - refreshToken
```

### Test Token Generation

```bash
# First, get an access token from login
# Then use it to generate Agora token

curl -X POST http://localhost:3001/api/tokens/agora \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "channelName": "test-channel",
    "role": "publisher"
  }'
```

### Test Session Validation

```bash
curl -X GET http://localhost:3001/api/sessions/SESSION_ID/validate \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Troubleshooting

### Backend won't start

**Error:** `Port 3001 is already in use`
- Solution: Change PORT in `.env` file or kill the process using port 3001

**Error:** `Missing environment variables`
- Solution: Make sure `.env` file exists and has required variables

### Frontend can't connect to backend

**Error:** `Network Error` or `Failed to fetch`
- Solution: Verify backend is running on port 3001
- Check VITE_BACKEND_URL in frontend `.env` file

### Login fails

**Error:** `Invalid credentials`
- Solution: Use exact demo credentials (case-sensitive)
- Email: `tutor@example.com`
- Password: `password`

### Session validation fails

**Error:** `Session not found`
- Solution: Create a new session from home page
- Make sure you're logged in

## What's Next?

Now that authentication is working, you can:

1. **Test Video Calls**: Join a session and test video/audio
2. **Test Whiteboard**: Try drawing on the whiteboard
3. **Test AI Assistant**: Send messages to the AI assistant
4. **Test Multi-User**: Login with different accounts in different browsers

## Security Notes

⚠️ **Important for Production:**

1. Change `JWT_SECRET` to a strong, random value
2. Use real Agora credentials (not demo values)
3. Enable HTTPS
4. Use a real database instead of in-memory storage
5. Implement rate limiting
6. Add request validation
7. Enable security headers

## Development Tips

### View Backend Logs

Backend logs all requests:
```
2024-01-15T10:30:00.000Z - POST /api/auth/login
2024-01-15T10:30:05.000Z - POST /api/tokens/agora
```

### View Frontend Logs

Open browser DevTools (F12) and check Console tab for:
- Authentication status
- Session validation
- Token generation
- Cleanup logs

### Test Cleanup Timeout

To test the 30-second cleanup guarantee:
1. Join a session
2. Open DevTools Console
3. Click "Leave Classroom"
4. Watch cleanup logs - should complete in < 30 seconds

## Demo Flow

Complete demo flow (5 minutes):

1. ✅ Open app → Redirected to login
2. ✅ Login with `tutor@example.com` / `password`
3. ✅ See home page with user profile
4. ✅ Click "Create New Session"
5. ✅ Session ID generated and validated
6. ✅ Join classroom (video, whiteboard, AI ready)
7. ✅ Click "Leave Classroom"
8. ✅ Cleanup completes, back to home
9. ✅ Click "Logout"
10. ✅ Redirected to login page

## Support

If you encounter issues:

1. Check browser console for errors
2. Check backend terminal for errors
3. Verify all environment variables are set
4. Ensure both frontend and backend are running
5. Try clearing browser cache and localStorage

## Resources

- Full documentation: `AUTHENTICATION.md`
- Implementation summary: `TASK_11_SUMMARY.md`
- Backend README: `backend/README.md`
- Requirements: `.kiro/specs/virtual-classroom-video/requirements.md`
- Design: `.kiro/specs/virtual-classroom-video/design.md`
