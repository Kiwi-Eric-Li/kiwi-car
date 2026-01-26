import { useState, useCallback } from 'react';
import { mockVehicleLookup } from '@/mock/data';
import { useAuthStore } from '@/stores/authStore';
import type { VehicleInfo } from '@/types';
import { formatPlate } from '@/utils/format';

const GUEST_LIMIT = 3;
const AUTH_LIMIT = 10;
const STORAGE_KEY = 'kiwicar-lookup-count';

interface LookupQuota {
  used: number;
  limit: number;
  remaining: number;
}

function getStoredCount(): number {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (!stored) return 0;

  try {
    const data = JSON.parse(stored);
    const today = new Date().toDateString();
    if (data.date === today) {
      return data.count;
    }
    return 0;
  } catch {
    return 0;
  }
}

function incrementCount(): void {
  const count = getStoredCount() + 1;
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      date: new Date().toDateString(),
      count,
    })
  );
}

/**
 * Hook for vehicle plate lookup
 */
export function useVehicleLookup() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vehicle, setVehicle] = useState<VehicleInfo | null>(null);
  const { isAuthenticated } = useAuthStore();

  const limit = isAuthenticated ? AUTH_LIMIT : GUEST_LIMIT;
  const used = getStoredCount();
  const remaining = Math.max(0, limit - used);

  const lookup = useCallback(
    async (plate: string): Promise<VehicleInfo | null> => {
      setError(null);
      setVehicle(null);

      // Check quota
      if (remaining <= 0) {
        setError(
          isAuthenticated
            ? 'You have reached your daily lookup limit. Please try again tomorrow.'
            : 'You have reached your daily lookup limit. Sign in for more lookups.'
        );
        return null;
      }

      const formattedPlate = formatPlate(plate);
      setIsLoading(true);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Look up in mock data
      const found = mockVehicleLookup[formattedPlate];

      if (found) {
        incrementCount();
        setVehicle(found);
        setIsLoading(false);
        return found;
      } else {
        // For demo purposes, generate mock data for any valid plate
        const mockVehicle: VehicleInfo = {
          plate: formattedPlate,
          make: 'Unknown',
          model: 'Model',
          year: 2020,
          bodyType: 'Sedan',
          fuelType: 'Petrol',
          color: 'Silver',
          wofStatus: 'current',
          wofExpiry: '2025-12-01',
          regoStatus: 'current',
          regoExpiry: '2025-10-15',
          firstRegisteredNZ: '2020-01-15',
          odometerHistory: [
            { date: '2024-12-01', reading: 50000, source: 'WOF Inspection' },
          ],
        };
        incrementCount();
        setVehicle(mockVehicle);
        setIsLoading(false);
        return mockVehicle;
      }
    },
    [remaining, isAuthenticated]
  );

  const reset = useCallback(() => {
    setVehicle(null);
    setError(null);
  }, []);

  const quota: LookupQuota = {
    used,
    limit,
    remaining,
  };

  return {
    lookup,
    reset,
    vehicle,
    isLoading,
    error,
    quota,
  };
}
