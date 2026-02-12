import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, DollarSign, MapPin, Sparkles } from 'lucide-react';
import { cn } from '@/utils';
import { formatPrice } from '@/utils/format';
import { mockFilterOptions } from '@/mock/data';
import { useListingWizardStore } from '@/stores/listingWizardStore';
import { getPriceScore } from '@/api/ai';
import { useToast } from '@/components/common/Toast';
import type { PriceScoreResponse } from '@/types';
import Button from '@/components/common/Button';
import Select from '@/components/common/Select';
import Checkbox from '@/components/common/Checkbox';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';

interface Step5PriceProps {
  onNext: () => void;
  onBack: () => void;
}

const ratingConfig: Record<PriceScoreResponse['rating'], { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  excellent: { label: 'Excellent Deal', variant: 'success' },
  good: { label: 'Good Value', variant: 'success' },
  fair: { label: 'Fair Price', variant: 'warning' },
  overpriced: { label: 'Overpriced', variant: 'danger' },
  underpriced: { label: 'Underpriced', variant: 'danger' },
};

const impactIcon = {
  positive: { Icon: TrendingUp, color: 'text-green-600' },
  negative: { Icon: TrendingDown, color: 'text-red-600' },
  neutral: { Icon: Minus, color: 'text-gray-400' },
} as const;

export default function Step5Price({ onNext, onBack }: Step5PriceProps) {
  const {
    price,
    setPrice,
    negotiable,
    setNegotiable,
    region,
    setRegion,
    vehicleDetails,
  } = useListingWizardStore();

  const toast = useToast();

  const [priceInput, setPriceInput] = useState(price ? String(price) : '');
  const [scoreResult, setScoreResult] = useState<PriceScoreResponse | null>(null);
  const [isLoadingScore, setIsLoadingScore] = useState(false);

  const regionOptions = mockFilterOptions.regions.map(r => ({ value: r, label: r }));

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setPriceInput(value);
    setPrice(value ? parseInt(value, 10) : null);
    // Clear previous score when price changes
    setScoreResult(null);
  };

  const handleGetScore = async () => {
    if (!price || price <= 0 || !vehicleDetails) return;

    setIsLoadingScore(true);
    try {
      const result = await getPriceScore({
        price,
        make: vehicleDetails.make,
        model: vehicleDetails.model,
        year: vehicleDetails.year,
        mileage: vehicleDetails.mileage,
        region: region || undefined,
        fuelType: vehicleDetails.fuelType || undefined,
        transmission: vehicleDetails.transmission || undefined,
      });
      setScoreResult(result);
    } catch {
      toast.error('Failed to get AI price score. Please try again.');
    } finally {
      setIsLoadingScore(false);
    }
  };

  const canContinue = price !== null && price > 0 && region !== '';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Set your asking price
        </h1>
        <p className="text-gray-600">
          We'll help you price your car competitively based on market data
        </p>
      </div>

      {/* Price Input */}
      <Card className="mb-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Asking Price
            </label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={priceInput ? Number(priceInput).toLocaleString() : ''}
                onChange={handlePriceChange}
                placeholder="0"
                className={cn(
                  'w-full pl-10 pr-4 py-4 text-2xl font-bold border rounded-lg',
                  'focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
                  'border-gray-300'
                )}
              />
            </div>

            {/* Get AI Score Button */}
            {price && price > 0 && vehicleDetails && (
              <div className="mt-4">
                <Button
                  onClick={handleGetScore}
                  isLoading={isLoadingScore}
                  disabled={isLoadingScore}
                  variant="outline"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get AI Price Score
                </Button>
              </div>
            )}
          </div>

          {/* Negotiable checkbox */}
          <Checkbox
            label="Price is negotiable"
            description="Let buyers know you're open to offers"
            checked={negotiable}
            onChange={(e) => setNegotiable(e.target.checked)}
          />

          {/* Region */}
          <Select
            label="Location"
            options={regionOptions}
            placeholder="Select your region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            error={!region ? 'Please select a region' : undefined}
          />
          <p className="text-sm text-gray-500 -mt-4 flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            This helps buyers find cars in their area
          </p>
        </div>
      </Card>

      {/* AI Score Result */}
      {scoreResult && (
        <Card className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary-600" />
            AI Price Analysis
          </h3>

          {/* Score + Rating */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-gray-900">{scoreResult.score}</span>
              <span className="text-lg text-gray-400 ml-1">/10</span>
            </div>
            <Badge variant={ratingConfig[scoreResult.rating].variant} size="md">
              {ratingConfig[scoreResult.rating].label}
            </Badge>
          </div>

          {/* Summary */}
          <p className="text-gray-700 mb-4">{scoreResult.summary}</p>

          {/* Suggested Range */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-2">Suggested Price Range</p>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700">{formatPrice(scoreResult.suggestedRange.min)}</span>
              <div className="flex-1 mx-4 h-2 bg-gray-200 rounded-full relative">
                <div
                  className="absolute h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-full"
                  style={{ width: '100%' }}
                />
                {price && (
                  <div
                    className="absolute w-3 h-3 bg-white border-2 border-gray-800 rounded-full -top-0.5 transform -translate-x-1/2"
                    style={{
                      left: `${Math.min(100, Math.max(0, ((price - scoreResult.suggestedRange.min) / (scoreResult.suggestedRange.max - scoreResult.suggestedRange.min)) * 100))}%`,
                    }}
                  />
                )}
              </div>
              <span className="font-semibold text-gray-700">{formatPrice(scoreResult.suggestedRange.max)}</span>
            </div>
          </div>

          {/* Factors */}
          {scoreResult.factors.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Pricing Factors</p>
              <ul className="space-y-2">
                {scoreResult.factors.map((f, i) => {
                  const { Icon, color } = impactIcon[f.impact];
                  return (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <Icon className={cn('h-4 w-4 flex-shrink-0', color)} />
                      {f.factor}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </Card>
      )}

      {/* Navigation */}
      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!canContinue}
          className="flex-1"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
