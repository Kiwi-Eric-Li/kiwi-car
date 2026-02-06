import { Router } from 'express';
import { requireAuth } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';
import {
  createListingSchema,
  updateListingSchema,
  listListingsSchema,
  updateStatusSchema,
  createDraftSchema,
} from '@/schemas/listings.schema';
import {
  listListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  updateStatus,
  getSimilarListings,
  getMyListings,
  createDraft,
  getMyDrafts,
  updateDraft,
} from '@/controllers/listings.controller';

const router = Router();

// Static routes must come before parameterized routes
router.get('/my', requireAuth, getMyListings);
router.get('/drafts', requireAuth, getMyDrafts);
router.post('/drafts', requireAuth, validate(createDraftSchema), createDraft);
router.put('/drafts/:id', requireAuth, validate(updateListingSchema), updateDraft);

// Parameterized routes
router.get('/', validate(listListingsSchema), listListings);
router.post('/', requireAuth, validate(createListingSchema), createListing);
router.get('/:id', getListingById);
router.put('/:id', requireAuth, validate(updateListingSchema), updateListing);
router.delete('/:id', requireAuth, deleteListing);
router.put('/:id/status', requireAuth, validate(updateStatusSchema), updateStatus);
router.get('/:id/similar', getSimilarListings);

export default router;
