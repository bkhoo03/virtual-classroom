# Authentication and Security Implementation

This document describes the authentication and security features implemented in the Virtual Classroom application.

## Overview

The application implements a comprehensive authentication and security system that includes:

1. **JWT-based Authentication**: Secure user authentication with access and refresh tokens
2. **Session Security**: Unique session identifiers and access validation
3. **Token-based Authorization**: Secure token generation for Agora RTC and Whiteboard services
4. **Session Cleanup**: Automatic cleanup of connections and data within 30 seconds

## Architecture

### Frontend Components

#### Authentication Context (`src/contexts/AuthContext.tsx`)
- Manages global authentication state
- Provides login, logout, and token validation functions
- Automatically checks authentication status on app load

#### Protected Routes (`src/components/ProtectedRoute.tsx`)
- Guards routes that require authentication
- Redirects unauthenticated users to login page
- Preserves intended destination for post-login redirect

#### Login Page (`src/pages/LoginPage.tsx`)
- User-friendly login interface
- Handles authentication errors
- Redirects to intended page after successful login

### Backend Services

#### Authentication Service (`backend/src/services/authService.ts`)
- Handles user authentication
- Generates and verifies JWT tokens
- Manages refresh token flow

#### Token Service (`backend/src/services/tokenService.ts`)
- Generates Agora RTC tokens for video calls
- Generates Whiteboard tokens
- Never exposes API keys to frontend

#### Session Security Service (`src/services/SessionSecurityService.ts`)
- Generates unique session identifiers
- Validates session access
- Manages session lifecycle

#### Session Cleanup Service (`src/services/SessionCleanupService.ts`)
- Handles cleanup of video, whiteboard, and storage
- Guarantees cleanup within 30 seconds
- Clears temporary data and tokens

## Authentication Flow

### 1. Login Process

```
User enters credentials
    ↓
Frontend sends to /api/auth/login
    ↓
Backend validates credentials
    ↓
Backend generates JWT tokens
    ↓
Frontend stores tokens in localStorage
    ↓
User redirected to home page
```

### 2. Protected Route Access

```
User navigates to protected route
    ↓
ProtectedRoute checks authentication
    ↓
If authenticated: Allow access
If not: Redirect to login with return URL
```

### 3. Token Refresh

```
Access token expires
    ↓
Frontend detects 403 error
    ↓
Frontend calls /api/auth/refresh with refresh token
    ↓
Backend validates refresh token
    ↓
Backend generates new access token
    ↓
Frontend retries original request
```

## Session Security

### Session Creation

1. User creates a new session from home page
2. Frontend generates unique session ID using `SessionSecurityService.generateSessionId()`
3. Backend creates session record with tutor/tutee associations
4. Session ID format: `session-{timestamp}-{random}`

### Session Validation

Before joining a classroom:
1. Frontend calls `SessionSecurityService.validateSessionAccess(sessionId)`
2. Backend checks if session exists and user has access
3. Backend verifies user is either tutor or tutee for that session
4. If valid, user can join; otherwise, access denied

### Token-Based Authorization

#### Agora RTC Token
```typescript
// Frontend requests token
const tokenData = await SessionSecurityService.getAgoraToken(
  sessionId,
  channelName,
  'publisher'
);

// Backend generates token using Agora SDK
// Token includes: appId, certificate, channel, uid, role, expiration
// Token is valid for 24 hours
```

#### Whiteboard Token
```typescript
// Frontend requests token
const tokenData = await SessionSecurityService.getWhiteboardToken(
  sessionId,
  roomId
);

// Backend generates token using Whiteboard API
// Token includes: roomId, userId, permissions, expiration
```

## Session Cleanup

### Automatic Cleanup

The `SessionCleanupService` ensures all resources are cleaned up when:
- User clicks "Leave Classroom"
- Browser tab is closed
- Page is refreshed
- Component unmounts

### Cleanup Process

1. **Video Call Cleanup** (parallel)
   - Stop local video track
   - Stop local audio track
   - Leave Agora channel
   - Remove event listeners

2. **Whiteboard Cleanup** (parallel)
   - Leave whiteboard room
   - Disconnect from whiteboard service

3. **Storage Cleanup** (parallel)
   - Clear session-specific data from sessionStorage
   - Remove cached tokens
   - Clear temporary media files

4. **Backend Cleanup** (parallel)
   - End session on backend
   - Update session status to 'completed'

### Cleanup Guarantee

- Maximum cleanup time: 30 seconds
- If cleanup exceeds timeout, force cleanup is triggered
- Cleanup is idempotent (safe to call multiple times)

## Security Best Practices

### API Key Management

✅ **DO:**
- Store all API keys in backend environment variables
- Generate tokens on backend only
- Use short-lived tokens (24 hours)
- Rotate secrets regularly

❌ **DON'T:**
- Never expose API keys in frontend code
- Never commit secrets to version control
- Never log sensitive information

### Token Security

✅ **DO:**
- Use HTTPS in production
- Store tokens in httpOnly cookies (production)
- Implement token refresh flow
- Set appropriate token expiration times

❌ **DON'T:**
- Don't store tokens in localStorage (use for demo only)
- Don't send tokens in URL parameters
- Don't use tokens after expiration

### Session Security

✅ **DO:**
- Validate session access before joining
- Check user permissions on backend
- Generate unique session identifiers
- Implement session timeout

❌ **DON'T:**
- Don't trust client-side session validation
- Don't allow unauthorized access
- Don't reuse session IDs

## Environment Variables

### Frontend (.env)
```bash
VITE_BACKEND_URL=http://localhost:3001
VITE_ENV=development
```

### Backend (.env)
```bash
# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Agora
AGORA_APP_ID=your_app_id
AGORA_APP_CERTIFICATE=your_certificate
AGORA_WHITEBOARD_APP_ID=your_whiteboard_app_id
AGORA_WHITEBOARD_APP_SECRET=your_whiteboard_secret

# CORS
CORS_ORIGIN=http://localhost:5173
```

## Demo Credentials

For testing purposes:

**Tutor Account:**
- Email: `tutor@example.com`
- Password: `password`

**Student Account:**
- Email: `student@example.com`
- Password: `password`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/logout` - Logout (requires auth)
- `GET /api/auth/validate` - Validate token (requires auth)
- `POST /api/auth/refresh` - Refresh access token

### Token Generation
- `POST /api/tokens/agora` - Generate Agora RTC token (requires auth)
- `POST /api/tokens/whiteboard` - Generate Whiteboard token (requires auth)

### Session Management
- `POST /api/sessions` - Create new session (requires auth)
- `GET /api/sessions/:id/validate` - Validate session access (requires auth)
- `POST /api/sessions/:id/end` - End session (requires auth)

## Testing

### Manual Testing

1. **Login Flow**
   ```bash
   # Start backend
   cd backend
   npm run dev
   
   # Start frontend
   cd ..
   npm run dev
   
   # Navigate to http://localhost:5173
   # Try logging in with demo credentials
   ```

2. **Session Creation**
   ```bash
   # After login, click "Create New Session"
   # Verify unique session ID is generated
   # Verify you can join the session
   ```

3. **Session Cleanup**
   ```bash
   # Join a session
   # Click "Leave Classroom"
   # Verify cleanup completes within 30 seconds
   # Check browser console for cleanup logs
   ```

### Security Testing

1. **Token Validation**
   - Try accessing protected routes without token
   - Try using expired token
   - Verify refresh token flow

2. **Session Access**
   - Try joining session without authentication
   - Try joining session you don't have access to
   - Verify proper error messages

## Production Deployment

### Checklist

- [ ] Use strong, unique JWT secret
- [ ] Enable HTTPS
- [ ] Use httpOnly cookies for tokens
- [ ] Implement rate limiting
- [ ] Set up database for session storage
- [ ] Configure proper CORS origins
- [ ] Enable request logging
- [ ] Set up monitoring and alerts
- [ ] Implement token rotation
- [ ] Add request validation
- [ ] Enable security headers
- [ ] Implement CSRF protection

### Recommended Security Headers

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## Troubleshooting

### Common Issues

**Issue: "Invalid or expired token"**
- Solution: Token may have expired. Try logging in again.

**Issue: "Session not found"**
- Solution: Session may have been deleted. Create a new session.

**Issue: "You do not have access to this session"**
- Solution: Verify you are the tutor or tutee for this session.

**Issue: Cleanup takes too long**
- Solution: Check network connection. Force cleanup will trigger after 30 seconds.

## Future Enhancements

- [ ] Implement OAuth2 authentication (Google, GitHub)
- [ ] Add two-factor authentication (2FA)
- [ ] Implement session recording with encryption
- [ ] Add audit logging for security events
- [ ] Implement IP-based rate limiting
- [ ] Add device fingerprinting
- [ ] Implement session hijacking detection
- [ ] Add end-to-end encryption for messages
