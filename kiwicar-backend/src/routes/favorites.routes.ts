import { Router } from 'express';
import { requireAuth } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';
import { addFavoriteSchema, updateAlertSchema } from '@/schemas/favorites.schema';
import { getFavorites, addFavorite, removeFavorite, updateAlert, getAlerts } from '@/controllers/favorites.controller';

const router = Router();

// Static routes before parameterized
router.get('/', requireAuth, getFavorites);
router.post('/', requireAuth, validate(addFavoriteSchema), addFavorite);
router.get('/alerts', requireAuth, getAlerts);
router.delete('/:listingId', requireAuth, removeFavorite);
router.put('/:listingId/alert', requireAuth, validate(updateAlertSchema), updateAlert);

export default router;
