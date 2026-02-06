# KiwiCar Frontend PRD

**Document Version:** 1.1
**Created:** January 2026
**Updated:** February 2026
**Status:** Draft
**Application Type:** React Single Page Application (SPA)

---

## 1. Overview

### 1.1 Purpose

This document defines the requirements for building the KiwiCar frontend application - a React-based SPA that serves as the main user interface for New Zealand's AI-powered used car trading platform.

### 1.2 Scope

The frontend application handles:
- User authentication and account management
- Car listing browsing, searching, and filtering
- Vehicle plate lookup with NZTA data display
- Car listing creation with AI-assisted features
- Favorites management and price alerts
- Buyer-seller messaging
- Seller dashboard for listing management

### 1.3 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18+ | UI framework |
| TypeScript | 5.0+ | Type safety |
| Vite | 5.0+ | Build tool |
| React Router | 6+ | Client-side routing |
| TanStack Query | 5+ | Server state management |
| Zustand | 4+ | Client state management |
| React Hook Form | 7+ | Form handling |
| Zod | 3+ | Schema validation |
| Tailwind CSS | 3+ | Styling |
| Axios | 1+ | HTTP client |
| date-fns | 3+ | Date utilities |

### 1.4 Project Structure

```
kiwicar-frontend/
├── public/
│   └── assets/
├── src/
│   ├── api/                 # API client and endpoints
│   │   ├── client.ts
│   │   ├── endpoints/
│   │   └── types.ts
│   ├── components/          # Reusable UI components
│   │   ├── common/
│   │   ├── forms/
│   │   ├── layout/
│   │   └── features/
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Page components (routes)
│   ├── stores/              # Zustand stores
│   ├── utils/               # Utility functions
│   ├── types/               # TypeScript types
│   ├── styles/              # Global styles
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 2. User Roles & Permissions

### 2.1 User Types

| Role | Description |
|------|-------------|
| **Guest** | Unauthenticated user with limited access |
| **Buyer** | Registered user browsing and searching for cars |
| **Seller** | Registered user who has listed at least one car |

*Note: A user can be both buyer and seller simultaneously.*

### 2.2 Access Matrix

| Feature | Guest | Authenticated |
|---------|-------|---------------|
| Browse listings | ✅ | ✅ |
| View listing details | ✅ | ✅ |
| Plate lookup | 3/day | 10/day |
| Search & filter | ✅ | ✅ |
| Save favorites | ❌ | ✅ |
| Price alerts | ❌ | ✅ |
| Create listings | ❌ | ✅ |
| Message sellers | ❌ | ✅ |
| Manage listings | ❌ | ✅ (own) |

---

## 3. Pages & Routes

### 3.1 Route Structure

```
/                           # Redirect to /buy
/buy                        # Car listing browse page
/buy/:listingId             # Listing detail page
/sell                       # Create new listing (wizard)
/lookup                     # Plate lookup tool
/login                      # Login page
/register                   # Registration page
/forgot-password            # Password reset request
/reset-password/:token      # Password reset form
/account                    # Account settings
/account/profile            # Profile management
/account/favorites          # Saved listings
/account/alerts             # Price alert settings
/account/listings           # My listings (seller dashboard)
/account/listings/:id/edit  # Edit listing
/messages                   # Message inbox
/messages/:conversationId   # Conversation thread
```

### 3.2 Page Specifications

---

#### 3.2.1 Car Listing Browse (`/buy`)

**Purpose:** Main marketplace view for browsing available cars.

**Layout:**
- Header with search bar
- Sidebar with filters (desktop) / Filter modal (mobile)
- Grid/List view of listing cards
- Pagination or infinite scroll

**Components:**
- `SearchBar` - Keyword search input
- `FilterPanel` - Collapsible filter options
- `ListingCard` - Individual car card
- `SortDropdown` - Sort options
- `ViewToggle` - Grid/List switch
- `Pagination` - Page navigation

**Filters (P0):**

| Filter | Type | Options |
|--------|------|---------|
| Keyword | Text | Free text search |
| Make | Multi-select | Dynamic from API |
| Model | Multi-select | Dependent on Make |
| Price Range | Range slider | $0 - $100,000+ |
| Year Range | Range slider | 1990 - Current |
| Mileage | Range slider | 0 - 300,000+ km |
| Region | Multi-select | NZ regions |
| Fuel Type | Multi-select | Petrol, Diesel, Hybrid, Electric |
| Transmission | Multi-select | Automatic, Manual |
| Body Type | Multi-select | Sedan, SUV, Hatch, etc. |

**Sort Options:**
- Newest listed (default)
- Price: Low to High
- Price: High to Low
- Lowest mileage
- Newest year

**State Management:**
- URL query params for shareable searches
- Persist filters in session storage
- Debounced search/filter updates

**API Endpoints:**
- `GET /api/listings` - Fetch listings with filters
- `GET /api/filters/options` - Get filter dropdown options

---

#### 3.2.2 Listing Detail (`/buy/:listingId`)

**Purpose:** Display complete car information and enable buyer actions.

**Sections:**

1. **Image Gallery**
   - Full-width carousel
   - Thumbnail navigation
   - Fullscreen lightbox view
   - Swipe support on mobile

2. **Key Info Header**
   - Title (Year Make Model)
   - Price (with AI comparison badge)
   - Location
   - Quick stats: Year | Mileage | Fuel | Transmission

3. **Vehicle Details**
   - Full specifications table
   - Seller description
   - AI-generated summary (if available)

4. **NZTA Vehicle Check** (collapsed by default)
   - WOF status & expiry
   - Rego status & expiry
   - Odometer history
   - First registered date
   - "Data from official NZTA records" badge

5. **AI Price Analysis**
   - Suggested price range (min/recommended/max)
   - Price vs market comparison
   - "Good deal" / "Fair" / "Above market" badge

6. **Seller Info**
   - Avatar & name
   - Member since date
   - Response time (if available)
   - Other listings count

7. **Actions**
   - "Contact Seller" button → Opens message modal
   - "Save" / "Saved" toggle
   - "Share" button
   - "Report" link

8. **Similar Listings**
   - Horizontal scroll of 4-6 related cars

**API Endpoints:**
- `GET /api/listings/:id` - Fetch listing details
- `GET /api/vehicles/:plateNumber` - Fetch NZTA data (use plateNumber from listing)
- `GET /api/listings/:id/similar` - Fetch similar listings
- `POST /api/favorites` - Save listing
- `DELETE /api/favorites/:listingId` - Remove from favorites
- `POST /api/messages` - Send message to seller

---

#### 3.2.3 Plate Lookup (`/lookup`)

**Purpose:** Standalone tool for checking vehicle history.

**Flow:**
1. Enter plate number
2. Show loading state
3. Display vehicle information card

**Input Validation:**
- NZ plate format (ABC123 or AB1234 patterns)
- Uppercase transformation
- Debounce to prevent rapid requests

**Results Display:**
- Vehicle identification (Make, Model, Year, Color)
- WOF status with expiry date
- Registration status with expiry date
- Odometer reading history (chart or table)
- First registration date in NZ
- Engine/Fuel details

**Usage Limits:**
- Display remaining lookups count
- Show upgrade prompt when limit reached
- Guest: 3/day, Authenticated: 10/day

**API Endpoints:**
- `GET /api/vehicles/:plateNumber` - Fetch vehicle info
- `GET /api/users/me/lookup-quota` - Get remaining lookups

---

#### 3.2.4 Create Listing (`/sell`)

**Purpose:** Multi-step wizard for listing a car.

**Step 1: Enter Plate Number**

*UI:*
- Large plate input field (styled like NZ plate)
- "Look up my car" button
- "Enter manually" fallback link

*Behavior:*
- Fetch vehicle details from NZTA
- Pre-fill known fields
- Show confirmation of fetched data

*Validation:*
- Valid NZ plate format required
- Handle "plate not found" gracefully

**Step 2: Confirm Vehicle Details**

*Fields (pre-filled from NZTA, editable):*

| Field | Type | Required | Source |
|-------|------|----------|--------|
| Make | Select | Yes | NZTA |
| Model | Select | Yes | NZTA |
| Year | Number | Yes | NZTA |
| Body Type | Select | Yes | NZTA |
| Fuel Type | Select | Yes | NZTA |
| Transmission | Select | Yes | User |
| Color | Select | Yes | NZTA |
| Mileage (km) | Number | Yes | User verify |
| VIN | Text | No | NZTA |

*Behavior:*
- Allow corrections to auto-filled data
- Require user to verify/update mileage
- "Next" proceeds to photo upload

**Step 3: Upload Photos**

*Requirements:*
- Minimum 3 photos, maximum 10
- First photo becomes cover image
- Max 5MB per image (compressed on upload)
- Supported formats: JPG, PNG, WebP

*UI:*
- Drag-and-drop zone
- Camera capture button (mobile)
- Grid preview of uploaded images
- Drag to reorder
- Delete individual images
- Photo tips/guidelines modal

*Behavior:*
- Client-side compression before upload
- Progress indicator per image
- Auto-upload on selection

**Step 4: Description & AI Generation**

*Components:*
- "Generate with AI" button
- Textarea for description (pre-filled with AI text)
- Character count (recommended 200-1000)
- Regenerate button

*AI Generation Input:*
- Vehicle details from step 2
- Photo analysis (if available)

*Behavior:*
- Show loading state during generation
- User can edit AI-generated text
- Can regenerate if unsatisfied

**Step 5: Set Price**

*Components:*
- Price input field
- AI price recommendation card
  - Suggested range (low / recommended / high)
  - Explanation of valuation factors
- "Price Negotiable" checkbox
- Region selector

*Behavior:*
- Show warning if price is far from recommendation
- Display "Priced to sell" / "Fair" / "Above market" indicator

**Step 6: Review & Publish**

*Components:*
- Full listing preview (as buyer would see)
- Edit buttons for each section
- Terms acceptance checkbox
- "Publish Listing" button

*Behavior:*
- Show preview in card format and detail format
- Validate all required fields before allowing publish
- Show success modal with share options on completion

**API Endpoints:**
- `GET /api/vehicles/:plateNumber` - Lookup vehicle
- `POST /api/uploads/images` - Upload image (returns URL)
- `POST /api/ai/generate-description` - Generate description
- `GET /api/ai/price-estimate` - Get price recommendation
- `POST /api/listings` - Create listing
- `GET /api/listings/drafts` - Get saved drafts
- `POST /api/listings/drafts` - Save new draft
- `PUT /api/listings/drafts/:id` - Update existing draft

---

#### 3.2.5 Authentication Pages

**Login (`/login`)**

*Fields:*
- Email or Phone
- Password
- "Remember me" checkbox

*Features:*
- Social login buttons (Google, Facebook) - P1
- "Forgot password?" link
- "Don't have an account? Sign up" link

*Validation:*
- Email format or NZ phone format
- Password required

**Register (`/register`)**

*Fields:*
- Email
- Phone (optional, +64 format)
- Password
- Confirm Password
- Terms acceptance checkbox

*Validation:*
- Email format and uniqueness
- Phone format (if provided)
- Password: min 8 chars, letter + number
- Password match

*Flow:*
- On submit, send verification email/SMS
- Show "Check your email" confirmation
- Redirect to login on verification

**Forgot Password (`/forgot-password`)**

*Fields:*
- Email

*Behavior:*
- Send reset link via email
- Show confirmation message
- Rate limit: 3 requests per hour

**Reset Password (`/reset-password/:token`)**

*Fields:*
- New Password
- Confirm Password

*Validation:*
- Token validity check
- Password requirements

**Auth Integration (Supabase Client SDK — No backend endpoints):**

Authentication is handled entirely via the Supabase JS client on the frontend. No `/api/auth/*` backend routes exist.

| Operation | Supabase Method | Status |
|-----------|----------------|--------|
| Register | `supabase.auth.signUp({ email, password, options: { data: { phone } } })` | Implemented |
| Login | `supabase.auth.signInWithPassword({ email, password })` | Implemented |
| Forgot password | `supabase.auth.resetPasswordForEmail(email)` | Implemented |
| Reset password | Handled via Supabase email link + `supabase.auth.updateUser({ password })` | Implemented |
| Email verification | Supabase built-in (automatic email on signup) | Implemented |
| Token refresh | Supabase client handles automatically | Implemented |
| Logout | `supabase.auth.signOut()` | Implemented |
| Session persistence | `supabase.auth.getSession()` + `onAuthStateChange()` | Implemented |

---

#### 3.2.6 Account Pages

**Profile (`/account/profile`)**

*Fields:*
- Avatar upload
- Nickname
- Region (dropdown)
- Phone visibility toggle
- Email (read-only, change via verification)

**Favorites (`/account/favorites`)**

*Features:*
- Grid of saved listings
- Price change indicators
- "Sold" / "Removed" badges
- Quick remove button
- Sort by: Date saved, Price change

**Alerts (`/account/alerts`)**

*Features:*
- List of price alerts
- Toggle individual alerts on/off
- Set target price per listing
- Delete alert

**My Listings (`/account/listings`) - Seller Dashboard**

*Features:*
- Tabs: Active | Sold | Drafts
- Listing cards with:
  - Views count
  - Favorites count
  - Days listed
  - Inquiries count
- Actions: Edit | Mark as Sold | Delete
- "Create New Listing" button

**Edit Listing (`/account/listings/:id/edit`)**

*Same as create wizard but:*
- Pre-filled with existing data
- Plate number locked (non-editable)
- "Update Listing" instead of "Publish"
- Price change warning (triggers alerts)

**API Endpoints:**
- `GET /api/users/me` - Get profile
- `PUT /api/users/me` - Update profile
- `POST /api/users/me/avatar` - Upload avatar
- `DELETE /api/users/me` - Delete account
- `GET /api/favorites` - Get favorites
- `GET /api/favorites/alerts` - Get alerts
- `PUT /api/favorites/:id/alert` - Update alert
- `GET /api/listings/my` - Get my listings
- `PUT /api/listings/:id` - Update listing
- `PUT /api/listings/:id/status` - Change status (sold/active)
- `DELETE /api/listings/:id` - Delete listing
- `DELETE /api/uploads/images/:id` - Delete uploaded image

---

#### 3.2.7 Messages (`/messages`)

**Inbox**

*Features:*
- Conversation list sorted by recent
- Unread indicator
- Preview of last message
- Associated listing thumbnail

**Conversation (`/messages/:conversationId`)**

*Features:*
- Message thread
- Listing context card (top)
- Input field with send button
- Timestamp grouping
- Read receipts (P1)
- Image attachments (P2)

**API Endpoints:**
- `GET /api/messages/conversations` - List conversations
- `GET /api/messages/conversations/:id` - Get messages
- `POST /api/messages` - Send message
- `PUT /api/messages/conversations/:id/read` - Mark read
- `GET /api/messages/unread-count` - Get unread message count (for nav badge)
- WebSocket: Real-time message updates (P1)

---

## 4. Component Library

### 4.1 Common Components

| Component | Description |
|-----------|-------------|
| `Button` | Primary, secondary, ghost, danger variants |
| `Input` | Text, email, phone, number inputs |
| `Select` | Single and multi-select dropdowns |
| `Checkbox` | Checkbox with label |
| `RadioGroup` | Radio button group |
| `Modal` | Dialog overlay |
| `Toast` | Notification popups |
| `Spinner` | Loading indicator |
| `Skeleton` | Content placeholder |
| `Badge` | Status indicators |
| `Avatar` | User/placeholder image |
| `Card` | Container with shadow |
| `Tabs` | Tab navigation |
| `Pagination` | Page controls |
| `RangeSlider` | Min-max range input |
| `ImageUploader` | Drag-drop image upload |
| `ImageCarousel` | Swipeable image gallery |

### 4.2 Feature Components

| Component | Description |
|-----------|-------------|
| `ListingCard` | Car listing preview card |
| `ListingGrid` | Grid layout of listing cards |
| `FilterPanel` | Sidebar/modal filter controls |
| `SearchBar` | Search input with suggestions |
| `PlateInput` | NZ plate number styled input |
| `VehicleInfoCard` | NZTA data display card |
| `PriceEstimateCard` | AI pricing display |
| `MessageBubble` | Chat message display |
| `ConversationPreview` | Inbox list item |
| `ListingWizard` | Multi-step form container |
| `ProgressStepper` | Wizard step indicator |

---

## 5. State Management

### 5.1 Zustand Stores

**`authStore`** (implemented — uses Supabase Auth)
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  initialize: () => Promise<void>;           // getSession + onAuthStateChange listener
  login: (credentials: { email: string; password: string }) => Promise<void>;
  signUp: (data: { email: string; password: string; phone?: string }) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}
```

**`listingWizardStore`**
```typescript
interface ListingWizardState {
  step: number;
  vehicleInfo: VehicleInfo | null;
  photos: UploadedPhoto[];
  description: string;
  price: number | null;
  region: string;
  setStep: (step: number) => void;
  setVehicleInfo: (info: VehicleInfo) => void;
  addPhoto: (photo: UploadedPhoto) => void;
  removePhoto: (id: string) => void;
  reorderPhotos: (from: number, to: number) => void;
  setDescription: (desc: string) => void;
  setPrice: (price: number) => void;
  reset: () => void;
}
```

**`filterStore`**
```typescript
interface FilterState {
  filters: ListingFilters;
  setFilter: (key: string, value: any) => void;
  resetFilters: () => void;
  filtersToQueryString: () => string;
}
```

### 5.2 TanStack Query Keys

```typescript
const queryKeys = {
  listings: {
    all: ['listings'],
    list: (filters: Filters) => ['listings', 'list', filters],
    detail: (id: string) => ['listings', 'detail', id],
    similar: (id: string) => ['listings', 'similar', id],
    my: () => ['listings', 'my'],
  },
  vehicles: {
    lookup: (plate: string) => ['vehicles', plate],
  },
  favorites: {
    all: ['favorites'],
  },
  messages: {
    conversations: ['messages', 'conversations'],
    conversation: (id: string) => ['messages', 'conversation', id],
  },
  user: {
    me: ['user', 'me'],
    quota: ['user', 'quota'],
  },
};
```

---

## 6. API Integration

### 6.1 HTTP Client Configuration

```typescript
// api/client.ts
import axios from 'axios';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add Supabase auth token
apiClient.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Response interceptor - handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

> **Note:** The token is retrieved from `supabase.auth.getSession()` rather than from the Zustand store, ensuring Supabase handles token refresh automatically.

### 6.2 Environment Variables

```env
# Backend API
VITE_API_URL=http://localhost:3001/api

# Supabase (required for auth)
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Landing page
VITE_LANDING_URL=https://kiwicar.co.nz

# OAuth (P1 — not yet implemented)
# VITE_GOOGLE_CLIENT_ID=xxx
```

---

## 7. Error Handling

### 7.1 Error Types

| Error Type | Handling |
|------------|----------|
| Network Error | Toast: "Connection error. Please try again." |
| 400 Bad Request | Show validation errors inline |
| 401 Unauthorized | Redirect to login |
| 403 Forbidden | Toast: "You don't have permission" |
| 404 Not Found | Show 404 page or "Listing not found" |
| 429 Rate Limited | Toast: "Too many requests. Please wait." |
| 500 Server Error | Toast: "Something went wrong. Please try again." |

### 7.2 Form Validation

Use Zod schemas with react-hook-form:

```typescript
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const listingSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  mileage: z.number().min(0).max(1000000),
  price: z.number().min(100).max(10000000),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  photos: z.array(z.string()).min(3, 'At least 3 photos required'),
});
```

---

## 8. Performance Requirements

### 8.1 Core Web Vitals Targets

| Metric | Target |
|--------|--------|
| LCP (Largest Contentful Paint) | < 2.5s |
| FID (First Input Delay) | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| TTI (Time to Interactive) | < 3.5s |

### 8.2 Optimization Strategies

- **Code Splitting:** Lazy load routes with React.lazy()
- **Image Optimization:** Use responsive images, lazy loading, WebP format
- **Bundle Size:** Tree-shaking, analyze with `vite-bundle-visualizer`
- **Caching:** TanStack Query caching, service worker (PWA - P1)
- **Virtualization:** Use virtual lists for long listing results

---

## 9. Responsive Design

### 9.1 Breakpoints

| Breakpoint | Width | Device |
|------------|-------|--------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet portrait |
| `lg` | 1024px | Tablet landscape / Small desktop |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Large desktop |

### 9.2 Mobile-First Approach

- Default styles for mobile
- Progressive enhancement for larger screens
- Touch-friendly targets (min 44x44px)
- Swipe gestures for carousels
- Bottom navigation consideration (P1)

---

## 10. Accessibility (a11y)

### 10.1 Requirements

- WCAG 2.1 Level AA compliance
- Keyboard navigation for all interactive elements
- Screen reader compatibility
- Sufficient color contrast (4.5:1 minimum)
- Focus indicators
- Alt text for all images
- Form labels and error announcements
- Skip to main content link

### 10.2 Implementation

- Use semantic HTML elements
- ARIA attributes where needed
- Test with axe DevTools
- Test with VoiceOver/NVDA

---

## 11. Testing Strategy

### 11.1 Test Types

| Type | Tool | Coverage |
|------|------|----------|
| Unit Tests | Vitest | Utility functions, hooks |
| Component Tests | Vitest + Testing Library | UI components |
| Integration Tests | Vitest + MSW | API integration |
| E2E Tests | Playwright | Critical user flows |

### 11.2 Critical Flows to Test (E2E)

1. User registration and login
2. Browse and filter listings
3. View listing detail
4. Plate lookup
5. Create a listing (full wizard)
6. Save a favorite and set alert
7. Send a message

---

## 12. Security Considerations

### 12.1 Frontend Security

- Auth tokens managed by Supabase client SDK (localStorage-based session with automatic refresh)
- Supabase access token attached to API requests via Axios interceptor
- 401 responses trigger automatic logout and redirect to `/login`
- Input sanitization (prevent XSS)
- Content Security Policy headers
- No sensitive data (service role keys, etc.) in client-side code — only the Supabase anon key is exposed
- Secure environment variable handling via Vite `VITE_` prefix

### 12.2 Data Handling

- Never log sensitive data to console in production
- Mask phone numbers in UI where appropriate
- Clear sensitive data on logout

---

## 13. Analytics & Monitoring

### 13.1 Events to Track

| Event | Properties |
|-------|------------|
| `page_view` | page_name, referrer |
| `search` | query, filters, results_count |
| `listing_view` | listing_id, source |
| `listing_create_start` | - |
| `listing_create_complete` | listing_id |
| `plate_lookup` | has_results |
| `favorite_add` | listing_id |
| `message_send` | listing_id |
| `login` | method |
| `register` | method |

### 13.2 Tools

- Google Analytics 4 (P1)
- Sentry for error tracking (P1)

---

## 14. Deployment

### 14.1 Build Configuration

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "test": "vitest",
    "test:e2e": "playwright test"
  }
}
```

### 14.2 CI/CD Pipeline

1. On push to `main`:
   - Run linting
   - Run unit tests
   - Build production bundle
   - Deploy to staging

2. On release tag:
   - Run full test suite
   - Build production bundle
   - Deploy to production

### 14.3 Hosting

- **Recommended:** Vercel or Cloudflare Pages
- Static file hosting with CDN
- Environment-specific builds
- Preview deployments for PRs

---

## 15. Phase Breakdown

### Phase 1 (MVP) - P0 Features

- [x] Project setup (Vite, React, TypeScript, Tailwind)
- [x] Authentication (login, register, forgot password) — via Supabase Auth
- [ ] Listing browse page with filters
- [ ] Listing detail page
- [ ] Plate lookup page
- [ ] Create listing wizard (full flow)
- [ ] Favorites (save/unsave)
- [ ] Price alerts (email-based)
- [ ] Basic account pages
- [ ] Responsive design

### Phase 2 - P1 Features

- [ ] Social login (Google, Facebook)
- [ ] In-app messaging
- [ ] Seller dashboard with analytics
- [ ] Enhanced AI features display
- [ ] Real-time notifications
- [ ] PWA support
- [ ] Advanced search (saved searches)

### Phase 3 - P2 Features

- [ ] Apple Sign In
- [ ] Push notifications
- [ ] Image attachments in messages
- [ ] Listing promotion/boost
- [ ] Dealer accounts

---

## 16. Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Jan 2026 | Initial specification | - |
| 1.1 | Feb 2026 | Align API endpoints with backend PRD: replace /api/auth/* with Supabase Auth SDK; fix vehicle-info and draft endpoints; add missing endpoints (unread-count, account deletion, image deletion, avatar upload); update API client code, env vars, and security section to reflect Supabase integration; mark auth and project setup as done in phase checklist | - |
