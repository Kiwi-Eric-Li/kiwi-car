import { Router, Request, Response, NextFunction } from 'express';
import { optionalAuth } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';
import { vehicleLookupGuestLimiter } from '@/middleware/rateLimit.middleware';
import { lookupVehicleSchema } from '@/schemas/vehicles.schema';
import { lookupVehicleHandler } from '@/controllers/vehicles.controller';

const router = Router();

// Apply guest rate limit only when user is NOT authenticated
function conditionalGuestRateLimit(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return vehicleLookupGuestLimiter(req, res, next);
  }
  next();
}

router.get(
  '/:plateNumber',
  optionalAuth,
  conditionalGuestRateLimit,
  validate(lookupVehicleSchema),
  lookupVehicleHandler,
);

export default router;
