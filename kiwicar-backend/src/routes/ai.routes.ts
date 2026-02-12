import { Router } from 'express';
import { requireAuth } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';
import { aiLimiter, priceEstimateLimiter } from '@/middleware/rateLimit.middleware';
import { generateDescriptionSchema, priceEstimateSchema } from '@/schemas/ai.schema';
import { generateDescriptionHandler, getPriceScoreHandler } from '@/controllers/ai.controller';

const router = Router();

router.post('/generate-description', requireAuth, aiLimiter, validate(generateDescriptionSchema), generateDescriptionHandler);
router.post('/price-estimate', requireAuth, priceEstimateLimiter, validate(priceEstimateSchema), getPriceScoreHandler);

export default router;
