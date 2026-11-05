import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import adminRoutes from './routes/adminRoutes.js';
import voterRoutes from './routes/voterRoutes.js';
import nomineeRoutes from './routes/nomineeRoutes.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { getSystemSettings } from './services/adminService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');

const app = express();

// Security middlewares
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin/proxied requests)
      if (!origin) return callback(null, true);
      if (
        origin === 'http://localhost:5173' ||
        origin.endsWith('.ngrok-free.dev') ||
        origin.endsWith('.ngrok.io') ||
        (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN.split(',').includes(origin))
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  })
);

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// General rate limiter on API
app.use('/api', generalLimiter);

// Health & public platform status check
app.get('/api/health', async (req, res) => {
  try {
    const settings = await getSystemSettings();
    res.json({
      status: 'ok',
      service: "r/FUT d'Or Ranked Voting Engine",
      version: '1.0.0',
      isVotingOpen: settings.isVotingOpen,
      resultsAnnounced: settings.resultsAnnounced
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Mount Routes
app.use('/api/admin', adminRoutes);
app.use('/api/voter', voterRoutes);
app.use('/api/nominees', nomineeRoutes);

// Serve static client assets if built in production
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  // SPA fallback for all non-API GET requests
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 404 handler for unmatched API routes
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: `API route not found: ${req.method} ${req.url}` });
});

// General 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.url}` });
});

// Global error handler
app.use(errorHandler);

export default app;
