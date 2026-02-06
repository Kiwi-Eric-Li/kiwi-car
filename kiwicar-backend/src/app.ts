import '@/types/express';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from '@/config/env';
import { supabaseAdmin } from '@/config/supabase';
import { generalLimiter } from '@/middleware/rateLimit.middleware';
import { errorHandler } from '@/middleware/error.middleware';
import logger from '@/utils/logger';
import routes from '@/routes';

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: [env.FRONTEND_URL, env.LANDING_URL],
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Global rate limiter
app.use(generalLimiter);

// Request logging
app.use((req, _res, next) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', async (_req, res) => {
  const { error } = await supabaseAdmin.from('profiles').select('id').limit(1);
  res.status(error ? 503 : 200).json({
    status: error ? 'unhealthy' : 'healthy',
    timestamp: new Date().toISOString(),
    database: error ? 'disconnected' : 'connected',
  });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: 'Endpoint not found' },
  });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
