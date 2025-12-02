import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { config } from './config/env.js';
import authRoutes from './routes/auth.js';
import tokenRoutes from './routes/tokens.js';
import sessionRoutes from './routes/sessions.js';
import whiteboardRoutes from './routes/whiteboard.js';
import uploadRoutes from './routes/upload.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Middleware
// CORS configuration with support for ngrok domains and Vercel
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      config.corsOrigin
    ];

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Check if origin matches ngrok patterns
    const ngrokPatterns = [
      /^https:\/\/[a-z0-9-]+\.ngrok-free\.app$/,
      /^https:\/\/[a-z0-9-]+\.ngrok\.io$/,
      /^https:\/\/[a-z0-9-]+\.ngrok\.app$/
    ];

    const isNgrokDomain = ngrokPatterns.some(pattern => pattern.test(origin));
    
    if (isNgrokDomain) {
      return callback(null, true);
    }

    // Check if origin matches Vercel deployment patterns
    const vercelPatterns = [
      /^https:\/\/virtual-classroom-[a-z0-9-]+\.vercel\.app$/,
      /^https:\/\/[a-z0-9-]+\.vercel\.app$/
    ];

    const isVercelDomain = vercelPatterns.some(pattern => pattern.test(origin));
    
    if (isVercelDomain) {
      return callback(null, true);
    }

    // Log rejected origin for debugging
    console.log(`CORS rejected origin: ${origin}`);
    
    // Return false instead of error to avoid 500 status
    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/whiteboard', whiteboardRoutes);
app.use('/api/upload', uploadRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: config.nodeEnv === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Initialize Socket.IO with CORS
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Same CORS logic as Express
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        config.corsOrigin
      ];
      
      if (allowedOrigins.includes(origin)) return callback(null, true);
      
      const ngrokPatterns = [
        /^https:\/\/[a-z0-9-]+\.ngrok-free\.app$/,
        /^https:\/\/[a-z0-9-]+\.ngrok\.io$/,
        /^https:\/\/[a-z0-9-]+\.ngrok\.app$/
      ];
      
      if (ngrokPatterns.some(pattern => pattern.test(origin))) return callback(null, true);
      
      const vercelPatterns = [
        /^https:\/\/virtual-classroom-[a-z0-9-]+\.vercel\.app$/,
        /^https:\/\/[a-z0-9-]+\.vercel\.app$/
      ];
      
      if (vercelPatterns.some(pattern => pattern.test(origin))) return callback(null, true);
      
      callback(null, false);
    },
    credentials: true
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  
  // Join a session room
  socket.on('join-session', (sessionId: string) => {
    socket.join(`session:${sessionId}`);
    console.log(`Socket ${socket.id} joined session: ${sessionId}`);
  });
  
  // PDF page change event
  socket.on('pdf-page-change', ({ sessionId, pdfUrl, page }: { sessionId: string; pdfUrl: string; page: number }) => {
    console.log(`PDF page change in session ${sessionId}: page ${page}`);
    // Broadcast to all other clients in the same session
    socket.to(`session:${sessionId}`).emit('pdf-page-changed', { pdfUrl, page });
  });
  
  // Leave session
  socket.on('leave-session', (sessionId: string) => {
    socket.leave(`session:${sessionId}`);
    console.log(`Socket ${socket.id} left session: ${sessionId}`);
  });
  
  // ===== CHAT EVENTS =====
  
  // Join a chat session
  socket.on('join-chat-session', ({ sessionId, userId, userName }: { sessionId: string; userId: string; userName: string }) => {
    socket.join(`chat:${sessionId}`);
    console.log(`💬 Socket ${socket.id} (${userName}) joined chat session: ${sessionId}`);
    
    // Notify others that user joined
    socket.to(`chat:${sessionId}`).emit('user-joined-chat', { userId, userName });
  });
  
  // Send chat message
  socket.on('send-chat-message', (message: any) => {
    console.log(`💬 Chat message in session ${message.sessionId} from ${message.senderName}: ${message.content}`);
    // Broadcast to all clients in the same session (including sender for confirmation)
    io.to(`chat:${message.sessionId}`).emit('chat-message', message);
  });
  
  // Typing indicator
  socket.on('typing-indicator', ({ sessionId, userId, userName, isTyping }: { sessionId: string; userId: string; userName: string; isTyping: boolean }) => {
    console.log(`💬 ${userName} is ${isTyping ? 'typing' : 'stopped typing'} in session ${sessionId}`);
    // Broadcast to all other clients in the same session
    socket.to(`chat:${sessionId}`).emit('user-typing', { userId, userName, isTyping });
  });
  
  // Leave chat session
  socket.on('leave-chat-session', ({ sessionId, userId }: { sessionId: string; userId: string }) => {
    socket.leave(`chat:${sessionId}`);
    console.log(`💬 Socket ${socket.id} left chat session: ${sessionId}`);
    
    // Notify others that user left
    socket.to(`chat:${sessionId}`).emit('user-left-chat', { userId });
  });
  
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = config.port;
httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   Virtual Classroom Backend Server                       ║
║                                                           ║
║   Environment: ${config.nodeEnv.padEnd(43)}║
║   Port: ${PORT.toString().padEnd(50)}║
║   CORS Origin: ${config.corsOrigin.padEnd(43)}║
║   WebSocket: Enabled (Socket.IO)                          ║
║                                                           ║
║   API Endpoints:                                          ║
║   - POST /api/auth/login                                  ║
║   - POST /api/auth/logout                                 ║
║   - GET  /api/auth/validate                               ║
║   - POST /api/auth/refresh                                ║
║   - POST /api/tokens/agora                                ║
║   - POST /api/tokens/whiteboard                           ║
║   - POST /api/sessions                                    ║
║   - GET  /api/sessions/:id/validate                       ║
║   - POST /api/sessions/:id/end                            ║
║   - POST /api/upload/document                             ║
║   - POST /api/whiteboard/convert                          ║
║   - GET  /api/whiteboard/convert/:taskUuid                ║
║                                                           ║
║   Socket.IO Events:                                       ║
║   - join-session / leave-session                          ║
║   - pdf-page-change                                       ║
║   - join-chat-session / leave-chat-session                ║
║   - send-chat-message                                     ║
║   - typing-indicator                                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
