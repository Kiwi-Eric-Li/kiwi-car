import { apiClient } from './client';
import type { PriceScoreResponse } from '@/types';

interface PriceScoreParams {
  price: number;
  make: string;
  model: string;
  year: number;
  mileage: number;
  region?: string;
  fuelType?: string;
  transmission?: string;
}

export async function getPriceScore(params: PriceScoreParams): Promise<PriceScoreResponse> {
  const response = await apiClient.post<{ data: PriceScoreResponse }>('/ai/price-estimate', params);
  return response.data.data;
}
