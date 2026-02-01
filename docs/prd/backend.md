# KiwiCar Backend PRD

**Document Version:** 2.0
**Created:** January 2026
**Updated:** February 2026
**Status:** Draft
**Application Type:** Node.js REST API Server

---

## 1. Overview

### 1.1 Purpose

This document defines the requirements for building the KiwiCar backend API server - a Node.js/Express application with TypeScript that powers the KiwiCar platform's core functionality including listings management, vehicle data, AI features, and messaging. Authentication and data storage are handled by Supabase.

### 1.2 Scope

The backend server handles:
- Car listing CRUD operations
- Vehicle information lookup (NZTA integration)
- AI-powered features (description generation, pricing)
- Favorites and price alert management
- Messaging between buyers and sellers
- Image upload via Supabase Storage
- Rate limiting and security

**Authentication** is handled entirely by Supabase Auth on the client side. The backend verifies Supabase JWTs on protected routes but does not implement its own auth flows.

### 1.3 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20 LTS | Runtime environment |
| Express.js | 4.x | Web framework |
| TypeScript | 5.0+ | Type safety |
| Supabase JS | 2.x | Database client, auth verification, storage |
| Zod | 3+ | Request validation |
| Winston | - | Logging |
| node-cron | - | Scheduled tasks |

**Supabase provides:**
- PostgreSQL database (data storage)
- Auth (registration, login, password reset, email verification, OAuth)
- Storage (image uploads with CDN)
- Row Level Security (RLS) as an additional safety net

### 1.4 Project Structure

```
kiwicar-backend/
├── src/
│   ├── config/
│   │   ├── supabase.ts
│   │   ├── env.ts
│   │   └── constants.ts
│   ├── controllers/
│   │   ├── listings.controller.ts
│   │   ├── vehicles.controller.ts
│   │   ├── users.controller.ts
│   │   ├── favorites.controller.ts
│   │   ├── messages.controller.ts
│   │   ├── uploads.controller.ts
│   │   └── ai.controller.ts
│   ├── services/
│   │   ├── listings.service.ts
│   │   ├── nzta.service.ts
│   │   ├── ai.service.ts
│   │   └── storage.service.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── validate.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   └── error.middleware.ts
│   ├── routes/
│   │   ├── index.ts
│   │   ├── listings.routes.ts
│   │   ├── vehicles.routes.ts
│   │   ├── users.routes.ts
│   │   ├── favorites.routes.ts
│   │   ├── messages.routes.ts
│   │   ├── uploads.routes.ts
│   │   └── ai.routes.ts
│   ├── schemas/
│   │   ├── listings.schema.ts
│   │   └── ...
│   ├── types/
│   │   ├── express.d.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── errors.ts
│   │   └── pagination.ts
│   ├── app.ts
│   └── server.ts
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 2. Database Schema

### 2.1 Supabase Tables

Authentication is managed by Supabase Auth (`auth.users`). Application tables reference `auth.users.id` as foreign keys. All tables live in the `public` schema.

```sql
-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone TEXT UNIQUE,
  nickname TEXT,
  avatar_url TEXT,
  region TEXT,
  show_phone BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on signup via Supabase trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Listings
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  plate_number TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  mileage INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  description TEXT NOT NULL,
  ai_description TEXT,
  ai_price_min NUMERIC(10,2),
  ai_price_max NUMERIC(10,2),
  ai_price_recommended NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','SOLD','REMOVED','DRAFT')),
  region TEXT NOT NULL,
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('PETROL','DIESEL','HYBRID','ELECTRIC','OTHER')),
  transmission TEXT NOT NULL CHECK (transmission IN ('AUTOMATIC','MANUAL')),
  body_type TEXT NOT NULL,
  color TEXT NOT NULL,
  vin TEXT,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_listings_status_created ON listings(status, created_at);
CREATE INDEX idx_listings_make_model ON listings(make, model);
CREATE INDEX idx_listings_region ON listings(region);
CREATE INDEX idx_listings_price ON listings(price);

-- Listing images
CREATE TABLE listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_listing_images_listing ON listing_images(listing_id);

-- Favorites
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  price_alert BOOLEAN DEFAULT false,
  target_price NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- Price history
CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  price NUMERIC(10,2) NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_price_history_listing ON price_history(listing_id);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id),
  receiver_id UUID NOT NULL REFERENCES profiles(id),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_messages_participants ON messages(sender_id, receiver_id, listing_id);
CREATE INDEX idx_messages_unread ON messages(receiver_id, is_read);

-- Vehicle info cache (from NZTA lookups)
CREATE TABLE vehicle_info (
  plate_number TEXT PRIMARY KEY,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  body_style TEXT,
  color TEXT,
  engine_cc INTEGER,
  fuel_type TEXT,
  wof_expiry DATE,
  wof_status TEXT,
  rego_expiry DATE,
  rego_status TEXT,
  first_registered DATE,
  odometer_readings JSONB,
  fetched_at TIMESTAMPTZ DEFAULT now()
);

-- Lookup quotas
CREATE TABLE lookup_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  count INTEGER DEFAULT 0,
  reset_at TIMESTAMPTZ NOT NULL
);
```

---

## 3. API Endpoints

### 3.1 Users (`/api/users`)

Authentication (register, login, password reset, OAuth) is handled entirely by Supabase Auth on the frontend. The backend only manages user profile data.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/me` | Get current user profile | Yes |
| PUT | `/me` | Update profile | Yes |
| DELETE | `/me` | Delete account | Yes |
| GET | `/me/lookup-quota` | Get remaining lookups | Yes |

**GET /me**

Response (200):
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "phone": "+64211234567",
  "nickname": "John",
  "avatarUrl": "https://...",
  "region": "Auckland",
  "showPhone": false,
  "createdAt": "2026-01-01T00:00:00Z"
}
```

**PUT /me**

Request:
```json
{
  "nickname": "Johnny",
  "region": "Wellington",
  "showPhone": true
}
```

---

### 3.2 Listings (`/api/listings`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List all listings (with filters) | No |
| GET | `/:id` | Get listing details | No |
| POST | `/` | Create new listing | Yes |
| PUT | `/:id` | Update listing | Yes (owner) |
| DELETE | `/:id` | Delete listing | Yes (owner) |
| PUT | `/:id/status` | Update listing status | Yes (owner) |
| GET | `/:id/similar` | Get similar listings | No |
| GET | `/my` | Get user's listings | Yes |
| POST | `/drafts` | Save draft | Yes |
| GET | `/drafts` | Get user's drafts | Yes |

**GET /** (List Listings)

Query Parameters:
| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Search keyword |
| `make` | string | Filter by make (comma-separated) |
| `model` | string | Filter by model (comma-separated) |
| `minPrice` | number | Minimum price |
| `maxPrice` | number | Maximum price |
| `minYear` | number | Minimum year |
| `maxYear` | number | Maximum year |
| `minMileage` | number | Minimum mileage |
| `maxMileage` | number | Maximum mileage |
| `region` | string | Filter by region (comma-separated) |
| `fuelType` | string | Filter by fuel type |
| `transmission` | string | Filter by transmission |
| `bodyType` | string | Filter by body type |
| `sort` | string | Sort: `newest`, `price_asc`, `price_desc`, `mileage_asc` |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20, max: 100) |

Response (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "2020 Toyota Corolla",
      "price": 25000,
      "year": 2020,
      "mileage": 45000,
      "region": "Auckland",
      "fuelType": "PETROL",
      "transmission": "AUTOMATIC",
      "coverImage": "https://...",
      "createdAt": "2026-01-15T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**GET /:id** (Listing Detail)

Response (200):
```json
{
  "id": "uuid",
  "plateNumber": "ABC123",
  "make": "Toyota",
  "model": "Corolla",
  "year": 2020,
  "mileage": 45000,
  "price": 25000,
  "description": "Well maintained...",
  "aiDescription": "This 2020 Toyota Corolla...",
  "aiPriceMin": 22000,
  "aiPriceMax": 28000,
  "aiPriceRecommended": 25500,
  "status": "ACTIVE",
  "region": "Auckland",
  "fuelType": "PETROL",
  "transmission": "AUTOMATIC",
  "bodyType": "Sedan",
  "color": "Silver",
  "views": 234,
  "createdAt": "2026-01-15T00:00:00Z",
  "images": [
    { "id": "uuid", "url": "https://...", "order": 0 }
  ],
  "seller": {
    "id": "uuid",
    "nickname": "John",
    "avatarUrl": "https://...",
    "memberSince": "2025-06-01T00:00:00Z",
    "listingsCount": 3
  }
}
```

**POST /** (Create Listing)

Request:
```json
{
  "plateNumber": "ABC123",
  "make": "Toyota",
  "model": "Corolla",
  "year": 2020,
  "mileage": 45000,
  "price": 25000,
  "description": "Well maintained family car...",
  "region": "Auckland",
  "fuelType": "PETROL",
  "transmission": "AUTOMATIC",
  "bodyType": "Sedan",
  "color": "Silver",
  "vin": "JTDKN3DU5A0123456",
  "images": ["image-uuid-1", "image-uuid-2", "image-uuid-3"]
}
```

Response (201):
```json
{
  "id": "uuid",
  "message": "Listing created successfully"
}
```

---

### 3.3 Vehicles (`/api/vehicles`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/:plateNumber` | Get vehicle info from NZTA | Optional |

**GET /:plateNumber**

Response (200):
```json
{
  "plateNumber": "ABC123",
  "make": "Toyota",
  "model": "Corolla",
  "year": 2020,
  "bodyStyle": "Sedan",
  "color": "Silver",
  "engineCc": 1800,
  "fuelType": "Petrol",
  "wofStatus": "Current",
  "wofExpiry": "2026-06-15",
  "regoStatus": "Current",
  "regoExpiry": "2026-08-20",
  "firstRegistered": "2020-03-10",
  "odometerReadings": [
    { "date": "2026-01-10", "reading": 45000 },
    { "date": "2025-01-12", "reading": 32000 },
    { "date": "2024-01-15", "reading": 18000 }
  ],
  "cached": false,
  "fetchedAt": "2026-01-20T10:30:00Z"
}
```

Rate Limits:
- Guest: 3 lookups per day (by IP)
- Authenticated: 10 lookups per day (by user)

---

### 3.4 Favorites (`/api/favorites`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get user's favorites | Yes |
| POST | `/` | Add to favorites | Yes |
| DELETE | `/:listingId` | Remove from favorites | Yes |
| PUT | `/:listingId/alert` | Update price alert | Yes |
| GET | `/alerts` | Get all price alerts | Yes |

**POST /** (Add Favorite)

Request:
```json
{
  "listingId": "uuid",
  "priceAlert": true,
  "targetPrice": 22000
}
```

**GET /**

Response (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "listingId": "uuid",
      "listing": {
        "id": "uuid",
        "title": "2020 Toyota Corolla",
        "price": 25000,
        "previousPrice": 27000,
        "coverImage": "https://...",
        "status": "ACTIVE"
      },
      "priceAlert": true,
      "targetPrice": 22000,
      "createdAt": "2026-01-15T00:00:00Z"
    }
  ]
}
```

---

### 3.5 Messages (`/api/messages`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/conversations` | List conversations | Yes |
| GET | `/conversations/:id` | Get conversation messages | Yes |
| POST | `/` | Send message | Yes |
| PUT | `/conversations/:id/read` | Mark as read | Yes |
| GET | `/unread-count` | Get unread count | Yes |

**GET /conversations**

Response (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "otherUser": {
        "id": "uuid",
        "nickname": "Seller123",
        "avatarUrl": "https://..."
      },
      "listing": {
        "id": "uuid",
        "title": "2020 Toyota Corolla",
        "coverImage": "https://..."
      },
      "lastMessage": {
        "content": "Is this still available?",
        "createdAt": "2026-01-20T14:30:00Z",
        "isFromMe": true
      },
      "unreadCount": 2
    }
  ]
}
```

**POST /** (Send Message)

Request:
```json
{
  "receiverId": "uuid",
  "listingId": "uuid",
  "content": "Hi, is this car still available?"
}
```

---

### 3.6 AI (`/api/ai`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/generate-description` | Generate listing description | Yes |
| GET | `/price-estimate` | Get AI price estimate | Yes |

**POST /generate-description**

Request:
```json
{
  "make": "Toyota",
  "model": "Corolla",
  "year": 2020,
  "mileage": 45000,
  "fuelType": "Petrol",
  "transmission": "Automatic",
  "color": "Silver",
  "bodyType": "Sedan",
  "wofExpiry": "2026-06-15",
  "regoExpiry": "2026-08-20"
}
```

Response (200):
```json
{
  "description": "This well-maintained 2020 Toyota Corolla is a fantastic choice for anyone seeking a reliable, fuel-efficient sedan. With just 45,000 km on the clock, this silver beauty features an automatic transmission and runs on petrol. Current WOF until June 2026 and registration until August 2026 give you peace of mind. Perfect for commuting or family use, the Corolla's reputation for reliability makes this an excellent value proposition."
}
```

**GET /price-estimate**

Query Parameters:
- `make`, `model`, `year`, `mileage`, `region`, `fuelType`, `transmission`

Response (200):
```json
{
  "priceMin": 22000,
  "priceMax": 28000,
  "priceRecommended": 25500,
  "confidence": 0.85,
  "factors": [
    { "factor": "Low mileage for year", "impact": "+$1,500" },
    { "factor": "Popular model", "impact": "+$800" },
    { "factor": "Auckland location", "impact": "+$500" }
  ],
  "marketComparison": {
    "similarListings": 24,
    "averagePrice": 25200,
    "medianPrice": 25000
  }
}
```

---

### 3.7 Uploads (`/api/uploads`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/images` | Upload image(s) | Yes |
| DELETE | `/images/:id` | Delete image | Yes |

**POST /images**

Request: `multipart/form-data` with `images` field (up to 10 files)

Response (200):
```json
{
  "images": [
    {
      "id": "uuid",
      "url": "https://<project>.supabase.co/storage/v1/object/public/listings/abc123.webp",
      "thumbnailUrl": "https://<project>.supabase.co/storage/v1/object/public/listings/abc123_thumb.webp"
    }
  ]
}
```

---

### 3.8 Filter Options (`/api/filters`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/options` | Get available filter options | No |

**GET /options**

Response (200):
```json
{
  "makes": [
    { "value": "toyota", "label": "Toyota", "count": 523 },
    { "value": "honda", "label": "Honda", "count": 312 }
  ],
  "regions": [
    { "value": "auckland", "label": "Auckland", "count": 1200 },
    { "value": "wellington", "label": "Wellington", "count": 450 }
  ],
  "bodyTypes": [
    { "value": "sedan", "label": "Sedan", "count": 890 },
    { "value": "suv", "label": "SUV", "count": 650 }
  ],
  "fuelTypes": [
    { "value": "PETROL", "label": "Petrol", "count": 1500 },
    { "value": "DIESEL", "label": "Diesel", "count": 320 }
  ],
  "transmissions": [
    { "value": "AUTOMATIC", "label": "Automatic", "count": 1800 },
    { "value": "MANUAL", "label": "Manual", "count": 400 }
  ],
  "priceRange": { "min": 1000, "max": 150000 },
  "yearRange": { "min": 1990, "max": 2026 },
  "mileageRange": { "min": 0, "max": 500000 }
}
```

---

## 4. Third-Party Integrations

### 4.1 Supabase

**Purpose:** Database, authentication, and file storage.

**Setup:**
```typescript
// config/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Create a per-request client that respects the user's auth context
export function createSupabaseClient(accessToken: string) {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } },
  );
}
```

**Auth Middleware:**
```typescript
// middleware/auth.middleware.ts
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Missing token' });

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });

  req.user = user;
  next();
}
```

**Storage:**
- Bucket `listings` for listing images (public read)
- Bucket `avatars` for user avatars (public read)
- Images uploaded via Supabase Storage API

---

### 4.2 NZTA Vehicle API

**Purpose:** Fetch official vehicle information by plate number.

**Integration:**
```typescript
// services/nzta.service.ts
async function lookupVehicle(plateNumber: string): Promise<NZTAVehicleResponse> {
  // 1. Check database cache (vehicle_info table) - 24 hour TTL
  const { data: cached } = await supabaseAdmin
    .from('vehicle_info')
    .select('*')
    .eq('plate_number', plateNumber)
    .single();

  if (cached && isWithin24Hours(cached.fetched_at)) {
    return cached;
  }

  // 2. Call NZTA API
  const response = await nztaClient.get(`/vehicles/${plateNumber}`);

  // 3. Upsert into database for caching
  await supabaseAdmin
    .from('vehicle_info')
    .upsert({ plate_number: plateNumber, ...response.data, fetched_at: new Date() });

  return response.data;
}
```

---

### 4.3 OpenAI API (GPT-4)

**Purpose:** Generate listing descriptions and analyze pricing.

**Description Generation:**
```typescript
// services/ai.service.ts
async function generateDescription(vehicleData: VehicleData): Promise<string> {
  const prompt = `Write a compelling car listing description for:
    - ${vehicleData.year} ${vehicleData.make} ${vehicleData.model}
    - Mileage: ${vehicleData.mileage} km
    - Fuel: ${vehicleData.fuelType}
    - Transmission: ${vehicleData.transmission}
    - Color: ${vehicleData.color}
    - WOF expires: ${vehicleData.wofExpiry}
    - Rego expires: ${vehicleData.regoExpiry}

    Write 2-3 paragraphs, professional but friendly tone, highlight key selling points.
    Target audience: New Zealand car buyers.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500,
    temperature: 0.7,
  });

  return response.choices[0].message.content;
}
```

**Price Estimation:**
- Use historical sales data + current market listings
- Factor in: make, model, year, mileage, region, condition indicators
- Return confidence score with estimate

---

## 5. Authentication & Security

### 5.1 Supabase Auth

Authentication is fully managed by Supabase. The frontend uses the Supabase client SDK for:
- Email/password registration and login
- Password reset via email
- Email verification
- OAuth providers (Google, etc.) — can be enabled in Supabase dashboard

The backend only needs to **verify the JWT** from incoming requests using `supabase.auth.getUser(token)`. No password hashing, token generation, or session management is needed on the backend.

### 5.2 Rate Limiting

Use `express-rate-limit` with the default in-memory store (sufficient for a single-server MVP).

**Limits:**
| Endpoint | Limit |
|----------|-------|
| `/vehicles/:plate` (guest) | 3 requests / day / IP |
| `/vehicles/:plate` (auth) | 10 requests / day / user |
| `/ai/generate-description` | 20 requests / day / user |
| General API | 100 requests / min / IP |

```typescript
// middleware/rateLimit.middleware.ts
import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Too many requests. Please try again later.' },
});
```

### 5.3 Input Validation

Use Zod schemas for all request validation:

```typescript
// schemas/listings.schema.ts
import { z } from 'zod';

export const createListingSchema = z.object({
  body: z.object({
    plateNumber: z.string().regex(/^[A-Z0-9]{1,7}$/),
    make: z.string().min(1).max(50),
    model: z.string().min(1).max(50),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
    mileage: z.number().int().min(0).max(1000000),
    price: z.number().min(100).max(10000000),
    description: z.string().min(50).max(5000),
    region: z.string().min(1),
    fuelType: z.enum(['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC', 'OTHER']),
    transmission: z.enum(['AUTOMATIC', 'MANUAL']),
    bodyType: z.string().min(1),
    color: z.string().min(1),
    vin: z.string().optional(),
    images: z.array(z.string().uuid()).min(3).max(10),
  }),
});
```

### 5.4 Security Headers

```typescript
import helmet from 'helmet';
import cors from 'cors';

app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL!,
    process.env.LANDING_URL!,
  ],
  credentials: true,
}));
```

---

## 6. Background Jobs

### 6.1 Price Alert Job

**Schedule:** Every hour

**Logic:**
```typescript
// jobs/priceAlerts.job.ts
async function checkPriceAlerts(): Promise<void> {
  // 1. Get listings with recent price changes (last hour)
  const { data: priceChanges } = await supabaseAdmin
    .from('price_history')
    .select('*, listings(*)')
    .gte('changed_at', new Date(Date.now() - 3600000).toISOString());

  // 2. For each price change, find users with alerts
  for (const change of priceChanges ?? []) {
    const { data: alerts } = await supabaseAdmin
      .from('favorites')
      .select('*, profiles(*)')
      .eq('listing_id', change.listing_id)
      .eq('price_alert', true);

    // 3. Log or send notifications (email integration deferred for MVP)
    for (const alert of alerts ?? []) {
      logger.info('Price alert triggered', {
        userId: alert.user_id,
        listingId: change.listing_id,
        newPrice: change.price,
      });
    }
  }
}
```

### 6.2 Cleanup Job

**Schedule:** Daily at 3am

**Tasks:**
- Clean up orphaned images (uploaded but not linked to listings)
- Archive sold/removed listings older than 90 days

---

## 7. Error Handling

### 7.1 Error Classes

```typescript
// utils/errors.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
  ) {
    super(message);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(400, message, 'BAD_REQUEST');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, message, 'NOT_FOUND');
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(429, message, 'RATE_LIMIT_EXCEEDED');
  }
}
```

### 7.2 Error Middleware

```typescript
// middleware/error.middleware.ts
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  logger.error(err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: err.errors,
      },
    });
    return;
  }

  // Unknown error - don't expose details
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}
```

---

## 8. Logging

### 8.1 Logging Strategy

```typescript
// utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    process.env.NODE_ENV === 'development'
      ? winston.format.combine(winston.format.colorize(), winston.format.simple())
      : winston.format.json(),
  ),
  defaultMeta: { service: 'kiwicar-api' },
  transports: [
    new winston.transports.Console(),
  ],
});
```

**Log Levels:**
- `error` - Application errors, exceptions
- `warn` - Warning conditions
- `info` - General operational info (requests, responses)
- `debug` - Detailed debugging info

---

## 9. Environment Configuration

### 9.1 Environment Variables

```env
# Server
NODE_ENV=development
PORT=3000

# Supabase
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NZTA API
NZTA_API_URL=https://api.nzta.govt.nz
NZTA_API_KEY=your-api-key

# OpenAI
OPENAI_API_KEY=your-openai-key

# Frontend URLs (for CORS)
FRONTEND_URL=http://localhost:5173
LANDING_URL=http://localhost:3001
```

---

## 10. Development Setup

### 10.1 Getting Started

```bash
cd kiwicar-backend
npm install
cp .env.example .env    # Fill in your Supabase and API keys
npm run dev             # Start dev server with ts-node + nodemon
```

### 10.2 Scripts

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint src/"
  }
}
```

### 10.3 Health Check Endpoint

```typescript
// GET /health
app.get('/health', async (req, res) => {
  const { error } = await supabaseAdmin.from('profiles').select('id').limit(1);

  res.status(error ? 503 : 200).json({
    status: error ? 'unhealthy' : 'healthy',
    timestamp: new Date().toISOString(),
    database: error ? 'disconnected' : 'connected',
  });
});
```

---

## 11. Phase Breakdown

### Phase 1 (MVP) - P0 Features

- [ ] Project setup (Express, TypeScript, Supabase client)
- [ ] Supabase database tables and triggers
- [ ] Auth middleware (verify Supabase JWT)
- [ ] User profile management
- [ ] Vehicle lookup (NZTA integration) with DB caching
- [ ] Listings CRUD with validation
- [ ] Image upload via Supabase Storage
- [ ] Basic search and filters
- [ ] Favorites management
- [ ] AI description generation
- [ ] AI price estimation
- [ ] Rate limiting (in-memory)
- [ ] Error handling and logging
- [ ] Basic tests

### Phase 2 - P1 Features

- [ ] Messaging system
- [ ] Price alerts with email notifications
- [ ] Real-time notifications (Supabase Realtime)
- [ ] Advanced analytics for sellers
- [ ] Enhanced AI features
- [ ] Full test coverage

### Phase 3 - P2 Features

- [ ] Push notifications
- [ ] Premium/paid features
- [ ] Dealer accounts and tools
- [ ] Redis caching layer for performance
- [ ] Docker containerization for deployment

---

## 12. Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Jan 2026 | Initial specification | - |
| 2.0 | Feb 2026 | Migrate to Supabase (auth, DB, storage); remove Redis, Docker, JWT; simplify for lean MVP | - |
