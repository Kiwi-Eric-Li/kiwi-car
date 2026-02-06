import { PriceEstimateResponse } from '@/types';

// ---------------------------------------------------------------------------
// Generate Description
// ---------------------------------------------------------------------------

interface GenerateDescriptionParams {
  make: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  color: string;
  bodyType: string;
  wofExpiry?: string;
  regoExpiry?: string;
}

const DESCRIPTION_TEMPLATES = [
  (v: GenerateDescriptionParams) =>
    `This well-maintained ${v.year} ${v.make} ${v.model} is a fantastic option for Kiwi drivers looking for a reliable ${v.bodyType.toLowerCase()}. Finished in ${v.color}, this ${v.fuelType.toLowerCase()}-powered vehicle comes with a ${v.transmission.toLowerCase()} transmission and has covered ${v.mileage.toLocaleString()} km since new.

The vehicle has been regularly serviced in New Zealand${v.wofExpiry ? ` and comes with a current WOF valid until ${v.wofExpiry}` : ''}${v.regoExpiry ? `, with registration through to ${v.regoExpiry}` : ''}. All km are genuine and backed by a full odometer history.

Don't miss out on this excellent ${v.make} ${v.model} -- perfect for the daily commute or weekend adventures across Aotearoa. Contact the seller today to arrange a viewing.`,

  (v: GenerateDescriptionParams) =>
    `Up for sale is my ${v.year} ${v.make} ${v.model} in ${v.color}. This ${v.bodyType.toLowerCase()} has done ${v.mileage.toLocaleString()} km and runs on ${v.fuelType.toLowerCase()} with a ${v.transmission.toLowerCase()} gearbox. It's been a great car and I'm only selling because I'm upgrading.

${v.wofExpiry ? `WOF is current until ${v.wofExpiry}` : 'WOF will need to be renewed'}${v.regoExpiry ? ` and rego runs through ${v.regoExpiry}` : ''}. The car has been well looked after with regular services at a local NZ workshop. All maintenance records available on request.

This ${v.make} ${v.model} is ready to go -- just hop in and drive. Great value for money in the current NZ market. Happy to arrange an inspection or test drive at a time that suits you.`,

  (v: GenerateDescriptionParams) =>
    `Presenting this smart ${v.color} ${v.year} ${v.make} ${v.model} ${v.bodyType.toLowerCase()} with only ${v.mileage.toLocaleString()} km on the clock. Powered by a ${v.fuelType.toLowerCase()} engine paired with a smooth ${v.transmission.toLowerCase()} transmission, this vehicle delivers an excellent driving experience on New Zealand roads.

${v.wofExpiry ? `Current WOF through to ${v.wofExpiry}. ` : ''}${v.regoExpiry ? `Registration valid until ${v.regoExpiry}. ` : ''}Full odometer history is available to verify the genuine km reading. The vehicle has been NZ-owned and driven, with no import damage or issues.

Whether you're navigating Auckland traffic or heading south for a road trip, this ${v.make} ${v.model} won't disappoint. Viewings welcome -- get in touch to book a time that works for you.`,

  (v: GenerateDescriptionParams) =>
    `Looking for a dependable ${v.bodyType.toLowerCase()}? This ${v.year} ${v.make} ${v.model} could be exactly what you need. With ${v.mileage.toLocaleString()} km travelled, it's got plenty of life left in it. The ${v.color} exterior is in good condition and the ${v.transmission.toLowerCase()} ${v.fuelType.toLowerCase()} drivetrain is smooth and responsive.

${v.wofExpiry ? `WOF: Valid until ${v.wofExpiry}. ` : ''}${v.regoExpiry ? `Rego: Current through ${v.regoExpiry}. ` : ''}This vehicle has a clean NZ history and has been kept in excellent mechanical condition. All servicing is up to date as per the manufacturer's schedule.

The ${v.make} ${v.model} is one of the most popular models on Kiwi roads for good reason -- it's reliable, economical, and holds its value well. Come and see it for yourself!`,
];

export async function generateDescription(params: GenerateDescriptionParams): Promise<string> {
  // Simulate API latency
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Pick a template deterministically based on vehicle data
  const hash = (params.make.length + params.model.length + params.year + params.mileage) % DESCRIPTION_TEMPLATES.length;
  const template = DESCRIPTION_TEMPLATES[hash];

  return template(params);
}

// ---------------------------------------------------------------------------
// Price Estimate
// ---------------------------------------------------------------------------

interface PriceEstimateParams {
  make: string;
  model: string;
  year: number;
  mileage: number;
  region?: string;
  fuelType?: string;
  transmission?: string;
}

// Base prices for common NZ models (approximate NZD for a mid-range recent year)
const BASE_PRICES: Record<string, Record<string, number>> = {
  Toyota: {
    Corolla: 28000,
    Camry: 35000,
    RAV4: 42000,
    Hilux: 52000,
    Yaris: 22000,
  },
  Honda: {
    Civic: 30000,
    'CR-V': 38000,
    Accord: 34000,
    Jazz: 22000,
    'HR-V': 33000,
  },
  Mazda: {
    Mazda3: 30000,
    'CX-5': 40000,
    'CX-3': 30000,
    Mazda2: 22000,
  },
  Nissan: {
    'X-Trail': 36000,
    Qashqai: 33000,
    Leaf: 35000,
    Navara: 48000,
  },
  Ford: {
    Ranger: 55000,
    Focus: 28000,
    Escape: 35000,
  },
  Hyundai: {
    Tucson: 38000,
    Kona: 35000,
    i30: 28000,
  },
  Kia: {
    Sportage: 38000,
    Seltos: 34000,
    Cerato: 28000,
  },
  Volkswagen: {
    Golf: 35000,
    Tiguan: 42000,
    Polo: 26000,
  },
  Subaru: {
    Outback: 42000,
    Forester: 40000,
    Impreza: 28000,
    XV: 35000,
  },
  Mitsubishi: {
    Outlander: 38000,
    'ASX': 30000,
    Triton: 48000,
  },
  Suzuki: {
    Swift: 22000,
    Vitara: 30000,
    Jimny: 32000,
  },
};

const DEFAULT_BASE_PRICE = 30000;
const REFERENCE_YEAR = 2024;
const DEPRECIATION_RATE = 0.05; // 5% per year
const MILEAGE_THRESHOLD = 50000;
const MILEAGE_PENALTY_PER_KM = 0.05; // $0.05 per km over threshold

function getBasePrice(make: string, model: string): number {
  const makeEntry = BASE_PRICES[make];
  if (makeEntry) {
    const modelPrice = makeEntry[model];
    if (modelPrice) return modelPrice;
  }
  return DEFAULT_BASE_PRICE;
}

export async function getPriceEstimate(params: PriceEstimateParams): Promise<PriceEstimateResponse> {
  // Simulate API latency
  await new Promise((resolve) => setTimeout(resolve, 300));

  const basePrice = getBasePrice(params.make, params.model);
  const factors: { factor: string; impact: string }[] = [];

  let adjustedPrice = basePrice;

  // Year depreciation: -5% per year from reference year
  const yearDiff = REFERENCE_YEAR - params.year;
  if (yearDiff > 0) {
    const yearDepreciation = adjustedPrice * DEPRECIATION_RATE * yearDiff;
    adjustedPrice -= yearDepreciation;
    factors.push({
      factor: `Age (${yearDiff} years from ${REFERENCE_YEAR})`,
      impact: `-$${Math.round(yearDepreciation).toLocaleString()}`,
    });
  } else if (yearDiff < 0) {
    // Newer than reference, slight premium
    const yearPremium = adjustedPrice * 0.03 * Math.abs(yearDiff);
    adjustedPrice += yearPremium;
    factors.push({
      factor: `Newer model (${params.year})`,
      impact: `+$${Math.round(yearPremium).toLocaleString()}`,
    });
  }

  // Mileage adjustment: -$0.05/km over 50,000 km
  if (params.mileage > MILEAGE_THRESHOLD) {
    const excessKm = params.mileage - MILEAGE_THRESHOLD;
    const mileagePenalty = excessKm * MILEAGE_PENALTY_PER_KM;
    adjustedPrice -= mileagePenalty;
    factors.push({
      factor: `High mileage (${params.mileage.toLocaleString()} km)`,
      impact: `-$${Math.round(mileagePenalty).toLocaleString()}`,
    });
  } else {
    const bonusKm = MILEAGE_THRESHOLD - params.mileage;
    const mileageBonus = bonusKm * 0.02;
    adjustedPrice += mileageBonus;
    factors.push({
      factor: `Low mileage (${params.mileage.toLocaleString()} km)`,
      impact: `+$${Math.round(mileageBonus).toLocaleString()}`,
    });
  }

  // Region premium
  if (params.region) {
    const regionPremiums: Record<string, number> = {
      Auckland: 0.05,
      Wellington: 0.03,
      Canterbury: 0.01,
      Otago: 0.0,
      Waikato: 0.01,
    };
    const premium = regionPremiums[params.region] ?? 0;
    if (premium !== 0) {
      const regionAdjustment = adjustedPrice * premium;
      adjustedPrice += regionAdjustment;
      factors.push({
        factor: `${params.region} market premium`,
        impact: `+${(premium * 100).toFixed(0)}% (+$${Math.round(regionAdjustment).toLocaleString()})`,
      });
    }
  }

  // Fuel type adjustment
  if (params.fuelType) {
    const fuelAdjustments: Record<string, number> = {
      ELECTRIC: 0.10,
      HYBRID: 0.05,
      DIESEL: -0.02,
      PETROL: 0,
      OTHER: -0.03,
    };
    const fuelAdj = fuelAdjustments[params.fuelType] ?? 0;
    if (fuelAdj !== 0) {
      const fuelAdjustment = adjustedPrice * fuelAdj;
      adjustedPrice += fuelAdjustment;
      const sign = fuelAdj > 0 ? '+' : '-';
      factors.push({
        factor: `${params.fuelType.charAt(0) + params.fuelType.slice(1).toLowerCase()} fuel type`,
        impact: `${sign}${Math.abs(fuelAdj * 100).toFixed(0)}% (${sign}$${Math.round(Math.abs(fuelAdjustment)).toLocaleString()})`,
      });
    }
  }

  // Ensure price doesn't go below a floor
  adjustedPrice = Math.max(adjustedPrice, 1500);

  const priceRecommended = Math.round(adjustedPrice);
  const priceMin = Math.round(adjustedPrice * 0.85);
  const priceMax = Math.round(adjustedPrice * 1.15);

  // Confidence based on whether we have a known base price
  const hasKnownBase = BASE_PRICES[params.make]?.[params.model] !== undefined;
  const confidence = hasKnownBase ? 0.82 : 0.65;

  // Mock market comparison
  const similarListings = 5 + (simpleHash(params.make + params.model) % 20);
  const averagePrice = Math.round(priceRecommended * (0.95 + Math.random() * 0.1));
  const medianPrice = Math.round(priceRecommended * (0.97 + Math.random() * 0.06));

  return {
    priceMin,
    priceMax,
    priceRecommended,
    confidence,
    factors,
    marketComparison: {
      similarListings,
      averagePrice,
      medianPrice,
    },
  };
}

// Simple hash helper (same logic as nzta.service.ts)
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}
