import { z } from 'zod';

// UUID-like pattern (less strict than Zod 4's built-in uuid() which requires RFC 4122 compliance)
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const addFavoriteSchema = z.object({
  body: z.object({
    listingId: z.string().regex(uuidPattern, 'Invalid listing ID format'),
    priceAlert: z.boolean().optional(),
    targetPrice: z.number().positive().optional().nullable(),
  }),
});

export const updateAlertSchema = z.object({
  body: z.object({
    priceAlert: z.boolean(),
    targetPrice: z.number().positive().optional().nullable(),
  }),
});
