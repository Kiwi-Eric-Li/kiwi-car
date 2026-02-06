import winston from 'winston';
import { env } from '@/config/env';

const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    env.NODE_ENV === 'development'
      ? winston.format.combine(winston.format.colorize(), winston.format.simple())
      : winston.format.json(),
  ),
  defaultMeta: { service: 'kiwicar-api' },
  transports: [
    new winston.transports.Console(),
  ],
});

export default logger;
