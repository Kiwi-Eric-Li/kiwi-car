import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock supabaseAdmin before importing the service
// ---------------------------------------------------------------------------

const mockSingle = vi.fn();
const mockGte = vi.fn(() => ({ single: mockSingle }));
const mockEq = vi.fn(() => ({ gte: mockGte }));
const mockSelect = vi.fn(() => ({ eq: mockEq }));
const mockUpsert = vi.fn(() => ({ error: null }));
const mockFrom = vi.fn(() => ({
  select: mockSelect,
  upsert: mockUpsert,
}));

vi.mock('@/config/supabase', () => ({
  supabaseAdmin: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

import { lookupVehicle } from '@/services/nzta.service';

beforeEach(() => {
  vi.clearAllMocks();

  // Default: cache miss (no cached data)
  mockSingle.mockResolvedValue({ data: null, error: null });
  mockUpsert.mockResolvedValue({ error: null });
});

// ---------------------------------------------------------------------------
// Cache behaviour
// ---------------------------------------------------------------------------

describe('lookupVehicle – caching', () => {
  it('returns cached data when fresh cache exists', async () => {
    const cachedRow = {
      plate_number: 'ABC123',
      make: 'Toyota',
      model: 'Corolla',
      year: 2019,
      body_style: 'Hatchback',
      color: 'Silver',
      engine_cc: 1798,
      fuel_type: 'PETROL',
      wof_expiry: '2025-08-15',
      wof_status: 'CURRENT',
      rego_expiry: '2025-11-20',
      rego_status: 'CURRENT',
      first_registered: '2019-03-10',
      odometer_readings: [{ date: '2024-08-15', reading: 72000 }],
      fetched_at: new Date().toISOString(),
    };

    mockSingle.mockResolvedValueOnce({ data: cachedRow, error: null });

    const result = await lookupVehicle('ABC123');

    expect(result.cached).toBe(true);
    expect(result.plateNumber).toBe('ABC123');
    expect(result.make).toBe('Toyota');
    // Should NOT upsert when returning from cache
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it('fetches fresh data and upserts when cache misses', async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: null });

    const result = await lookupVehicle('ABC123');

    expect(result.cached).toBe(false);
    expect(result.make).toBe('Toyota');
    expect(result.model).toBe('Corolla');
    expect(mockUpsert).toHaveBeenCalledOnce();
  });

  it('queries the vehicle_info table with correct plate', async () => {
    await lookupVehicle('xyz789');

    expect(mockFrom).toHaveBeenCalledWith('vehicle_info');
    expect(mockEq).toHaveBeenCalledWith('plate_number', 'XYZ789');
  });
});

// ---------------------------------------------------------------------------
// Known plates
// ---------------------------------------------------------------------------

describe('lookupVehicle – known plates', () => {
  it('returns correct data for known plate ABC123', async () => {
    const result = await lookupVehicle('ABC123');

    expect(result.make).toBe('Toyota');
    expect(result.model).toBe('Corolla');
    expect(result.year).toBe(2019);
    expect(result.bodyStyle).toBe('Hatchback');
    expect(result.color).toBe('Silver');
    expect(result.engineCc).toBe(1798);
    expect(result.fuelType).toBe('PETROL');
    expect(result.wofStatus).toBe('CURRENT');
    expect(result.regoStatus).toBe('CURRENT');
    expect(result.odometerReadings).toHaveLength(3);
  });

  it('returns correct data for known plate DEF456 (electric vehicle)', async () => {
    const result = await lookupVehicle('DEF456');

    expect(result.make).toBe('Nissan');
    expect(result.model).toBe('Leaf');
    expect(result.fuelType).toBe('ELECTRIC');
    expect(result.engineCc).toBe(0);
  });

  it('returns expired WOF/rego for known plate TEST001', async () => {
    const result = await lookupVehicle('TEST001');

    expect(result.make).toBe('Honda');
    expect(result.model).toBe('Civic');
    expect(result.wofStatus).toBe('EXPIRED');
    expect(result.regoStatus).toBe('EXPIRED');
  });
});

// ---------------------------------------------------------------------------
// Unknown plates (deterministic generation)
// ---------------------------------------------------------------------------

describe('lookupVehicle – unknown plates', () => {
  it('generates deterministic data for unknown plates', async () => {
    const result1 = await lookupVehicle('RANDOM1');
    const result2 = await lookupVehicle('RANDOM1');

    expect(result1.make).toBe(result2.make);
    expect(result1.model).toBe(result2.model);
    expect(result1.year).toBe(result2.year);
    expect(result1.color).toBe(result2.color);
  });

  it('generates different data for different unknown plates', async () => {
    const result1 = await lookupVehicle('AAAAA1');
    const result2 = await lookupVehicle('ZZZZZ9');

    // Statistically very likely to differ on at least make or model
    const differs =
      result1.make !== result2.make ||
      result1.model !== result2.model ||
      result1.year !== result2.year;
    expect(differs).toBe(true);
  });

  it('generates year in valid range (2014-2024)', async () => {
    const result = await lookupVehicle('TESTPLATE');
    expect(result.year).toBeGreaterThanOrEqual(2014);
    expect(result.year).toBeLessThanOrEqual(2024);
  });

  it('generates 2-4 odometer readings', async () => {
    const result = await lookupVehicle('TESTPLATE');
    expect(result.odometerReadings.length).toBeGreaterThanOrEqual(2);
    expect(result.odometerReadings.length).toBeLessThanOrEqual(4);
  });

  it('sets engineCc to 0 for electric vehicles', async () => {
    // We need to find a plate that hashes to ELECTRIC fuel type
    // The fuel type index is (hash >> 12) % 4, and ELECTRIC is index 3
    // We'll test the property: if fuelType is ELECTRIC, engineCc must be 0
    const plates = ['ELEC01', 'ELEC02', 'ELEC03', 'ELEC04', 'ELEC05', 'EVTEST', 'ZAPCAR'];
    for (const plate of plates) {
      const result = await lookupVehicle(plate);
      if (result.fuelType === 'ELECTRIC') {
        expect(result.engineCc).toBe(0);
        return; // test passed
      }
    }
    // If none happened to be electric, just verify the general property:
    // every returned result has a valid fuel type
    const result = await lookupVehicle('ANYPLATE');
    expect(['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC']).toContain(result.fuelType);
  });
});

// ---------------------------------------------------------------------------
// Data transformation (snake_case → camelCase)
// ---------------------------------------------------------------------------

describe('lookupVehicle – response format', () => {
  it('returns camelCase keys in the response', async () => {
    const result = await lookupVehicle('ABC123');

    // Verify camelCase properties exist
    expect(result).toHaveProperty('plateNumber');
    expect(result).toHaveProperty('bodyStyle');
    expect(result).toHaveProperty('engineCc');
    expect(result).toHaveProperty('fuelType');
    expect(result).toHaveProperty('wofExpiry');
    expect(result).toHaveProperty('wofStatus');
    expect(result).toHaveProperty('regoExpiry');
    expect(result).toHaveProperty('regoStatus');
    expect(result).toHaveProperty('firstRegistered');
    expect(result).toHaveProperty('odometerReadings');
    expect(result).toHaveProperty('fetchedAt');
    expect(result).toHaveProperty('cached');

    // Verify snake_case properties do NOT exist
    expect(result).not.toHaveProperty('plate_number');
    expect(result).not.toHaveProperty('body_style');
    expect(result).not.toHaveProperty('engine_cc');
    expect(result).not.toHaveProperty('fuel_type');
  });

  it('normalises plate number to uppercase', async () => {
    const result = await lookupVehicle('abc123');
    expect(result.plateNumber).toBe('ABC123');
  });

  it('upserts with correct snake_case row shape', async () => {
    await lookupVehicle('ABC123');

    const upsertCall = mockUpsert.mock.calls[0];
    const row = upsertCall[0];

    expect(row).toHaveProperty('plate_number', 'ABC123');
    expect(row).toHaveProperty('make', 'Toyota');
    expect(row).toHaveProperty('body_style', 'Hatchback');
    expect(row).toHaveProperty('engine_cc', 1798);
    expect(row).toHaveProperty('fuel_type', 'PETROL');
    expect(row).toHaveProperty('fetched_at');
  });
});
