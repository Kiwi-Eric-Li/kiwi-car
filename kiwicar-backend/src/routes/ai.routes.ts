import { Router } from 'express';
import { requireAuth } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';
import { aiLimiter } from '@/middleware/rateLimit.middleware';
import { generateDescriptionSchema, priceEstimateSchema } from '@/schemas/ai.schema';
import { generateDescriptionHandler, getPriceEstimateHandler } from '@/controllers/ai.controller';

const router = Router();

router.post('/generate-description', requireAuth, aiLimiter, validate(generateDescriptionSchema), generateDescriptionHandler);
router.get('/price-estimate', requireAuth, validate(priceEstimateSchema), getPriceEstimateHandler);

export default router;
