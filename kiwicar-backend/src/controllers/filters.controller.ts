import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '@/config/supabase';

export async function getFilterOptions(_req: Request, res: Response, _next: NextFunction) {
  // Fetch all active listings to compute filter options
  const { data: listings, error } = await supabaseAdmin
    .from('listings')
    .select('make, region, body_type, fuel_type, transmission, price, year, mileage')
    .eq('status', 'ACTIVE');

  if (error) throw error;

  const rows = listings ?? [];

  // Count occurrences
  const makeCounts = new Map<string, number>();
  const regionCounts = new Map<string, number>();
  const bodyTypeCounts = new Map<string, number>();
  const fuelTypeCounts = new Map<string, number>();
  const transmissionCounts = new Map<string, number>();

  let priceMin = Infinity, priceMax = -Infinity;
  let yearMin = Infinity, yearMax = -Infinity;
  let mileageMin = Infinity, mileageMax = -Infinity;

  for (const row of rows) {
    makeCounts.set(row.make, (makeCounts.get(row.make) ?? 0) + 1);
    regionCounts.set(row.region, (regionCounts.get(row.region) ?? 0) + 1);
    bodyTypeCounts.set(row.body_type, (bodyTypeCounts.get(row.body_type) ?? 0) + 1);
    fuelTypeCounts.set(row.fuel_type, (fuelTypeCounts.get(row.fuel_type) ?? 0) + 1);
    transmissionCounts.set(row.transmission, (transmissionCounts.get(row.transmission) ?? 0) + 1);

    if (row.price < priceMin) priceMin = row.price;
    if (row.price > priceMax) priceMax = row.price;
    if (row.year < yearMin) yearMin = row.year;
    if (row.year > yearMax) yearMax = row.year;
    if (row.mileage < mileageMin) mileageMin = row.mileage;
    if (row.mileage > mileageMax) mileageMax = row.mileage;
  }

  function toOptions(map: Map<string, number>) {
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({ value, label: value, count }));
  }

  res.json({
    makes: toOptions(makeCounts),
    regions: toOptions(regionCounts),
    bodyTypes: toOptions(bodyTypeCounts),
    fuelTypes: toOptions(fuelTypeCounts),
    transmissions: toOptions(transmissionCounts),
    priceRange: { min: priceMin === Infinity ? 0 : priceMin, max: priceMax === -Infinity ? 0 : priceMax },
    yearRange: { min: yearMin === Infinity ? 1990 : yearMin, max: yearMax === -Infinity ? new Date().getFullYear() : yearMax },
    mileageRange: { min: mileageMin === Infinity ? 0 : mileageMin, max: mileageMax === -Infinity ? 0 : mileageMax },
  });
}
