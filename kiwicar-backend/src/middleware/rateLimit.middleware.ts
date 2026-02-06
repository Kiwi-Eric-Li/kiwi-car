import rateLimit from 'express-rate-limit';
import { RATE_LIMITS } from '@/config/constants';

export const generalLimiter = rateLimit({
  windowMs: RATE_LIMITS.GENERAL.windowMs,
  max: RATE_LIMITS.GENERAL.max,
  message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Please try again later.' } },
  standardHeaders: true,
  legacyHeaders: false,
});

export const vehicleLookupGuestLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: RATE_LIMITS.VEHICLE_LOOKUP_GUEST.perDay,
  message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Daily lookup limit reached. Sign in for more lookups.' } },
  standardHeaders: true,
  legacyHeaders: false,
});

export const aiLimiter = rateLimit({
  windowMs: RATE_LIMITS.AI_GENERATION.windowMs,
  max: RATE_LIMITS.AI_GENERATION.max,
  keyGenerator: (req) => req.user?.id || req.ip || 'unknown',
  message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'AI generation limit reached for today.' } },
  standardHeaders: true,
  legacyHeaders: false,
});
