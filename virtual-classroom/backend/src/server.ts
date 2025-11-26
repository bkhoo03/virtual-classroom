import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import authRoutes from './routes/auth.js';
import tokenRoutes from './routes/tokens.js';
import sessionRoutes from './routes/sessions.js';

const app = express();

// Middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/sessions', sessionRoutes);

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

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   Virtual Classroom Backend Server                       ║
║                                                           ║
║   Environment: ${config.nodeEnv.padEnd(43)}║
║   Port: ${PORT.toString().padEnd(50)}║
║   CORS Origin: ${config.corsOrigin.padEnd(43)}║
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
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
