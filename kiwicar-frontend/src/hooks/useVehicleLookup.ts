import { useState, useCallback } from 'react';
import { apiClient } from '@/api/client';
import { useAuthStore } from '@/stores/authStore';
import type { VehicleInfo } from '@/types';
import { formatPlate } from '@/utils/format';

const GUEST_LIMIT = 3;
const AUTH_LIMIT = 10;

interface LookupQuota {
  used: number;
  limit: number;
  remaining: number;
}

interface VehicleInfoResponse {
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
  odometerReadings: { date: string; reading: number }[] | null;
  cached: boolean;
  fetchedAt: string;
}

function mapToVehicleInfo(data: VehicleInfoResponse): VehicleInfo {
  return {
    plate: data.plateNumber,
    make: data.make,
    model: data.model,
    year: data.year,
    bodyType: data.bodyStyle || 'Unknown',
    fuelType: data.fuelType || 'Unknown',
    color: data.color || 'Unknown',
    wofStatus: (data.wofStatus?.toLowerCase() === 'current' ? 'current' :
                data.wofStatus?.toLowerCase() === 'expired' ? 'expired' : 'unknown') as 'current' | 'expired' | 'unknown',
    wofExpiry: data.wofExpiry || undefined,
    regoStatus: (data.regoStatus?.toLowerCase() === 'current' ? 'current' :
                 data.regoStatus?.toLowerCase() === 'expired' ? 'expired' : 'unknown') as 'current' | 'expired' | 'unknown',
    regoExpiry: data.regoExpiry || undefined,
    firstRegisteredNZ: data.firstRegistered || undefined,
    odometerHistory: data.odometerReadings?.map((r) => ({
      date: r.date,
      reading: r.reading,
      source: 'WOF Inspection',
    })) || [],
  };
}

/**
 * Hook for vehicle plate lookup via API
 */
export function useVehicleLookup() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vehicle, setVehicle] = useState<VehicleInfo | null>(null);
  const [quota, setQuota] = useState<LookupQuota>({ used: 0, limit: GUEST_LIMIT, remaining: GUEST_LIMIT });
  const { isAuthenticated } = useAuthStore();

  // Update quota limits based on auth status
  const limit = isAuthenticated ? AUTH_LIMIT : GUEST_LIMIT;

  const lookup = useCallback(
    async (plate: string): Promise<VehicleInfo | null> => {
      setError(null);
      setVehicle(null);

      const formattedPlate = formatPlate(plate);

      if (!formattedPlate || formattedPlate.length < 2) {
        setError('Please enter a valid plate number');
        return null;
      }

      setIsLoading(true);

      try {
        const response = await apiClient.get<VehicleInfoResponse>(`/vehicles/${formattedPlate}`);
        const vehicleInfo = mapToVehicleInfo(response.data);
        setVehicle(vehicleInfo);

        // Update local quota tracking
        setQuota((prev) => ({
          ...prev,
          used: prev.used + 1,
          remaining: Math.max(0, prev.remaining - 1),
        }));

        return vehicleInfo;
      } catch (err: any) {
        console.error('Vehicle lookup failed:', err);

        // Handle rate limit error
        if (err.response?.status === 429) {
          const message = isAuthenticated
            ? 'You have reached your daily lookup limit. Please try again tomorrow.'
            : 'You have reached your daily lookup limit. Sign in for more lookups.';
          setError(message);
          setQuota((prev) => ({ ...prev, remaining: 0 }));
        } else if (err.response?.data?.error?.message) {
          setError(err.response.data.error.message);
        } else {
          setError('Failed to lookup vehicle. Please try again.');
        }

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  const reset = useCallback(() => {
    setVehicle(null);
    setError(null);
  }, []);

  return {
    lookup,
    reset,
    vehicle,
    isLoading,
    error,
    quota: {
      ...quota,
      limit,
    },
  };
}
