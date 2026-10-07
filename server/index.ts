import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db/index.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import transformRoutes from './routes/transformRoutes.js';
import historyRoutes from './routes/historyRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// Security & Parsing Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow local development ports and same-origin
      if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:[0-9]+)?$/.test(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev/replit sandbox
      }
    },
    credentials: true,
  })
);

// Body parsers with generous limits for multimodal base64 images
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser());

// Basic security headers
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Simple in-memory rate limiting for API transformations & auth
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
function rateLimiter(limit: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (entry.count >= limit) {
      return res.status(429).json({
        error: 'Too many requests. Please slow down and try again shortly.',
      });
    }

    entry.count++;
    next();
  };
}

// Health Check Route (Section 12 requirement: GET /api/health -> { "status": "ok" })
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// API Routes
app.use('/api/auth', rateLimiter(60, 60000), authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/transform', rateLimiter(40, 60000), transformRoutes);
app.use('/api/history', historyRoutes);

// In production, serve the Vite frontend build
const clientDistPath = path.resolve(__dirname, '../dist/client');
app.use(express.static(clientDistPath));

app.get('*', (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      next();
    }
  });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  // Never expose sensitive internal details to the user
  res.status(err.status || 500).json({
    error: 'An unexpected internal error occurred. Please try again.',
  });
});

// Initialize database and start server
async function startServer() {
  try {
    await db.initialize();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`=======================================================`);
      console.log(`🚀 AI Accessibility Assistant Server running on port ${PORT}`);
      console.log(`🌐 Health endpoint: http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Fatal error starting server:', err);
    process.exit(1);
  }
}

startServer();
