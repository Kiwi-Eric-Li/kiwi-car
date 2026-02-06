import { z } from 'zod';

// UUID-like pattern (less strict than Zod 4's built-in uuid() which requires RFC 4122 compliance)
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const createListingSchema = z.object({
  body: z.object({
    plateNumber: z.string().min(1).max(10),
    make: z.string().min(1).max(50),
    model: z.string().min(1).max(50),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
    mileage: z.number().int().min(0).max(1000000),
    price: z.number().min(100).max(10000000),
    description: z.string().min(10).max(5000),
    region: z.string().min(1),
    fuelType: z.string().min(1),
    transmission: z.string().min(1),
    bodyType: z.string().min(1),
    color: z.string().min(1),
    vin: z.string().optional().nullable(),
    images: z.array(z.string().regex(uuidPattern)).optional(),
  }),
});

export const updateListingSchema = z.object({
  body: z.object({
    make: z.string().min(1).max(50).optional(),
    model: z.string().min(1).max(50).optional(),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
    mileage: z.number().int().min(0).max(1000000).optional(),
    price: z.number().min(100).max(10000000).optional(),
    description: z.string().min(10).max(5000).optional(),
    region: z.string().min(1).optional(),
    fuelType: z.string().min(1).optional(),
    transmission: z.string().min(1).optional(),
    bodyType: z.string().min(1).optional(),
    color: z.string().min(1).optional(),
    vin: z.string().optional().nullable(),
    images: z.array(z.string().regex(uuidPattern)).optional(),
  }),
});

export const listListingsSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    make: z.string().optional(),
    model: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    minYear: z.coerce.number().optional(),
    maxYear: z.coerce.number().optional(),
    minMileage: z.coerce.number().optional(),
    maxMileage: z.coerce.number().optional(),
    region: z.string().optional(),
    fuelType: z.string().optional(),
    transmission: z.string().optional(),
    bodyType: z.string().optional(),
    sort: z.enum(['newest', 'price_asc', 'price_desc', 'mileage_asc']).optional(),
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
  }),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ACTIVE', 'SOLD', 'REMOVED']),
  }),
});

export const createDraftSchema = z.object({
  body: z.object({
    plateNumber: z.string().optional(),
    make: z.string().optional(),
    model: z.string().optional(),
    year: z.number().int().optional(),
    mileage: z.number().int().optional(),
    price: z.number().optional(),
    description: z.string().optional(),
    region: z.string().optional(),
    fuelType: z.string().optional(),
    transmission: z.string().optional(),
    bodyType: z.string().optional(),
    color: z.string().optional(),
    vin: z.string().optional(),
    images: z.array(z.string().regex(uuidPattern)).optional(),
  }),
});
