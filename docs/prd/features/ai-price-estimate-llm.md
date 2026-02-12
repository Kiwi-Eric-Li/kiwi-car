# Feature PRD: LLM-Powered Price Scoring

**Version:** 2.0
**Created:** February 2026
**Updated:** February 2026
**Status:** Draft
**Priority:** P0 (Phase 1 MVP)

---

## 1. Overview

### 1.1 Problem

When a seller lists a car on KiwiCar, they set a price based on their own judgment. There is no feedback mechanism to tell them whether their asking price is reasonable, too high, or too low relative to the NZ market. Buyers also have no way to evaluate whether a listed price represents good value.

The current `/api/ai/price-estimate` endpoint uses a rule-based algorithm to generate a price from vehicle attributes. It does not accept a user-proposed price, and cannot provide a score or natural-language evaluation.

### 1.2 Solution

Upgrade the existing `POST /api/ai/price-estimate` endpoint to accept a user's proposed price along with vehicle details, and use OpenAI's `gpt-4.1-nano` to return a score (1–10) with a natural-language explanation of how the price compares to the NZ used car market.

### 1.3 Scope

- **In scope:** Modify the existing endpoint (request body, response shape, service logic, schema, types), add OpenAI call with fallback, update tests
- **Out of scope:** Feeding real-time KiwiCar listings data into the prompt (Phase 2); storing scores in DB; batch scoring

---

## 2. Changes to Existing Endpoint

### 2.1 Current State

```
GET /api/ai/price-estimate?make=Toyota&model=Corolla&year=2020&mileage=45000&...
```

- Method: GET with query params
- Response: `{ priceMin, priceMax, priceRecommended, confidence, factors, marketComparison }`
- No user price input

### 2.2 New State

```
POST /api/ai/price-estimate
```

- **Method:** GET → POST (now accepts a request body with user's price)
- **Auth:** Required (Supabase JWT) — unchanged
- **Rate limit:** 30 requests / day / user (previously had `priceEstimateLimiter`)

---

## 3. API Contract

### 3.1 Request Body

```json
{
  "price": 25000,
  "make": "Toyota",
  "model": "Corolla",
  "year": 2020,
  "mileage": 45000,
  "region": "Auckland",
  "fuelType": "PETROL",
  "transmission": "AUTOMATIC"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| price | number | Yes | The user's proposed price in NZD |
| make | string | Yes | Vehicle make |
| model | string | Yes | Vehicle model |
| year | number | Yes | Manufacturing year |
| mileage | number | Yes | Odometer reading in km |
| region | string | No | NZ region (e.g., Auckland, Wellington) |
| fuelType | string | No | PETROL / DIESEL / HYBRID / ELECTRIC / OTHER |
| transmission | string | No | AUTOMATIC / MANUAL |

### 3.2 Response (200)

```json
{
  "data": {
    "score": 7,
    "rating": "good",
    "summary": "Your asking price of $25,000 for this 2020 Toyota Corolla is within the expected market range. Similar vehicles in Auckland typically sell for $23,000–$27,000. The low mileage of 45,000 km supports a price at the higher end of this range.",
    "suggestedRange": {
      "min": 23000,
      "max": 27000
    },
    "factors": [
      { "factor": "Low mileage for a 2020 model", "impact": "positive" },
      { "factor": "Strong demand for Corolla in Auckland", "impact": "positive" },
      { "factor": "Price sits in the upper half of market range", "impact": "neutral" }
    ]
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| score | number | 1–10 rating of the user's price (1 = very overpriced, 5 = fair, 10 = great deal) |
| rating | string | One of: `"excellent"`, `"good"`, `"fair"`, `"overpriced"`, `"underpriced"` |
| summary | string | 2–3 sentence natural-language explanation |
| suggestedRange.min | number | Low end of the estimated market range in NZD |
| suggestedRange.max | number | High end of the estimated market range in NZD |
| factors | array | Key factors that influenced the score |
| factors[].factor | string | Description of the factor |
| factors[].impact | string | One of: `"positive"`, `"negative"`, `"neutral"` |

---

## 4. Technical Design

### 4.1 Files to Modify

| File | Change |
|------|--------|
| `src/types/index.ts` | Replace `PriceEstimateResponse` with `PriceScoreResponse` |
| `src/schemas/ai.schema.ts` | Replace `priceEstimateSchema` — change from `query` to `body`, add `price` field, remove `coerce` |
| `src/services/ai.service.ts` | Replace `getPriceEstimate()` with `getPriceScore()` (OpenAI call) + `getPriceScoreFallback()` (rule-based); keep `getPriceEstimateFallback()` as internal helper for the fallback |
| `src/controllers/ai.controller.ts` | Replace `getPriceEstimateHandler` with `getPriceScoreHandler` (reads `req.body`) |
| `src/routes/ai.routes.ts` | Change `router.get` → `router.post`, update handler and schema references |
| `src/services/__tests__/ai.service.test.ts` | Replace `getPriceEstimate` LLM tests with `getPriceScore` tests; keep `getPriceEstimateFallback` tests as-is |

### 4.2 Already Done (from previous implementation)

| File | Status |
|------|--------|
| `src/config/openai.ts` | Already created (OpenAI client singleton) |
| `openai` npm package | Already installed |
| `src/middleware/rateLimit.middleware.ts` | `priceEstimateLimiter` already exists (30/day/user) |
| `src/config/constants.ts` | `RATE_LIMITS.PRICE_ESTIMATE` already exists |

### 4.3 OpenAI Integration

**Model:** `gpt-4.1-nano`

**System prompt:**

```
You are a New Zealand used car pricing expert. A user has proposed a price for a vehicle. Evaluate whether their price is fair based on the NZ used car market (TradeMe, Turners, dealer pricing). Return a JSON object matching the provided schema.

Scoring guide:
- 1-2: Extremely overpriced, well above market value
- 3-4: Overpriced, above typical market range
- 5-6: Fair, within the expected market range
- 7-8: Good value, at or below typical market price
- 9-10: Excellent deal, significantly below market value
```

**User prompt:**

```
Evaluate this price:
- Asking price: $25,000 NZD
- Make: Toyota
- Model: Corolla
- Year: 2020
- Mileage: 45,000 km
- Region: Auckland
- Fuel type: PETROL
- Transmission: AUTOMATIC
```

**Parameters:** `temperature: 0.3`, `max_tokens: 600`

**Structured output:** Use `response_format: { type: "json_schema" }` to enforce the response shape.

### 4.4 Fallback Strategy

When `OPENAI_API_KEY=mock` or when the OpenAI call fails:

```
Client request
  → env.OPENAI_API_KEY === 'mock'? → use rule-based fallback
  → Call OpenAI API
    → Success: parse + validate JSON → return
    → Failure (timeout / API error / invalid JSON):
        → Fall back to rule-based scoring
        → Log warning
```

**Rule-based fallback logic (`getPriceScoreFallback`):**

1. Use the existing `getPriceEstimateFallback()` to get a recommended price for the vehicle
2. Compare the user's price against the recommended price:
   - User price ≤ recommended × 0.85 → score 9, rating "underpriced"
   - User price within ±15% of recommended → score 6, rating "fair"
   - User price ≥ recommended × 1.15 → score 3, rating "overpriced"
3. Set `suggestedRange` to `{ min: priceMin, max: priceMax }` from the fallback estimate
4. Generate a simple summary string

### 4.5 Cost Estimation

| Item | Value |
|------|-------|
| Model | gpt-4.1-nano |
| Input cost | $0.10 / 1M tokens |
| Output cost | $0.40 / 1M tokens |
| Input tokens (est.) | ~350 tokens (system + user prompt) |
| Output tokens (est.) | ~300 tokens (JSON response with summary) |
| Cost per request | ~$0.000035 (input) + $0.00012 (output) ≈ $0.000155 |
| Daily budget (30 req/user × 100 users) | ~$0.47/day |

---

## 5. Testing Strategy

Update `src/services/__tests__/ai.service.test.ts`:

- **Mock OpenAI calls** using `vi.mock` — no real API calls
- Test LLM success path: mock valid response → returns parsed result
- Test fallback on API error → returns rule-based score
- Test fallback on invalid JSON → returns rule-based score
- Test mock mode (`OPENAI_API_KEY=mock`) → skips LLM, uses rule-based
- Test fallback scoring logic: overpriced input → low score, underpriced input → high score, fair price → mid score
- Keep existing `getPriceEstimateFallback` tests unchanged (still used internally by the fallback)

---

## 6. Implementation Steps

1. Replace `PriceEstimateResponse` with `PriceScoreResponse` in `src/types/index.ts`
2. Update `priceEstimateSchema` in `src/schemas/ai.schema.ts` — change to `body` validation, add `price` field
3. Replace `getPriceEstimate()` with `getPriceScore()` + `getPriceScoreFallback()` in `src/services/ai.service.ts`
4. Replace `getPriceEstimateHandler` with `getPriceScoreHandler` in `src/controllers/ai.controller.ts`
5. Change `router.get` → `router.post` in `src/routes/ai.routes.ts`
6. Update unit tests
7. Run `npm test` to verify

---

## 7. Future Enhancements (Out of Scope)

- **Market data injection:** Feed KiwiCar's own listing stats into the prompt for more accurate comparisons
- **Score history:** Store scores in DB and show trending over time
- **Batch scoring:** Score multiple vehicles in one request
- **Model upgrade:** Switch to `gpt-4.1-mini` or `gpt-4.1` if `gpt-4.1-nano` quality is insufficient
