import { Router } from 'express';
import usersRoutes from './users.routes';
import listingsRoutes from './listings.routes';
import vehiclesRoutes from './vehicles.routes';
import favoritesRoutes from './favorites.routes';
import messagesRoutes from './messages.routes';
import uploadsRoutes from './uploads.routes';
import aiRoutes from './ai.routes';
import filtersRoutes from './filters.routes';

const router = Router();

router.use('/users', usersRoutes);
router.use('/listings', listingsRoutes);
router.use('/vehicles', vehiclesRoutes);
router.use('/favorites', favoritesRoutes);
router.use('/messages', messagesRoutes);
router.use('/uploads', uploadsRoutes);
router.use('/ai', aiRoutes);
router.use('/filters', filtersRoutes);

export default router;
