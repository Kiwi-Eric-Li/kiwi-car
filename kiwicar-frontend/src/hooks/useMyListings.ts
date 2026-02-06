import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/api/client';
import { useAuthStore } from '@/stores/authStore';

export interface MyListing {
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
  status: string;
  views: number;
}

interface MyListingsResponse {
  data: MyListing[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useMyListings() {
  const [listings, setListings] = useState<MyListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  const fetchListings = useCallback(async () => {
    if (!isAuthenticated) {
      setListings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<MyListingsResponse>('/listings/my');
      setListings(response.data.data);
    } catch (err: any) {
      console.error('Failed to fetch my listings:', err);
      setError(err.response?.data?.error?.message || 'Failed to load listings');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const updateStatus = useCallback(
    async (listingId: string, status: 'ACTIVE' | 'SOLD' | 'REMOVED') => {
      try {
        await apiClient.put(`/listings/${listingId}/status`, { status });
        // Update local state
        setListings((prev) =>
          prev.map((listing) =>
            listing.id === listingId ? { ...listing, status } : listing
          )
        );
        return { success: true };
      } catch (err: any) {
        console.error('Failed to update listing status:', err);
        return {
          success: false,
          error: err.response?.data?.error?.message || 'Failed to update status',
        };
      }
    },
    []
  );

  const deleteListing = useCallback(async (listingId: string) => {
    try {
      await apiClient.delete(`/listings/${listingId}`);
      // Remove from local state
      setListings((prev) => prev.filter((listing) => listing.id !== listingId));
      return { success: true };
    } catch (err: any) {
      console.error('Failed to delete listing:', err);
      return {
        success: false,
        error: err.response?.data?.error?.message || 'Failed to delete listing',
      };
    }
  }, []);

  // Filter listings by status
  const activeListings = listings.filter((l) => l.status === 'ACTIVE');
  const soldListings = listings.filter((l) => l.status === 'SOLD');
  const draftListings = listings.filter((l) => l.status === 'DRAFT');

  return {
    listings,
    activeListings,
    soldListings,
    draftListings,
    isLoading,
    error,
    updateStatus,
    deleteListing,
    refetch: fetchListings,
  };
}
