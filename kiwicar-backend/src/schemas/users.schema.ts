import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    nickname: z.string().min(1).max(50).optional(),
    region: z.string().min(1).optional(),
    showPhone: z.boolean().optional(),
    phone: z.string().optional(),
  }),
});
