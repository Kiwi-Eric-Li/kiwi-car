import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, DollarSign, MapPin, Info } from 'lucide-react';
import { cn } from '@/utils';
import { formatPrice } from '@/utils/format';
import { mockFilterOptions } from '@/mock/data';
import { useListingWizardStore } from '@/stores/listingWizardStore';
import Button from '@/components/common/Button';
import Select from '@/components/common/Select';
import Checkbox from '@/components/common/Checkbox';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';

interface Step5PriceProps {
  onNext: () => void;
  onBack: () => void;
}

interface PriceRecommendation {
  low: number;
  recommended: number;
  high: number;
}

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

  const [priceInput, setPriceInput] = useState(price ? String(price) : '');
  const [recommendation, setRecommendation] = useState<PriceRecommendation | null>(null);
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(true);

  // Generate mock AI price recommendation
  useEffect(() => {
    const generateRecommendation = async () => {
      setIsLoadingRecommendation(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock recommendation based on vehicle details
      const basePrice = vehicleDetails
        ? Math.max(5000, 50000 - (vehicleDetails.mileage / 1000) * 100 - (new Date().getFullYear() - vehicleDetails.year) * 1500)
        : 25000;

      setRecommendation({
        low: Math.round(basePrice * 0.85 / 100) * 100,
        recommended: Math.round(basePrice / 100) * 100,
        high: Math.round(basePrice * 1.15 / 100) * 100,
      });
      setIsLoadingRecommendation(false);
    };

    generateRecommendation();
  }, [vehicleDetails]);

  const regionOptions = mockFilterOptions.regions.map(r => ({ value: r, label: r }));

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setPriceInput(value);
    setPrice(value ? parseInt(value, 10) : null);
  };

  const canContinue = price !== null && price > 0 && region !== '';

  const getPriceRating = () => {
    if (!price || !recommendation) return null;

    if (price < recommendation.low) {
      return { rating: 'below', label: 'Below Market', color: 'success' as const, icon: TrendingDown };
    } else if (price <= recommendation.high) {
      return { rating: 'fair', label: 'Fair Price', color: 'warning' as const, icon: Minus };
    } else {
      return { rating: 'above', label: 'Above Market', color: 'danger' as const, icon: TrendingUp };
    }
  };

  const priceRating = getPriceRating();

  const setRecommendedPrice = () => {
    if (recommendation) {
      setPriceInput(String(recommendation.recommended));
      setPrice(recommendation.recommended);
    }
  };

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

      {/* AI Price Recommendation */}
      <Card className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary-600" />
          AI Price Recommendation
        </h3>

        {isLoadingRecommendation ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-8 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        ) : recommendation && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Low</p>
                <p className="font-semibold text-gray-700">{formatPrice(recommendation.low)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-primary-600 font-medium">Recommended</p>
                <p className="text-2xl font-bold text-primary-600">{formatPrice(recommendation.recommended)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">High</p>
                <p className="font-semibold text-gray-700">{formatPrice(recommendation.high)}</p>
              </div>
            </div>

            {/* Price range visualization */}
            <div className="relative h-3 bg-gray-200 rounded-full mb-4">
              <div
                className="absolute h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-full"
                style={{ width: '100%' }}
              />
              {price && (
                <div
                  className="absolute w-4 h-4 bg-white border-2 border-gray-800 rounded-full -top-0.5 transform -translate-x-1/2"
                  style={{
                    left: `${Math.min(100, Math.max(0, ((price - recommendation.low) / (recommendation.high - recommendation.low)) * 100))}%`,
                  }}
                />
              )}
            </div>

            <Button variant="outline" size="sm" onClick={setRecommendedPrice}>
              Use Recommended Price
            </Button>

            <p className="text-sm text-gray-500 mt-3 flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              Based on {vehicleDetails?.year} {vehicleDetails?.make} {vehicleDetails?.model} listings with similar mileage in your region.
            </p>
          </>
        )}
      </Card>

      {/* Price Input */}
      <Card>
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

            {/* Price rating badge */}
            {priceRating && price && (
              <div className="mt-3 flex items-center gap-2">
                <Badge variant={priceRating.color} size="md">
                  <priceRating.icon className="h-4 w-4 mr-1" />
                  {priceRating.label}
                </Badge>
                <span className="text-sm text-gray-500">
                  {priceRating.rating === 'below' && 'This price may attract quick interest'}
                  {priceRating.rating === 'fair' && 'This price is within market expectations'}
                  {priceRating.rating === 'above' && 'Consider lowering for faster sale'}
                </span>
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

          {/* Navigation */}
          <div className="flex gap-4 pt-4">
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
      </Card>
    </div>
  );
}
