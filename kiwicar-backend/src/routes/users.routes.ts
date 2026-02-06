import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';
import { updateProfileSchema } from '@/schemas/users.schema';
import { getMe, updateMe, uploadAvatar, deleteMe, getLookupQuota } from '@/controllers/users.controller';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
});

const router = Router();

router.get('/me', requireAuth, getMe);
router.put('/me', requireAuth, validate(updateProfileSchema), updateMe);
router.post('/me/avatar', requireAuth, upload.single('avatar'), uploadAvatar);
router.delete('/me', requireAuth, deleteMe);
router.get('/me/lookup-quota', requireAuth, getLookupQuota);

export default router;
