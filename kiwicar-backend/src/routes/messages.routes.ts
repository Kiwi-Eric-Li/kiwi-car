import { Router } from 'express';
import { requireAuth } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';
import { sendMessageSchema } from '@/schemas/messages.schema';
import { getConversations, getConversation, sendMessage, markAsRead, getUnreadCount } from '@/controllers/messages.controller';

const router = Router();

// Static routes before parameterized
router.get('/conversations', requireAuth, getConversations);
router.get('/unread-count', requireAuth, getUnreadCount);
router.get('/conversations/:id', requireAuth, getConversation);
router.post('/', requireAuth, validate(sendMessageSchema), sendMessage);
router.put('/conversations/:id/read', requireAuth, markAsRead);

export default router;
