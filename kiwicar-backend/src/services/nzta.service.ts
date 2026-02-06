import { supabaseAdmin } from '@/config/supabase';
import { VehicleInfoRow, VehicleInfoResponse, OdometerReading } from '@/types';

// ---------------------------------------------------------------------------
// Known NZ plate mock data
// ---------------------------------------------------------------------------

interface MockVehicle {
  make: string;
  model: string;
  year: number;
  bodyStyle: string;
  color: string;
  engineCc: number;
  fuelType: string;
  wofExpiry: string;
  wofStatus: string;
  regoExpiry: string;
  regoStatus: string;
  firstRegistered: string;
  odometerReadings: OdometerReading[];
}

const KNOWN_PLATES: Record<string, MockVehicle> = {
  ABC123: {
    make: 'Toyota',
    model: 'Corolla',
    year: 2019,
    bodyStyle: 'Hatchback',
    color: 'Silver',
    engineCc: 1798,
    fuelType: 'PETROL',
    wofExpiry: '2025-08-15',
    wofStatus: 'CURRENT',
    regoExpiry: '2025-11-20',
    regoStatus: 'CURRENT',
    firstRegistered: '2019-03-10',
    odometerReadings: [
      { date: '2024-08-15', reading: 72000 },
      { date: '2023-08-10', reading: 58000 },
      { date: '2022-08-12', reading: 41000 },
    ],
  },
  XYZ789: {
    make: 'Mazda',
    model: 'CX-5',
    year: 2020,
    bodyStyle: 'SUV',
    color: 'Soul Red',
    engineCc: 2488,
    fuelType: 'PETROL',
    wofExpiry: '2025-10-01',
    wofStatus: 'CURRENT',
    regoExpiry: '2026-01-15',
    regoStatus: 'CURRENT',
    firstRegistered: '2020-06-22',
    odometerReadings: [
      { date: '2024-10-01', reading: 55000 },
      { date: '2023-10-05', reading: 40000 },
      { date: '2022-10-03', reading: 26000 },
    ],
  },
  DEF456: {
    make: 'Nissan',
    model: 'Leaf',
    year: 2021,
    bodyStyle: 'Hatchback',
    color: 'White',
    engineCc: 0,
    fuelType: 'ELECTRIC',
    wofExpiry: '2025-12-20',
    wofStatus: 'CURRENT',
    regoExpiry: '2026-03-01',
    regoStatus: 'CURRENT',
    firstRegistered: '2021-01-15',
    odometerReadings: [
      { date: '2024-12-20', reading: 38000 },
      { date: '2023-12-18', reading: 25000 },
    ],
  },
  GHI101: {
    make: 'Ford',
    model: 'Ranger',
    year: 2022,
    bodyStyle: 'Ute',
    color: 'Shadow Black',
    engineCc: 1996,
    fuelType: 'DIESEL',
    wofExpiry: '2025-09-30',
    wofStatus: 'CURRENT',
    regoExpiry: '2026-02-28',
    regoStatus: 'CURRENT',
    firstRegistered: '2022-04-05',
    odometerReadings: [
      { date: '2024-09-30', reading: 48000 },
      { date: '2023-09-28', reading: 29000 },
    ],
  },
  JKL202: {
    make: 'Honda',
    model: 'CR-V',
    year: 2018,
    bodyStyle: 'SUV',
    color: 'Modern Steel',
    engineCc: 1498,
    fuelType: 'PETROL',
    wofExpiry: '2025-06-10',
    wofStatus: 'CURRENT',
    regoExpiry: '2025-09-15',
    regoStatus: 'CURRENT',
    firstRegistered: '2018-07-20',
    odometerReadings: [
      { date: '2024-06-10', reading: 95000 },
      { date: '2023-06-08', reading: 80000 },
      { date: '2022-06-12', reading: 64000 },
      { date: '2021-06-05', reading: 48000 },
    ],
  },
  MNO303: {
    make: 'Subaru',
    model: 'Outback',
    year: 2021,
    bodyStyle: 'Wagon',
    color: 'Crystal White Pearl',
    engineCc: 2498,
    fuelType: 'PETROL',
    wofExpiry: '2025-11-05',
    wofStatus: 'CURRENT',
    regoExpiry: '2026-02-10',
    regoStatus: 'CURRENT',
    firstRegistered: '2021-05-18',
    odometerReadings: [
      { date: '2024-11-05', reading: 52000 },
      { date: '2023-11-02', reading: 36000 },
      { date: '2022-11-08', reading: 19000 },
    ],
  },
  PQR404: {
    make: 'Hyundai',
    model: 'Kona',
    year: 2023,
    bodyStyle: 'SUV',
    color: 'Surfy Blue',
    engineCc: 1999,
    fuelType: 'HYBRID',
    wofExpiry: '2026-03-15',
    wofStatus: 'CURRENT',
    regoExpiry: '2026-06-20',
    regoStatus: 'CURRENT',
    firstRegistered: '2023-03-25',
    odometerReadings: [
      { date: '2025-03-15', reading: 18000 },
      { date: '2024-03-12', reading: 8000 },
    ],
  },
  STU505: {
    make: 'Volkswagen',
    model: 'Golf',
    year: 2020,
    bodyStyle: 'Hatchback',
    color: 'Atlantic Blue',
    engineCc: 1395,
    fuelType: 'PETROL',
    wofExpiry: '2025-07-22',
    wofStatus: 'CURRENT',
    regoExpiry: '2025-10-30',
    regoStatus: 'CURRENT',
    firstRegistered: '2020-09-14',
    odometerReadings: [
      { date: '2024-07-22', reading: 62000 },
      { date: '2023-07-20', reading: 47000 },
      { date: '2022-07-25', reading: 31000 },
    ],
  },
  TEST001: {
    make: 'Honda',
    model: 'Civic',
    year: 2017,
    bodyStyle: 'Sedan',
    color: 'Lunar Silver',
    engineCc: 1799,
    fuelType: 'PETROL',
    wofExpiry: '2024-02-10',
    wofStatus: 'EXPIRED',
    regoExpiry: '2024-05-15',
    regoStatus: 'EXPIRED',
    firstRegistered: '2017-11-03',
    odometerReadings: [
      { date: '2023-02-10', reading: 128000 },
      { date: '2022-02-08', reading: 112000 },
      { date: '2021-02-12', reading: 95000 },
      { date: '2020-02-05', reading: 78000 },
    ],
  },
};

// ---------------------------------------------------------------------------
// Deterministic mock data generation for unknown plates
// ---------------------------------------------------------------------------

const MAKES_MODELS: [string, string][] = [
  ['Toyota', 'Camry'],
  ['Honda', 'Accord'],
  ['Mazda', 'Mazda3'],
  ['Nissan', 'X-Trail'],
  ['Mitsubishi', 'Outlander'],
  ['Suzuki', 'Swift'],
  ['Hyundai', 'Tucson'],
  ['Kia', 'Sportage'],
  ['Ford', 'Focus'],
  ['Volkswagen', 'Tiguan'],
  ['Subaru', 'Forester'],
  ['Toyota', 'RAV4'],
];

const BODY_STYLES = ['Sedan', 'SUV', 'Hatchback', 'Wagon', 'Ute'];
const COLORS = ['White', 'Silver', 'Black', 'Blue', 'Red', 'Grey', 'Green'];
const FUEL_TYPES = ['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC'];

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

function generateMockVehicle(plateNumber: string): MockVehicle {
  const hash = simpleHash(plateNumber);

  const [make, model] = MAKES_MODELS[hash % MAKES_MODELS.length];
  const year = 2014 + (hash % 11); // 2014-2024
  const bodyStyle = BODY_STYLES[(hash >> 4) % BODY_STYLES.length];
  const color = COLORS[(hash >> 8) % COLORS.length];
  const fuelType = FUEL_TYPES[(hash >> 12) % FUEL_TYPES.length];
  const engineCc = fuelType === 'ELECTRIC' ? 0 : [1298, 1498, 1798, 1998, 2488][(hash >> 16) % 5];

  const now = new Date();
  const wofMonthsAgo = (hash % 8) - 2; // -2 to 5 months ago -> some may be expired
  const wofExpiry = new Date(now);
  wofExpiry.setMonth(wofExpiry.getMonth() + wofMonthsAgo);
  const wofStatus = wofExpiry > now ? 'CURRENT' : 'EXPIRED';

  const regoExpiry = new Date(wofExpiry);
  regoExpiry.setMonth(regoExpiry.getMonth() + 3);
  const regoStatus = regoExpiry > now ? 'CURRENT' : 'EXPIRED';

  const firstRegistered = new Date(year, (hash % 12), 1 + (hash % 28));

  const currentOdo = 8000 + ((hash % 20) * 5000); // 8k-108k
  const readingsCount = 2 + (hash % 3); // 2-4 readings
  const odometerReadings: OdometerReading[] = [];
  for (let i = 0; i < readingsCount; i++) {
    const readingDate = new Date(now);
    readingDate.setFullYear(readingDate.getFullYear() - i);
    odometerReadings.push({
      date: readingDate.toISOString().split('T')[0],
      reading: Math.max(0, currentOdo - i * 14000),
    });
  }

  return {
    make,
    model,
    year,
    bodyStyle,
    color,
    engineCc,
    fuelType,
    wofExpiry: wofExpiry.toISOString().split('T')[0],
    wofStatus,
    regoExpiry: regoExpiry.toISOString().split('T')[0],
    regoStatus,
    firstRegistered: firstRegistered.toISOString().split('T')[0],
    odometerReadings,
  };
}

// ---------------------------------------------------------------------------
// Row <-> Response conversion helpers
// ---------------------------------------------------------------------------

function vehicleRowToResponse(row: VehicleInfoRow, cached: boolean): VehicleInfoResponse {
  return {
    plateNumber: row.plate_number,
    make: row.make,
    model: row.model,
    year: row.year,
    bodyStyle: row.body_style,
    color: row.color,
    engineCc: row.engine_cc,
    fuelType: row.fuel_type,
    wofStatus: row.wof_status,
    wofExpiry: row.wof_expiry,
    regoStatus: row.rego_status,
    regoExpiry: row.rego_expiry,
    firstRegistered: row.first_registered,
    odometerReadings: row.odometer_readings ?? [],
    cached,
    fetchedAt: row.fetched_at,
  };
}

function mockVehicleToRow(plateNumber: string, mock: MockVehicle): VehicleInfoRow {
  return {
    plate_number: plateNumber,
    make: mock.make,
    model: mock.model,
    year: mock.year,
    body_style: mock.bodyStyle,
    color: mock.color,
    engine_cc: mock.engineCc,
    fuel_type: mock.fuelType,
    wof_expiry: mock.wofExpiry,
    wof_status: mock.wofStatus,
    rego_expiry: mock.regoExpiry,
    rego_status: mock.regoStatus,
    first_registered: mock.firstRegistered,
    odometer_readings: mock.odometerReadings,
    fetched_at: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Main lookup function
// ---------------------------------------------------------------------------

export async function lookupVehicle(plateNumber: string): Promise<VehicleInfoResponse> {
  const plate = plateNumber.toUpperCase();

  // 1. Check Supabase cache (within 24 hours)
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: cached } = await supabaseAdmin
    .from('vehicle_info')
    .select('*')
    .eq('plate_number', plate)
    .gte('fetched_at', twentyFourHoursAgo)
    .single();

  if (cached) {
    return vehicleRowToResponse(cached as VehicleInfoRow, true);
  }

  // 2. Generate mock data (known plate or deterministic)
  const mockData = KNOWN_PLATES[plate] ?? generateMockVehicle(plate);
  const row = mockVehicleToRow(plate, mockData);

  // 3. Upsert into cache
  await supabaseAdmin
    .from('vehicle_info')
    .upsert(row, { onConflict: 'plate_number' });

  return vehicleRowToResponse(row, false);
}
