import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/api/client';
import { useAuthStore } from '@/stores/authStore';

interface FavoriteItem {
  id: string;
  listingId: string;
  listing: {
    id: string;
    title: string;
    price: number;
    coverImage: string | null;
    status: string;
  } | null;
  priceAlert: boolean;
  targetPrice: number | null;
  createdAt: string;
}

interface FavoritesResponse {
  data: FavoriteItem[];
}

/**
 * Hook for managing favorites
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuthStore();

  // Fetch all favorites
  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      setFavoriteIds(new Set());
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.get<FavoritesResponse>('/favorites');
      setFavorites(response.data.data);
      setFavoriteIds(new Set(response.data.data.map((f) => f.listingId)));
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Load favorites on mount and when auth changes
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Check if a listing is favorited
  const isFavorite = useCallback(
    (listingId: string) => favoriteIds.has(listingId),
    [favoriteIds]
  );

  // Add to favorites
  const addFavorite = useCallback(
    async (listingId: string) => {
      if (!isAuthenticated) {
        return { success: false, requiresAuth: true };
      }

      try {
        await apiClient.post('/favorites', { listingId });
        setFavoriteIds((prev) => new Set([...prev, listingId]));
        // Refresh full list
        fetchFavorites();
        return { success: true };
      } catch (err: any) {
        console.error('Failed to add favorite:', err);
        return {
          success: false,
          error: err.response?.data?.error?.message || 'Failed to save',
        };
      }
    },
    [isAuthenticated, fetchFavorites]
  );

  // Remove from favorites
  const removeFavorite = useCallback(
    async (listingId: string) => {
      if (!isAuthenticated) {
        return { success: false, requiresAuth: true };
      }

      try {
        await apiClient.delete(`/favorites/${listingId}`);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(listingId);
          return next;
        });
        setFavorites((prev) => prev.filter((f) => f.listingId !== listingId));
        return { success: true };
      } catch (err: any) {
        console.error('Failed to remove favorite:', err);
        return {
          success: false,
          error: err.response?.data?.error?.message || 'Failed to remove',
        };
      }
    },
    [isAuthenticated]
  );

  // Toggle favorite
  const toggleFavorite = useCallback(
    async (listingId: string) => {
      if (isFavorite(listingId)) {
        return removeFavorite(listingId);
      } else {
        return addFavorite(listingId);
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  );

  // Update price alert
  const updateAlert = useCallback(
    async (listingId: string, priceAlert: boolean, targetPrice?: number) => {
      if (!isAuthenticated) {
        return { success: false, requiresAuth: true };
      }

      try {
        await apiClient.put(`/favorites/${listingId}/alert`, {
          priceAlert,
          targetPrice: targetPrice ?? null,
        });
        fetchFavorites();
        return { success: true };
      } catch (err: any) {
        console.error('Failed to update alert:', err);
        return {
          success: false,
          error: err.response?.data?.error?.message || 'Failed to update',
        };
      }
    },
    [isAuthenticated, fetchFavorites]
  );

  return {
    favorites,
    favoriteIds,
    isLoading,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    updateAlert,
    refetch: fetchFavorites,
  };
}
