# Virtual Classroom Backend

Backend server for the Virtual Classroom application. Handles authentication, session management, and secure token generation for Agora services.

## Features

- **Authentication**: JWT-based authentication with access and refresh tokens
- **Session Management**: Create, validate, and manage classroom sessions
- **Token Generation**: Secure server-side generation of Agora RTC and Whiteboard tokens
- **API Key Security**: All API keys stored securely on the server, never exposed to frontend

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `JWT_SECRET`: Secret key for JWT token generation
- `AGORA_APP_ID`: Your Agora App ID
- `AGORA_APP_CERTIFICATE`: Your Agora App Certificate
- `AGORA_WHITEBOARD_APP_ID`: Your Agora Whiteboard App ID
- `AGORA_WHITEBOARD_APP_SECRET`: Your Agora Whiteboard App Secret

### 3. Run Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

### 4. Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication

#### POST /api/auth/login
Login with email and password.

**Request:**
```json
{
  "email": "tutor@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_1",
    "name": "John Tutor",
    "email": "tutor@example.com",
    "role": "tutor"
  },
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 86400
  }
}
```

#### POST /api/auth/logout
Logout (requires authentication).

#### GET /api/auth/validate
Validate current access token (requires authentication).

#### POST /api/auth/refresh
Refresh access token using refresh token.

### Token Generation

#### POST /api/tokens/agora
Generate Agora RTC token (requires authentication).

**Request:**
```json
{
  "sessionId": "session-123",
  "channelName": "channel_session-123",
  "role": "publisher"
}
```

#### POST /api/tokens/whiteboard
Generate Whiteboard token (requires authentication).

**Request:**
```json
{
  "sessionId": "session-123",
  "roomId": "room_session-123"
}
```

### Session Management

#### POST /api/sessions
Create a new session (requires authentication).

#### GET /api/sessions/:sessionId/validate
Validate session access (requires authentication).

#### POST /api/sessions/:sessionId/end
End a session (requires authentication, tutor only).

## Demo Credentials

For testing purposes, the following demo accounts are available:

**Tutor:**
- Email: `tutor@example.com`
- Password: `password`

**Student:**
- Email: `student@example.com`
- Password: `password`

## Security Notes

- All API keys are stored server-side and never exposed to the frontend
- JWT tokens are used for authentication
- Tokens have expiration times (24 hours for access tokens, 7 days for refresh tokens)
- CORS is configured to only allow requests from the frontend origin
- In production, use a real database instead of in-memory storage
- Use strong, unique JWT secrets in production
- Enable HTTPS in production

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Use a real database (PostgreSQL, MongoDB, etc.)
3. Enable HTTPS
4. Use strong, unique secrets for JWT
5. Configure proper CORS origins
6. Set up monitoring and logging
7. Implement rate limiting
8. Add request validation and sanitization
