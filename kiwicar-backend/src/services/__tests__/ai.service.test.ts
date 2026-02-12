import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateDescription, getPriceEstimateFallback, getPriceScore, getPriceScoreFallback } from '@/services/ai.service';

// Mock the OpenAI client
vi.mock('@/config/openai', () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  },
}));

// Mock env — default to 'mock' so fallback tests work unchanged
vi.mock('@/config/env', () => ({
  env: {
    OPENAI_API_KEY: 'mock',
    LOG_LEVEL: 'silent',
    NODE_ENV: 'test',
  },
}));

// Mock logger to avoid console noise in tests
vi.mock('@/utils/logger', () => ({
  default: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

import { openai } from '@/config/openai';
import { env } from '@/config/env';

const mockCreate = openai.chat.completions.create as ReturnType<typeof vi.fn>;

// ---------------------------------------------------------------------------
// generateDescription
// ---------------------------------------------------------------------------

describe('generateDescription', () => {
  const baseParams = {
    make: 'Toyota',
    model: 'Corolla',
    year: 2020,
    mileage: 45000,
    fuelType: 'PETROL',
    transmission: 'AUTOMATIC',
    color: 'Silver',
    bodyType: 'Sedan',
  };

  it('returns a non-empty description string', async () => {
    const result = await generateDescription(baseParams);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(100);
  });

  it('includes vehicle details in the description', async () => {
    const result = await generateDescription(baseParams);
    expect(result).toContain('Toyota');
    expect(result).toContain('Corolla');
    expect(result).toContain('2020');
    expect(result).toContain('Silver');
    expect(result).toContain('45,000');
  });

  it('includes WOF and rego dates when provided', async () => {
    const result = await generateDescription({
      ...baseParams,
      wofExpiry: '2026-06-15',
      regoExpiry: '2026-08-20',
    });
    expect(result).toContain('2026-06-15');
    expect(result).toContain('2026-08-20');
  });

  it('is deterministic — same input always yields same output', async () => {
    const result1 = await generateDescription(baseParams);
    const result2 = await generateDescription(baseParams);
    expect(result1).toBe(result2);
  });

  it('selects different templates for different vehicles', async () => {
    const result1 = await generateDescription(baseParams);
    const result2 = await generateDescription({
      ...baseParams,
      make: 'Honda',
      model: 'Civic',
      year: 2018,
      mileage: 80000,
    });
    expect(result1).not.toBe(result2);
  });
});

// ---------------------------------------------------------------------------
// getPriceEstimateFallback (rule-based, used internally by scoring fallback)
// ---------------------------------------------------------------------------

describe('getPriceEstimateFallback', () => {
  it('uses known base price for Toyota Corolla', async () => {
    const result = await getPriceEstimateFallback({
      make: 'Toyota',
      model: 'Corolla',
      year: 2024,
      mileage: 50000,
    });
    expect(result.priceRecommended).toBe(28000);
    expect(result.confidence).toBe(0.82);
  });

  it('falls back to default base price for unknown make/model', async () => {
    const result = await getPriceEstimateFallback({
      make: 'Geely',
      model: 'Coolray',
      year: 2024,
      mileage: 50000,
    });
    expect(result.priceRecommended).toBe(30000);
    expect(result.confidence).toBe(0.65);
  });

  it('applies 5% depreciation per year for older vehicles', async () => {
    const result = await getPriceEstimateFallback({
      make: 'Toyota',
      model: 'Corolla',
      year: 2022,
      mileage: 50000,
    });
    expect(result.priceRecommended).toBe(25200);
  });

  it('applies 3% premium per year for newer vehicles', async () => {
    const result = await getPriceEstimateFallback({
      make: 'Toyota',
      model: 'Corolla',
      year: 2026,
      mileage: 50000,
    });
    expect(result.priceRecommended).toBe(29680);
  });

  it('penalises high mileage ($0.05/km over 50k)', async () => {
    const result = await getPriceEstimateFallback({
      make: 'Toyota',
      model: 'Corolla',
      year: 2024,
      mileage: 100000,
    });
    expect(result.priceRecommended).toBe(25500);
  });

  it('rewards low mileage ($0.02/km under 50k)', async () => {
    const result = await getPriceEstimateFallback({
      make: 'Toyota',
      model: 'Corolla',
      year: 2024,
      mileage: 10000,
    });
    expect(result.priceRecommended).toBe(28800);
  });

  it('applies Auckland 5% region premium', async () => {
    const result = await getPriceEstimateFallback({
      make: 'Toyota',
      model: 'Corolla',
      year: 2024,
      mileage: 50000,
      region: 'Auckland',
    });
    expect(result.priceRecommended).toBe(29400);
  });

  it('applies Wellington 3% region premium', async () => {
    const result = await getPriceEstimateFallback({
      make: 'Toyota',
      model: 'Corolla',
      year: 2024,
      mileage: 50000,
      region: 'Wellington',
    });
    expect(result.priceRecommended).toBe(28840);
  });

  it('applies no region premium for unknown region', async () => {
    const result = await getPriceEstimateFallback({
      make: 'Toyota',
      model: 'Corolla',
      year: 2024,
      mileage: 50000,
      region: 'Southland',
    });
    expect(result.priceRecommended).toBe(28000);
  });

  it('applies 10% ELECTRIC premium', async () => {
    const result = await getPriceEstimateFallback({
      make: 'Toyota',
      model: 'Corolla',
      year: 2024,
      mileage: 50000,
      fuelType: 'ELECTRIC',
    });
    expect(result.priceRecommended).toBe(30800);
  });

  it('applies 5% HYBRID premium', async () => {
    const result = await getPriceEstimateFallback({
      make: 'Toyota',
      model: 'Corolla',
      year: 2024,
      mileage: 50000,
      fuelType: 'HYBRID',
    });
    expect(result.priceRecommended).toBe(29400);
  });

  it('applies -2% DIESEL discount', async () => {
    const result = await getPriceEstimateFallback({
      make: 'Toyota',
      model: 'Corolla',
      year: 2024,
      mileage: 50000,
      fuelType: 'DIESEL',
    });
    expect(result.priceRecommended).toBe(27440);
  });

  it('applies no adjustment for PETROL', async () => {
    const result = await getPriceEstimateFallback({
      make: 'Toyota',
      model: 'Corolla',
      year: 2024,
      mileage: 50000,
      fuelType: 'PETROL',
    });
    expect(result.priceRecommended).toBe(28000);
  });

  it('enforces $1500 minimum price floor', async () => {
    const result = await getPriceEstimateFallback({
      make: 'Geely',
      model: 'Unknown',
      year: 2000,
      mileage: 500000,
    });
    expect(result.priceRecommended).toBe(1500);
    expect(result.priceMin).toBe(Math.round(1500 * 0.85));
    expect(result.priceMax).toBe(Math.round(1500 * 1.15));
  });

  it('returns ±15% price range around recommended', async () => {
    const result = await getPriceEstimateFallback({
      make: 'Toyota',
      model: 'Corolla',
      year: 2024,
      mileage: 50000,
    });
    expect(result.priceMin).toBe(Math.round(28000 * 0.85));
    expect(result.priceMax).toBe(Math.round(28000 * 1.15));
  });

  it('correctly stacks multiple adjustments', async () => {
    const result = await getPriceEstimateFallback({
      make: 'Honda',
      model: 'Civic',
      year: 2022,
      mileage: 80000,
      region: 'Auckland',
      fuelType: 'HYBRID',
    });
    expect(result.priceRecommended).toBe(28114);
  });

  it('returns complete response shape with factors and market comparison', async () => {
    const result = await getPriceEstimateFallback({
      make: 'Toyota',
      model: 'Corolla',
      year: 2020,
      mileage: 60000,
      region: 'Auckland',
      fuelType: 'PETROL',
    });

    expect(result).toHaveProperty('priceMin');
    expect(result).toHaveProperty('priceMax');
    expect(result).toHaveProperty('priceRecommended');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('factors');
    expect(result).toHaveProperty('marketComparison');
    expect(result.factors.length).toBeGreaterThan(0);

    for (const f of result.factors) {
      expect(f).toHaveProperty('factor');
      expect(f).toHaveProperty('impact');
    }
  });

  it('reports depreciation factor for older vehicles', async () => {
    const result = await getPriceEstimateFallback({
      make: 'Toyota',
      model: 'Corolla',
      year: 2020,
      mileage: 50000,
    });
    const depFactor = result.factors.find((f) => f.factor.includes('Age'));
    expect(depFactor).toBeDefined();
    expect(depFactor!.impact).toMatch(/^-\$/);
  });

  it('reports newer model premium factor', async () => {
    const result = await getPriceEstimateFallback({
      make: 'Toyota',
      model: 'Corolla',
      year: 2026,
      mileage: 50000,
    });
    const newFactor = result.factors.find((f) => f.factor.includes('Newer'));
    expect(newFactor).toBeDefined();
    expect(newFactor!.impact).toMatch(/^\+\$/);
  });
});

// ---------------------------------------------------------------------------
// getPriceScoreFallback (rule-based scoring)
// ---------------------------------------------------------------------------

describe('getPriceScoreFallback', () => {
  it('scores a fair price as 6 / fair', async () => {
    // Toyota Corolla 2024 at threshold = recommended 28000
    const estimate = await getPriceEstimateFallback({
      make: 'Toyota', model: 'Corolla', year: 2024, mileage: 50000,
    });
    const result = getPriceScoreFallback(
      { price: 28000, make: 'Toyota', model: 'Corolla', year: 2024, mileage: 50000 },
      estimate,
    );
    expect(result.score).toBe(6);
    expect(result.rating).toBe('fair');
    expect(result.suggestedRange.min).toBe(estimate.priceMin);
    expect(result.suggestedRange.max).toBe(estimate.priceMax);
  });

  it('scores a high price as overpriced', async () => {
    const estimate = await getPriceEstimateFallback({
      make: 'Toyota', model: 'Corolla', year: 2024, mileage: 50000,
    });
    // 28000 * 1.20 = 33600 — well over 115%
    const result = getPriceScoreFallback(
      { price: 33600, make: 'Toyota', model: 'Corolla', year: 2024, mileage: 50000 },
      estimate,
    );
    expect(result.score).toBe(2);
    expect(result.rating).toBe('overpriced');
  });

  it('scores a low price as underpriced', async () => {
    const estimate = await getPriceEstimateFallback({
      make: 'Toyota', model: 'Corolla', year: 2024, mileage: 50000,
    });
    // 28000 * 0.80 = 22400 — below 85%
    const result = getPriceScoreFallback(
      { price: 22400, make: 'Toyota', model: 'Corolla', year: 2024, mileage: 50000 },
      estimate,
    );
    expect(result.score).toBe(9);
    expect(result.rating).toBe('underpriced');
  });

  it('scores a slightly below market price as good', async () => {
    const estimate = await getPriceEstimateFallback({
      make: 'Toyota', model: 'Corolla', year: 2024, mileage: 50000,
    });
    // 28000 * 0.90 = 25200 — between 85% and 95%
    const result = getPriceScoreFallback(
      { price: 25200, make: 'Toyota', model: 'Corolla', year: 2024, mileage: 50000 },
      estimate,
    );
    expect(result.score).toBe(7);
    expect(result.rating).toBe('good');
  });

  it('includes summary with price and vehicle details', async () => {
    const estimate = await getPriceEstimateFallback({
      make: 'Toyota', model: 'Corolla', year: 2024, mileage: 50000,
    });
    const result = getPriceScoreFallback(
      { price: 28000, make: 'Toyota', model: 'Corolla', year: 2024, mileage: 50000 },
      estimate,
    );
    expect(result.summary).toContain('28,000');
    expect(result.summary).toContain('Toyota');
    expect(result.summary).toContain('Corolla');
  });

  it('converts estimate factors to positive/negative/neutral impacts', async () => {
    const estimate = await getPriceEstimateFallback({
      make: 'Toyota', model: 'Corolla', year: 2020, mileage: 60000,
    });
    const result = getPriceScoreFallback(
      { price: 25000, make: 'Toyota', model: 'Corolla', year: 2020, mileage: 60000 },
      estimate,
    );
    expect(result.factors.length).toBeGreaterThan(0);
    for (const f of result.factors) {
      expect(['positive', 'negative', 'neutral']).toContain(f.impact);
    }
  });
});

// ---------------------------------------------------------------------------
// getPriceScore (LLM-powered with fallback)
// ---------------------------------------------------------------------------

describe('getPriceScore', () => {
  const baseParams = {
    price: 25000,
    make: 'Toyota',
    model: 'Corolla',
    year: 2020,
    mileage: 45000,
  };

  const validLlmResponse = {
    score: 7,
    rating: 'good',
    summary: 'Your asking price of $25,000 is within the expected market range.',
    suggestedRange: { min: 23000, max: 27000 },
    factors: [
      { factor: 'Low mileage for a 2020 model', impact: 'positive' },
      { factor: 'Strong demand for Corolla in Auckland', impact: 'positive' },
    ],
  };

  beforeEach(() => {
    mockCreate.mockReset();
  });

  it('uses fallback when OPENAI_API_KEY is mock', async () => {
    (env as any).OPENAI_API_KEY = 'mock';

    const result = await getPriceScore({
      price: 28000,
      make: 'Toyota',
      model: 'Corolla',
      year: 2024,
      mileage: 50000,
    });

    expect(result.score).toBe(6);
    expect(result.rating).toBe('fair');
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('calls OpenAI and returns parsed result on success', async () => {
    (env as any).OPENAI_API_KEY = 'sk-real-key';
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(validLlmResponse) } }],
    });

    const result = await getPriceScore(baseParams);

    expect(mockCreate).toHaveBeenCalledOnce();
    expect(result.score).toBe(7);
    expect(result.rating).toBe('good');
    expect(result.summary).toContain('$25,000');
    expect(result.suggestedRange).toEqual({ min: 23000, max: 27000 });
    expect(result.factors).toHaveLength(2);
  });

  it('passes correct model and parameters to OpenAI', async () => {
    (env as any).OPENAI_API_KEY = 'sk-real-key';
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(validLlmResponse) } }],
    });

    await getPriceScore({ ...baseParams, region: 'Auckland', fuelType: 'PETROL' });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gpt-4.1-nano',
        temperature: 0.3,
        max_tokens: 600,
      }),
    );

    const callArgs = mockCreate.mock.calls[0][0];
    const userMessage = callArgs.messages.find((m: any) => m.role === 'user');
    expect(userMessage.content).toContain('25,000');
    expect(userMessage.content).toContain('Toyota');
    expect(userMessage.content).toContain('Corolla');
    expect(userMessage.content).toContain('Auckland');
  });

  it('throws AppError on OpenAI API error', async () => {
    (env as any).OPENAI_API_KEY = 'sk-real-key';
    mockCreate.mockRejectedValue(new Error('API connection error'));

    await expect(getPriceScore({
      price: 28000,
      make: 'Toyota',
      model: 'Corolla',
      year: 2024,
      mileage: 50000,
    })).rejects.toThrow('API connection error');
  });

  it('throws AppError on invalid JSON from OpenAI', async () => {
    (env as any).OPENAI_API_KEY = 'sk-real-key';
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'not valid json' } }],
    });

    await expect(getPriceScore({
      price: 28000,
      make: 'Toyota',
      model: 'Corolla',
      year: 2024,
      mileage: 50000,
    })).rejects.toThrow();
  });

  it('throws AppError when OpenAI returns invalid schema', async () => {
    (env as any).OPENAI_API_KEY = 'sk-real-key';
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ wrong: 'shape' }) } }],
    });

    await expect(getPriceScore({
      price: 28000,
      make: 'Toyota',
      model: 'Corolla',
      year: 2024,
      mileage: 50000,
    })).rejects.toThrow();
  });
});
