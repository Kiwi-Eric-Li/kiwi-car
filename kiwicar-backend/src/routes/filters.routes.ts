import { Router } from 'express';
import { getFilterOptions } from '@/controllers/filters.controller';

const router = Router();

router.get('/options', getFilterOptions);

export default router;
