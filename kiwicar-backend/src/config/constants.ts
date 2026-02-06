export const NZ_REGIONS = [
  'Auckland', 'Wellington', 'Canterbury', 'Waikato', 'Bay of Plenty',
  'Manawatu-Wanganui', 'Otago', "Hawke's Bay", 'Northland', 'Taranaki',
  'Southland', 'Nelson', 'Marlborough', 'Gisborne', 'West Coast', 'Tasman',
] as const;

export const FUEL_TYPES = ['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC', 'OTHER'] as const;

export const TRANSMISSIONS = ['AUTOMATIC', 'MANUAL'] as const;

export const BODY_TYPES = [
  'Sedan', 'SUV', 'Hatchback', 'Wagon', 'Ute', 'Van', 'Coupe', 'Convertible',
] as const;

export const LISTING_STATUSES = ['ACTIVE', 'SOLD', 'REMOVED', 'DRAFT'] as const;

export const RATE_LIMITS = {
  GENERAL: { windowMs: 60 * 1000, max: 100 },
  VEHICLE_LOOKUP_GUEST: { perDay: 3 },
  VEHICLE_LOOKUP_AUTH: { perDay: 10 },
  AI_GENERATION: { windowMs: 24 * 60 * 60 * 1000, max: 20 },
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILES: 10,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;
