import { useState, useMemo, useCallback } from 'react';
import { mockListings, mockListingCards, mockFilterOptions } from '@/mock/data';
import { useFilterStore } from '@/stores/filterStore';
import type { FilterOptions, ListingFilters } from '@/types';

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Hook for fetching and filtering listings
 */
export function useListings() {
  const [isLoading, setIsLoading] = useState(false);
  const { filters } = useFilterStore();

  const filteredListings = useMemo(() => {
    let results = [...mockListingCards];

    // Keyword search
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      results = results.filter((listing) =>
        listing.title.toLowerCase().includes(keyword) ||
        listing.location.toLowerCase().includes(keyword)
      );
    }

    // Make filter
    if (filters.makes?.length) {
      results = results.filter((listing) => {
        const make = listing.title.split(' ')[1]; // "2019 Toyota Corolla" -> "Toyota"
        return filters.makes!.includes(make);
      });
    }

    // Price range
    if (filters.priceMin) {
      results = results.filter((listing) => listing.price >= filters.priceMin!);
    }
    if (filters.priceMax) {
      results = results.filter((listing) => listing.price <= filters.priceMax!);
    }

    // Year range
    if (filters.yearMin) {
      results = results.filter((listing) => listing.year >= filters.yearMin!);
    }
    if (filters.yearMax) {
      results = results.filter((listing) => listing.year <= filters.yearMax!);
    }

    // Mileage range
    if (filters.mileageMin) {
      results = results.filter((listing) => listing.mileage >= filters.mileageMin!);
    }
    if (filters.mileageMax) {
      results = results.filter((listing) => listing.mileage <= filters.mileageMax!);
    }

    // Region filter
    if (filters.regions?.length) {
      results = results.filter((listing) => filters.regions!.includes(listing.location));
    }

    // Fuel type filter
    if (filters.fuelTypes?.length) {
      results = results.filter((listing) => filters.fuelTypes!.includes(listing.fuelType));
    }

    // Transmission filter
    if (filters.transmissions?.length) {
      results = results.filter((listing) => filters.transmissions!.includes(listing.transmission));
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price_asc':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'mileage_asc':
        results.sort((a, b) => a.mileage - b.mileage);
        break;
      case 'year_desc':
        results.sort((a, b) => b.year - a.year);
        break;
      case 'newest':
      default:
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return results;
  }, [filters]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    await delay(300); // Simulate network delay
    setIsLoading(false);
  }, []);

  return {
    listings: filteredListings,
    isLoading,
    total: filteredListings.length,
    refetch,
  };
}

/**
 * Hook for fetching a single listing
 */
export function useListing(id: string) {
  // For mock data, we directly return the listing synchronously
  const foundListing = mockListings.find((l) => l.id === id);

  return {
    listing: foundListing || null,
    isLoading: false,
    isError: !foundListing,
  };
}

/**
 * Hook for getting similar listings
 */
export function useSimilarListings(listingId: string) {
  const currentListing = mockListings.find((l) => l.id === listingId);

  const similarListings = useMemo(() => {
    if (!currentListing) return [];

    return mockListingCards
      .filter((l) => l.id !== listingId)
      .filter((l) => {
        const listing = mockListings.find((ml) => ml.id === l.id);
        return (
          listing?.make === currentListing.make ||
          listing?.bodyType === currentListing.bodyType ||
          Math.abs(listing!.price - currentListing.price) < 10000
        );
      })
      .slice(0, 4);
  }, [listingId, currentListing]);

  return {
    listings: similarListings,
    isLoading: false,
  };
}

/**
 * Hook for getting filter options
 */
export function useFilterOptions(): { options: FilterOptions; isLoading: boolean } {
  return {
    options: mockFilterOptions,
    isLoading: false,
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
