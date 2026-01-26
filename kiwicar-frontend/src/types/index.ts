// User types
export interface User {
  id: string;
  email: string;
  phone?: string;
  nickname?: string;
  avatar?: string;
  region?: string;
  createdAt: string;
  phoneVisible: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Vehicle types
export interface VehicleInfo {
  plate: string;
  make: string;
  model: string;
  year: number;
  bodyType: string;
  fuelType: string;
  transmission?: string;
  color: string;
  vin?: string;
  engineSize?: string;
  wofExpiry?: string;
  wofStatus: 'current' | 'expired' | 'unknown';
  regoExpiry?: string;
  regoStatus: 'current' | 'expired' | 'unknown';
  firstRegisteredNZ?: string;
  odometerHistory?: OdometerReading[];
}

export interface OdometerReading {
  date: string;
  reading: number;
  source: string;
}

// Listing types
export interface Listing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  sellerJoinedDate: string;
  plate: string;
  make: string;
  model: string;
  year: number;
  bodyType: string;
  fuelType: string;
  transmission: string;
  color: string;
  mileage: number;
  price: number;
  negotiable: boolean;
  description: string;
  aiDescription?: string;
  region: string;
  images: string[];
  views: number;
  favorites: number;
  status: 'active' | 'sold' | 'draft';
  createdAt: string;
  updatedAt: string;
  vehicleInfo?: VehicleInfo;
  priceAnalysis?: PriceAnalysis;
}

export interface ListingCard {
  id: string;
  title: string;
  price: number;
  negotiable: boolean;
  year: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  location: string;
  image: string;
  isFavorite: boolean;
  createdAt: string;
  priceRating?: 'good' | 'fair' | 'above';
}

export interface PriceAnalysis {
  suggestedMin: number;
  suggestedRecommended: number;
  suggestedMax: number;
  rating: 'good' | 'fair' | 'above';
  explanation: string;
}

// Filter types
export interface ListingFilters {
  keyword?: string;
  makes?: string[];
  models?: string[];
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  mileageMin?: number;
  mileageMax?: number;
  regions?: string[];
  fuelTypes?: string[];
  transmissions?: string[];
  bodyTypes?: string[];
  sortBy?: SortOption;
}

export type SortOption =
  | 'newest'
  | 'price_asc'
  | 'price_desc'
  | 'mileage_asc'
  | 'year_desc';

// Filter options from API
export interface FilterOptions {
  makes: string[];
  models: Record<string, string[]>; // make -> models
  regions: string[];
  fuelTypes: string[];
  transmissions: string[];
  bodyTypes: string[];
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Favorites
export interface Favorite {
  id: string;
  listingId: string;
  listing: ListingCard;
  alertEnabled: boolean;
  targetPrice?: number;
  createdAt: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
