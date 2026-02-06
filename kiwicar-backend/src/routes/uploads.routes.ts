import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '@/middleware/auth.middleware';
import { UPLOAD } from '@/config/constants';
import { uploadImages, deleteImage } from '@/controllers/uploads.controller';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: UPLOAD.MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if ((UPLOAD.ALLOWED_TYPES as readonly string[]).includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and WebP are allowed.'));
    }
  },
});

const router = Router();

router.post('/images', requireAuth, upload.array('images', UPLOAD.MAX_FILES), uploadImages);
router.delete('/images/:id', requireAuth, deleteImage);

export default router;
