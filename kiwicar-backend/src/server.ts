import { env } from '@/config/env';
import app from '@/app';
import logger from '@/utils/logger';
import { registerJobs } from '@/jobs';

const server = app.listen(env.PORT, () => {
  logger.info(`KiwiCar API server running on port ${env.PORT} [${env.NODE_ENV}]`);
  registerJobs();
});

// Graceful shutdown
function shutdown(signal: string) {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
