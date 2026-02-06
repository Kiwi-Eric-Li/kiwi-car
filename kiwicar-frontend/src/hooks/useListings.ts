import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/api/client';
import { useFilterStore } from '@/stores/filterStore';
import type { FilterOptions, ListingFilters, ListingCard, Listing } from '@/types';

interface ListingCardResponse {
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

interface ListingsResponse {
  data: ListingCardResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ListingDetailResponse {
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

function mapToListingCard(item: ListingCardResponse): ListingCard {
  return {
    id: item.id,
    title: item.title,
    price: item.price,
    negotiable: false,
    year: item.year,
    mileage: item.mileage,
    fuelType: item.fuelType,
    transmission: item.transmission,
    location: item.region,
    image: item.coverImage || '/placeholder-car.jpg',
    isFavorite: false,
    createdAt: item.createdAt,
  };
}

function mapToListing(item: ListingDetailResponse): Listing {
  return {
    id: item.id,
    sellerId: item.seller.id,
    sellerName: item.seller.nickname || 'Seller',
    sellerAvatar: item.seller.avatarUrl || undefined,
    sellerJoinedDate: item.seller.memberSince,
    plate: item.plateNumber,
    make: item.make,
    model: item.model,
    year: item.year,
    bodyType: item.bodyType,
    fuelType: item.fuelType,
    transmission: item.transmission,
    color: item.color,
    mileage: item.mileage,
    price: item.price,
    negotiable: false,
    description: item.description,
    aiDescription: item.aiDescription || undefined,
    region: item.region,
    images: item.images.map((img) => img.url),
    views: item.views,
    favorites: 0,
    status: item.status.toLowerCase() as 'active' | 'sold' | 'draft',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    priceAnalysis: item.aiPriceMin && item.aiPriceMax && item.aiPriceRecommended
      ? {
          suggestedMin: item.aiPriceMin,
          suggestedRecommended: item.aiPriceRecommended,
          suggestedMax: item.aiPriceMax,
          rating: item.price <= item.aiPriceRecommended ? 'good' : item.price <= item.aiPriceMax ? 'fair' : 'above',
          explanation: `Based on market analysis, this ${item.year} ${item.make} ${item.model} is priced ${item.price <= item.aiPriceRecommended ? 'competitively' : 'above average'} for its condition and mileage.`,
        }
      : undefined,
  };
}

function buildQueryParams(filters: ListingFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.keyword) params.set('q', filters.keyword);
  if (filters.makes?.length) params.set('make', filters.makes.join(','));
  if (filters.priceMin) params.set('minPrice', String(filters.priceMin));
  if (filters.priceMax) params.set('maxPrice', String(filters.priceMax));
  if (filters.yearMin) params.set('minYear', String(filters.yearMin));
  if (filters.yearMax) params.set('maxYear', String(filters.yearMax));
  if (filters.mileageMin) params.set('minMileage', String(filters.mileageMin));
  if (filters.mileageMax) params.set('maxMileage', String(filters.mileageMax));
  if (filters.regions?.length) params.set('region', filters.regions.join(','));
  if (filters.fuelTypes?.length) params.set('fuelType', filters.fuelTypes[0]);
  if (filters.transmissions?.length) params.set('transmission', filters.transmissions[0]);
  if (filters.bodyTypes?.length) params.set('bodyType', filters.bodyTypes[0]);
  if (filters.sortBy) params.set('sort', filters.sortBy);

  return params;
}

/**
 * Hook for fetching and filtering listings from API
 */
export function useListings() {
  const [listings, setListings] = useState<ListingCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { filters } = useFilterStore();

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = buildQueryParams(filters);
      const response = await apiClient.get<ListingsResponse>(`/listings?${params.toString()}`);
      const cards = response.data.data.map(mapToListingCard);
      setListings(cards);
      setTotal(response.data.pagination.total);
    } catch (err: any) {
      console.error('Failed to fetch listings:', err);
      setError(err.message || 'Failed to load listings');
      setListings([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return {
    listings,
    isLoading,
    total,
    error,
    refetch: fetchListings,
  };
}

/**
 * Hook for fetching a single listing from API
 */
export function useListing(id: string) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      setIsError(true);
      return;
    }

    const fetchListing = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const response = await apiClient.get<ListingDetailResponse>(`/listings/${id}`);
        setListing(mapToListing(response.data));
      } catch (err) {
        console.error('Failed to fetch listing:', err);
        setIsError(true);
        setListing(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  return {
    listing,
    isLoading,
    isError,
  };
}

/**
 * Hook for getting similar listings from API
 */
export function useSimilarListings(listingId: string) {
  const [listings, setListings] = useState<ListingCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!listingId) {
      setIsLoading(false);
      return;
    }

    const fetchSimilar = async () => {
      setIsLoading(true);

      try {
        const response = await apiClient.get<ListingCardResponse[]>(`/listings/${listingId}/similar`);
        setListings(response.data.map(mapToListingCard));
      } catch (err) {
        console.error('Failed to fetch similar listings:', err);
        setListings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSimilar();
  }, [listingId]);

  return {
    listings,
    isLoading,
  };
}

interface FilterOptionsResponse {
  makes: { value: string; label: string; count: number }[];
  regions: { value: string; label: string; count: number }[];
  bodyTypes: { value: string; label: string; count: number }[];
  fuelTypes: { value: string; label: string; count: number }[];
  transmissions: { value: string; label: string; count: number }[];
  priceRange: { min: number; max: number };
  yearRange: { min: number; max: number };
  mileageRange: { min: number; max: number };
}

/**
 * Hook for getting filter options from API
 */
export function useFilterOptions(): { options: FilterOptions; isLoading: boolean } {
  const [options, setOptions] = useState<FilterOptions>({
    makes: [],
    models: {},
    regions: [],
    fuelTypes: [],
    transmissions: [],
    bodyTypes: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await apiClient.get<FilterOptionsResponse>('/filters/options');
        const data = response.data;

        // Map API response to FilterOptions format
        setOptions({
          makes: data.makes.map((m) => m.value),
          models: {}, // Backend doesn't return models per make yet
          regions: data.regions.map((r) => r.value),
          fuelTypes: data.fuelTypes.map((f) => f.value),
          transmissions: data.transmissions.map((t) => t.value),
          bodyTypes: data.bodyTypes.map((b) => b.value),
        });
      } catch (err) {
        console.error('Failed to fetch filter options:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, []);

  return {
    options,
    isLoading,
  };
}

/**
 * Helper to count active filters
 */
export function countActiveFilters(filters: ListingFilters): number {
  let count = 0;
  if (filters.keyword) count++;
  if (filters.makes?.length) count++;
  if (filters.models?.length) count++;
  if (filters.priceMin || filters.priceMax) count++;
  if (filters.yearMin || filters.yearMax) count++;
  if (filters.mileageMin || filters.mileageMax) count++;
  if (filters.regions?.length) count++;
  if (filters.fuelTypes?.length) count++;
  if (filters.transmissions?.length) count++;
  if (filters.bodyTypes?.length) count++;
  return count;
}
