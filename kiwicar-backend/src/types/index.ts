// Database row types (snake_case, matching Supabase columns)

export interface ProfileRow {
  id: string;
  email: string;
  phone: string | null;
  nickname: string | null;
  avatar_url: string | null;
  region: string | null;
  show_phone: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListingRow {
  id: string;
  user_id: string;
  plate_number: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  description: string;
  ai_description: string | null;
  ai_price_min: number | null;
  ai_price_max: number | null;
  ai_price_recommended: number | null;
  status: string;
  region: string;
  fuel_type: string;
  transmission: string;
  body_type: string;
  color: string;
  vin: string | null;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface ListingImageRow {
  id: string;
  listing_id: string;
  image_url: string;
  order: number;
  created_at: string;
}

export interface FavoriteRow {
  id: string;
  user_id: string;
  listing_id: string;
  price_alert: boolean;
  target_price: number | null;
  created_at: string;
}

export interface PriceHistoryRow {
  id: string;
  listing_id: string;
  price: number;
  changed_at: string;
}

export interface MessageRow {
  id: string;
  sender_id: string;
  receiver_id: string;
  listing_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface VehicleInfoRow {
  plate_number: string;
  make: string;
  model: string;
  year: number;
  body_style: string | null;
  color: string | null;
  engine_cc: number | null;
  fuel_type: string | null;
  wof_expiry: string | null;
  wof_status: string | null;
  rego_expiry: string | null;
  rego_status: string | null;
  first_registered: string | null;
  odometer_readings: OdometerReading[] | null;
  fetched_at: string;
}

export interface LookupQuotaRow {
  id: string;
  user_id: string;
  count: number;
  reset_at: string;
}

// API response types (camelCase)

export interface OdometerReading {
  date: string;
  reading: number;
}

export interface VehicleInfoResponse {
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  bodyStyle: string | null;
  color: string | null;
  engineCc: number | null;
  fuelType: string | null;
  wofStatus: string | null;
  wofExpiry: string | null;
  regoStatus: string | null;
  regoExpiry: string | null;
  firstRegistered: string | null;
  odometerReadings: OdometerReading[];
  cached: boolean;
  fetchedAt: string;
}

export interface ProfileResponse {
  id: string;
  email: string;
  phone: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  region: string | null;
  showPhone: boolean;
  createdAt: string;
}

export interface ListingResponse {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  description: string;
  aiDescription: string | null;
  aiPriceMin: number | null;
  aiPriceMax: number | null;
  aiPriceRecommended: number | null;
  status: string;
  region: string;
  fuelType: string;
  transmission: string;
  bodyType: string;
  color: string;
  vin: string | null;
  views: number;
  createdAt: string;
  updatedAt: string;
  images: { id: string; url: string; order: number }[];
  seller: {
    id: string;
    nickname: string | null;
    avatarUrl: string | null;
    memberSince: string;
    listingsCount: number;
  };
}

export interface ListingCardResponse {
  id: string;
  title: string;
  price: number;
  year: number;
  mileage: number;
  region: string;
  fuelType: string;
  transmission: string;
  coverImage: string | null;
  createdAt: string;
}

export interface MyListingCardResponse extends ListingCardResponse {
  status: string;
  views: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface PriceEstimateResponse {
  priceMin: number;
  priceMax: number;
  priceRecommended: number;
  confidence: number;
  factors: { factor: string; impact: string }[];
  marketComparison: {
    similarListings: number;
    averagePrice: number;
    medianPrice: number;
  };
}

export interface FilterOptionsResponse {
  makes: { value: string; label: string; count: number }[];
  regions: { value: string; label: string; count: number }[];
  bodyTypes: { value: string; label: string; count: number }[];
  fuelTypes: { value: string; label: string; count: number }[];
  transmissions: { value: string; label: string; count: number }[];
  priceRange: { min: number; max: number };
  yearRange: { min: number; max: number };
  mileageRange: { min: number; max: number };
}

export interface ConversationResponse {
  id: string;
  otherUser: {
    id: string;
    nickname: string | null;
    avatarUrl: string | null;
  };
  listing: {
    id: string;
    title: string;
    coverImage: string | null;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    isFromMe: boolean;
  };
  unreadCount: number;
}
