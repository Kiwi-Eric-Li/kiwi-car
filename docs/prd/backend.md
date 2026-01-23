# KiwiCar Backend PRD

**Document Version:** 1.0
**Created:** January 2026
**Status:** Draft
**Application Type:** Node.js REST API Server

---

## 1. Overview

### 1.1 Purpose

This document defines the requirements for building the KiwiCar backend API server - a Node.js/Express application with TypeScript that powers the KiwiCar platform's core functionality including authentication, listings management, vehicle data, AI features, and messaging.

### 1.2 Scope

The backend server handles:
- User authentication and authorization
- Car listing CRUD operations
- Vehicle information lookup (NZTA integration)
- AI-powered features (description generation, pricing)
- Favorites and price alert management
- Messaging between buyers and sellers
- Image upload and storage
- Email notifications
- Rate limiting and security

### 1.3 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20 LTS | Runtime environment |
| Express.js | 4.x | Web framework |
| TypeScript | 5.0+ | Type safety |
| Prisma | 5+ | ORM and database toolkit |
| MySQL | 8.0+ | Primary database |
| Redis | 7+ | Caching, sessions, rate limiting |
| JWT | - | Authentication tokens |
| bcrypt | - | Password hashing |
| Zod | 3+ | Request validation |
| Multer | - | File upload handling |
| Sharp | - | Image processing |
| Winston | - | Logging |
| node-cron | - | Scheduled tasks |

### 1.4 Project Structure

```
kiwicar-backend/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── env.ts
│   │   └── constants.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── listings.controller.ts
│   │   ├── vehicles.controller.ts
│   │   ├── users.controller.ts
│   │   ├── favorites.controller.ts
│   │   ├── messages.controller.ts
│   │   ├── uploads.controller.ts
│   │   └── ai.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── listings.service.ts
│   │   ├── nzta.service.ts
│   │   ├── ai.service.ts
│   │   ├── email.service.ts
│   │   ├── storage.service.ts
│   │   └── cache.service.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── validate.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── upload.middleware.ts
│   ├── routes/
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── listings.routes.ts
│   │   ├── vehicles.routes.ts
│   │   ├── users.routes.ts
│   │   ├── favorites.routes.ts
│   │   ├── messages.routes.ts
│   │   ├── uploads.routes.ts
│   │   └── ai.routes.ts
│   ├── schemas/
│   │   ├── auth.schema.ts
│   │   ├── listings.schema.ts
│   │   └── ...
│   ├── types/
│   │   ├── express.d.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── errors.ts
│   │   ├── helpers.ts
│   │   └── pagination.ts
│   ├── jobs/
│   │   ├── priceAlerts.job.ts
│   │   └── cleanup.job.ts
│   ├── app.ts
│   └── server.ts
├── tests/
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── package.json
└── tsconfig.json
```

---

## 2. Database Schema

### 2.1 Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  phone         String?   @unique
  passwordHash  String
  nickname      String?
  avatarUrl     String?
  region        String?
  showPhone     Boolean   @default(false)
  isVerified    Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  listings      Listing[]
  favorites     Favorite[]
  sentMessages     Message[] @relation("SentMessages")
  receivedMessages Message[] @relation("ReceivedMessages")
  lookupQuota   LookupQuota?

  @@map("users")
}

model Listing {
  id              String    @id @default(uuid())
  userId          String
  plateNumber     String
  make            String
  model           String
  year            Int
  mileage         Int
  price           Decimal   @db.Decimal(10, 2)
  description     String    @db.Text
  aiDescription   String?   @db.Text
  aiPriceMin      Decimal?  @db.Decimal(10, 2)
  aiPriceMax      Decimal?  @db.Decimal(10, 2)
  aiPriceRecommended Decimal? @db.Decimal(10, 2)
  status          ListingStatus @default(ACTIVE)
  region          String
  fuelType        FuelType
  transmission    Transmission
  bodyType        String
  color           String
  vin             String?
  views           Int       @default(0)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  user            User      @relation(fields: [userId], references: [id])
  images          ListingImage[]
  favorites       Favorite[]
  priceHistory    PriceHistory[]
  messages        Message[]

  @@index([status, createdAt])
  @@index([make, model])
  @@index([region])
  @@index([price])
  @@map("listings")
}

model ListingImage {
  id          String   @id @default(uuid())
  listingId   String
  imageUrl    String
  order       Int      @default(0)
  createdAt   DateTime @default(now())

  listing     Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@index([listingId])
  @@map("listing_images")
}

model Favorite {
  id          String   @id @default(uuid())
  userId      String
  listingId   String
  priceAlert  Boolean  @default(false)
  targetPrice Decimal? @db.Decimal(10, 2)
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  listing     Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@unique([userId, listingId])
  @@map("favorites")
}

model PriceHistory {
  id          String   @id @default(uuid())
  listingId   String
  price       Decimal  @db.Decimal(10, 2)
  changedAt   DateTime @default(now())

  listing     Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@index([listingId])
  @@map("price_history")
}

model Message {
  id           String   @id @default(uuid())
  senderId     String
  receiverId   String
  listingId    String
  content      String   @db.Text
  isRead       Boolean  @default(false)
  createdAt    DateTime @default(now())

  sender       User     @relation("SentMessages", fields: [senderId], references: [id])
  receiver     User     @relation("ReceivedMessages", fields: [receiverId], references: [id])
  listing      Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@index([senderId, receiverId, listingId])
  @@index([receiverId, isRead])
  @@map("messages")
}

model VehicleInfo {
  plateNumber      String   @id
  make             String
  model            String
  year             Int
  bodyStyle        String?
  color            String?
  engineCc         Int?
  fuelType         String?
  wofExpiry        DateTime?
  wofStatus        String?
  regoExpiry       DateTime?
  regoStatus       String?
  firstRegistered  DateTime?
  odometerReadings Json?
  fetchedAt        DateTime @default(now())

  @@map("vehicle_info")
}

model LookupQuota {
  id          String   @id @default(uuid())
  userId      String   @unique
  count       Int      @default(0)
  resetAt     DateTime

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("lookup_quotas")
}

model PasswordReset {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([token])
  @@map("password_resets")
}

model EmailVerification {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  verified  Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([token])
  @@map("email_verifications")
}

enum ListingStatus {
  ACTIVE
  SOLD
  REMOVED
  DRAFT
}

enum FuelType {
  PETROL
  DIESEL
  HYBRID
  ELECTRIC
  OTHER
}

enum Transmission {
  AUTOMATIC
  MANUAL
}
```

---

## 3. API Endpoints

### 3.1 Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Create new account | No |
| POST | `/login` | Login with credentials | No |
| POST | `/logout` | Invalidate session | Yes |
| POST | `/refresh` | Refresh access token | Yes |
| POST | `/forgot-password` | Request password reset | No |
| POST | `/reset-password` | Reset password with token | No |
| GET | `/verify-email/:token` | Verify email address | No |
| POST | `/resend-verification` | Resend verification email | Yes |

**POST /register**

Request:
```json
{
  "email": "user@example.com",
  "phone": "+64211234567",
  "password": "SecurePass123"
}
```

Response (201):
```json
{
  "message": "Registration successful. Please verify your email.",
  "userId": "uuid"
}
```

**POST /login**

Request:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

Response (200):
```json
{
  "accessToken": "jwt...",
  "refreshToken": "jwt...",
  "expiresIn": 3600,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "nickname": "John",
    "avatarUrl": null,
    "isVerified": true
  }
}
```

---

### 3.2 Users (`/api/users`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/me` | Get current user profile | Yes |
| PUT | `/me` | Update profile | Yes |
| POST | `/me/avatar` | Upload avatar | Yes |
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
  "isVerified": true,
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

### 3.3 Listings (`/api/listings`)

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

### 3.4 Vehicles (`/api/vehicles`)

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

### 3.5 Favorites (`/api/favorites`)

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

### 3.6 Messages (`/api/messages`)

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

### 3.7 AI (`/api/ai`)

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
  "regoExpiry": "2026-08-20",
  "imageUrls": ["https://...", "https://..."]
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

### 3.8 Uploads (`/api/uploads`)

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
      "url": "https://storage.kiwicar.co.nz/images/abc123.webp",
      "thumbnailUrl": "https://storage.kiwicar.co.nz/images/abc123_thumb.webp"
    }
  ]
}
```

---

### 3.9 Filter Options (`/api/filters`)

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

### 4.1 NZTA Vehicle API

**Purpose:** Fetch official vehicle information by plate number.

**Integration:**
```typescript
// services/nzta.service.ts
interface NZTAVehicleResponse {
  make: string;
  model: string;
  year: number;
  // ... etc
}

async function lookupVehicle(plateNumber: string): Promise<NZTAVehicleResponse> {
  // 1. Check cache (Redis) - 24 hour TTL
  const cached = await cache.get(`vehicle:${plateNumber}`);
  if (cached) return cached;

  // 2. Call NZTA API
  const response = await nztaClient.get(`/vehicles/${plateNumber}`);

  // 3. Cache result
  await cache.set(`vehicle:${plateNumber}`, response.data, 86400);

  // 4. Store in database for historical purposes
  await prisma.vehicleInfo.upsert({...});

  return response.data;
}
```

**Caching Strategy:**
- Cache vehicle info in Redis for 24 hours
- Store in database for analytics and fallback
- Rate limit API calls to stay within NZTA limits

---

### 4.2 OpenAI API (GPT-4)

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

### 4.3 Email Service (SendGrid)

**Purpose:** Send transactional emails.

**Email Types:**

| Template | Trigger |
|----------|---------|
| `welcome` | User registration |
| `verify-email` | Email verification |
| `reset-password` | Password reset request |
| `price-alert` | Favorite listing price drops |
| `new-message` | New message received |
| `listing-sold` | User's favorite sold |

**Implementation:**
```typescript
// services/email.service.ts
import sgMail from '@sendgrid/mail';

interface EmailOptions {
  to: string;
  template: string;
  data: Record<string, any>;
}

async function sendEmail(options: EmailOptions): Promise<void> {
  const templates = {
    'welcome': 'd-abc123...',
    'verify-email': 'd-def456...',
    'reset-password': 'd-ghi789...',
    'price-alert': 'd-jkl012...',
    'new-message': 'd-mno345...',
  };

  await sgMail.send({
    to: options.to,
    from: 'noreply@kiwicar.co.nz',
    templateId: templates[options.template],
    dynamicTemplateData: options.data,
  });
}
```

---

### 4.4 Cloud Storage (S3/R2)

**Purpose:** Store user-uploaded images.

**Implementation:**
```typescript
// services/storage.service.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

async function uploadImage(file: Express.Multer.File): Promise<UploadResult> {
  // 1. Validate file type
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
    throw new BadRequestError('Invalid file type');
  }

  // 2. Process image (resize, convert to WebP)
  const processed = await sharp(file.buffer)
    .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  // 3. Generate thumbnail
  const thumbnail = await sharp(file.buffer)
    .resize(400, 300, { fit: 'cover' })
    .webp({ quality: 70 })
    .toBuffer();

  // 4. Upload to S3
  const key = `images/${uuid()}.webp`;
  const thumbKey = `images/${uuid()}_thumb.webp`;

  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: processed,
    ContentType: 'image/webp',
  }));

  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: thumbKey,
    Body: thumbnail,
    ContentType: 'image/webp',
  }));

  return {
    id: uuid(),
    url: `${process.env.CDN_URL}/${key}`,
    thumbnailUrl: `${process.env.CDN_URL}/${thumbKey}`,
  };
}
```

---

## 5. Authentication & Security

### 5.1 JWT Strategy

**Token Structure:**
```typescript
// Access Token (short-lived: 1 hour)
interface AccessTokenPayload {
  sub: string;       // User ID
  email: string;
  iat: number;
  exp: number;
}

// Refresh Token (long-lived: 30 days)
interface RefreshTokenPayload {
  sub: string;
  jti: string;       // Unique token ID for revocation
  iat: number;
  exp: number;
}
```

**Token Flow:**
1. Login → Return access + refresh tokens
2. Access token expires → Client uses refresh token to get new access token
3. Refresh token stored in httpOnly cookie
4. Logout → Blacklist refresh token in Redis

### 5.2 Password Hashing

```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### 5.3 Rate Limiting

**Limits:**
| Endpoint | Limit |
|----------|-------|
| `/auth/login` | 5 requests / 15 min / IP |
| `/auth/register` | 3 requests / hour / IP |
| `/auth/forgot-password` | 3 requests / hour / email |
| `/vehicles/:plate` (guest) | 3 requests / day / IP |
| `/vehicles/:plate` (auth) | 10 requests / day / user |
| `/ai/generate-description` | 20 requests / day / user |
| General API | 100 requests / min / user |

**Implementation:**
```typescript
// middleware/rateLimit.middleware.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

const loginLimiter = rateLimit({
  store: new RedisStore({ client: redisClient }),
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts. Please try again later.' },
});
```

### 5.4 Input Validation

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

### 5.5 Security Headers

```typescript
// middleware/security.middleware.ts
import helmet from 'helmet';
import cors from 'cors';

app.use(helmet());
app.use(cors({
  origin: [
    'https://kiwicar.co.nz',
    'https://app.kiwicar.co.nz',
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
  const priceChanges = await prisma.priceHistory.findMany({
    where: {
      changedAt: { gte: new Date(Date.now() - 3600000) },
    },
    include: { listing: true },
  });

  // 2. For each price change, find users with alerts
  for (const change of priceChanges) {
    const alerts = await prisma.favorite.findMany({
      where: {
        listingId: change.listingId,
        priceAlert: true,
        OR: [
          { targetPrice: null },
          { targetPrice: { gte: change.price } },
        ],
      },
      include: { user: true },
    });

    // 3. Send email notifications
    for (const alert of alerts) {
      await emailService.send({
        to: alert.user.email,
        template: 'price-alert',
        data: {
          listingTitle: `${change.listing.year} ${change.listing.make} ${change.listing.model}`,
          oldPrice: change.listing.price,
          newPrice: change.price,
          listingUrl: `https://app.kiwicar.co.nz/buy/${change.listingId}`,
        },
      });
    }
  }
}
```

### 6.2 Cleanup Job

**Schedule:** Daily at 3am

**Tasks:**
- Delete expired password reset tokens
- Delete expired email verification tokens
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

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message, 'FORBIDDEN');
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

## 8. Logging & Monitoring

### 8.1 Logging Strategy

```typescript
// utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  defaultMeta: { service: 'kiwicar-api' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});
```

**Log Levels:**
- `error` - Application errors, exceptions
- `warn` - Warning conditions
- `info` - General operational info (requests, responses)
- `debug` - Detailed debugging info

### 8.2 Request Logging

```typescript
// middleware/requestLogger.middleware.ts
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    logger.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: Date.now() - start,
      userId: req.user?.id,
      ip: req.ip,
    });
  });

  next();
});
```

---

## 9. Environment Configuration

### 9.1 Environment Variables

```env
# Server
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000

# Database
DATABASE_URL=mysql://user:password@localhost:3306/kiwicar

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRY=1h
JWT_REFRESH_EXPIRY=30d

# NZTA API
NZTA_API_URL=https://api.nzta.govt.nz
NZTA_API_KEY=your-api-key

# OpenAI
OPENAI_API_KEY=your-openai-key

# SendGrid
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@kiwicar.co.nz

# AWS S3 / Cloudflare R2
S3_BUCKET=kiwicar-images
S3_REGION=ap-southeast-2
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
CDN_URL=https://cdn.kiwicar.co.nz

# Frontend URLs
FRONTEND_URL=https://app.kiwicar.co.nz
LANDING_URL=https://kiwicar.co.nz
```

---

## 10. Testing Strategy

### 10.1 Test Types

| Type | Tool | Coverage |
|------|------|----------|
| Unit Tests | Vitest | Services, utilities |
| Integration Tests | Vitest + Supertest | API endpoints |
| Database Tests | Vitest + Test containers | Prisma queries |

### 10.2 Test Structure

```
tests/
├── unit/
│   ├── services/
│   └── utils/
├── integration/
│   ├── auth.test.ts
│   ├── listings.test.ts
│   └── vehicles.test.ts
├── fixtures/
│   └── testData.ts
└── setup.ts
```

### 10.3 Critical Test Cases

**Authentication:**
- Register with valid/invalid data
- Login with correct/incorrect credentials
- Token refresh flow
- Password reset flow

**Listings:**
- Create listing with valid data
- Validation errors for invalid data
- Filter and pagination
- Owner-only update/delete

**Vehicles:**
- Plate lookup with cache hit/miss
- Rate limiting enforcement
- Invalid plate format handling

---

## 11. Deployment

### 11.1 Docker Configuration

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
RUN npx prisma generate
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://user:password@db:3306/kiwicar
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: kiwicar
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  mysql_data:
  redis_data:
```

### 11.2 CI/CD Pipeline

1. **On push to main:**
   - Run linting
   - Run unit tests
   - Run integration tests
   - Build Docker image
   - Deploy to staging

2. **On release tag:**
   - Run full test suite
   - Build production Docker image
   - Run database migrations
   - Deploy to production
   - Run smoke tests

### 11.3 Health Check Endpoint

```typescript
// GET /health
app.get('/health', async (req, res) => {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    nzta: await checkNZTA(),
  };

  const healthy = Object.values(checks).every(c => c.status === 'ok');

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks,
  });
});
```

---

## 12. Phase Breakdown

### Phase 1 (MVP) - P0 Features

- [ ] Project setup (Express, TypeScript, Prisma)
- [ ] Database schema and migrations
- [ ] Authentication (register, login, password reset)
- [ ] User profile management
- [ ] Vehicle lookup (NZTA integration) with caching
- [ ] Listings CRUD with validation
- [ ] Image upload and storage
- [ ] Basic search and filters
- [ ] Favorites management
- [ ] Price alerts (email-based)
- [ ] AI description generation
- [ ] AI price estimation
- [ ] Rate limiting
- [ ] Error handling and logging
- [ ] Basic tests

### Phase 2 - P1 Features

- [ ] Social login (Google, Facebook)
- [ ] Messaging system
- [ ] Real-time notifications (WebSocket)
- [ ] Advanced analytics for sellers
- [ ] Enhanced AI features
- [ ] Full test coverage
- [ ] Performance optimization

### Phase 3 - P2 Features

- [ ] Apple Sign In
- [ ] Push notifications
- [ ] Data scraping integration
- [ ] Premium/paid features
- [ ] Dealer accounts and tools

---

## 13. Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Jan 2026 | Initial specification | - |
