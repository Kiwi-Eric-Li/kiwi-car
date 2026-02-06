import { z } from 'zod';

export const sendMessageSchema = z.object({
  body: z.object({
    receiverId: z.string().uuid(),
    listingId: z.string().uuid(),
    content: z.string().min(1).max(2000),
  }),
});
