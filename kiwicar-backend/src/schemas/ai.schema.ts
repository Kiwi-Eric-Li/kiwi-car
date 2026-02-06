import { z } from 'zod';

export const generateDescriptionSchema = z.object({
  body: z.object({
    make: z.string().min(1),
    model: z.string().min(1),
    year: z.number().int(),
    mileage: z.number().int(),
    fuelType: z.string().min(1),
    transmission: z.string().min(1),
    color: z.string().min(1),
    bodyType: z.string().min(1),
    wofExpiry: z.string().optional(),
    regoExpiry: z.string().optional(),
  }),
});

export const priceEstimateSchema = z.object({
  query: z.object({
    make: z.string().min(1),
    model: z.string().min(1),
    year: z.coerce.number().int(),
    mileage: z.coerce.number().int(),
    region: z.string().optional(),
    fuelType: z.string().optional(),
    transmission: z.string().optional(),
  }),
});
