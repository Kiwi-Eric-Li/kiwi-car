import { useState } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { cn } from '@/utils';
import { isValidNZPlate, formatPlate } from '@/utils/format';
import { mockVehicleLookup } from '@/mock/data';
import { useListingWizardStore, type VehicleDetails } from '@/stores/listingWizardStore';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';

interface Step1PlateProps {
  onNext: () => void;
}

export default function Step1Plate({ onNext }: Step1PlateProps) {
  const {
    plateNumber,
    setPlateNumber,
    setVehicleDetails,
    setLookupComplete,
  } = useListingWizardStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lookupResult, setLookupResult] = useState<VehicleDetails | null>(null);

  const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPlate(e.target.value);
    setPlateNumber(formatted);
    setError(null);
    setLookupResult(null);
  };

  const handleLookup = async () => {
    const plate = formatPlate(plateNumber);

    if (!plate) {
      setError('Please enter a plate number');
      return;
    }

    if (!isValidNZPlate(plate)) {
      setError('Please enter a valid NZ plate number (e.g., ABC123)');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Look up in mock data
    const vehicle = mockVehicleLookup[plate];

    if (vehicle) {
      const details: VehicleDetails = {
        plate: vehicle.plate,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        bodyType: vehicle.bodyType,
        fuelType: vehicle.fuelType,
        transmission: vehicle.transmission || '',
        color: vehicle.color,
        mileage: vehicle.odometerHistory?.[0]?.reading || 0,
        vin: vehicle.vin,
      };
      setLookupResult(details);
      setVehicleDetails(details);
      setLookupComplete(true);
    } else {
      // For demo: create a generic result for any valid plate
      const details: VehicleDetails = {
        plate: plate,
        make: '',
        model: '',
        year: new Date().getFullYear(),
        bodyType: '',
        fuelType: '',
        transmission: '',
        color: '',
        mileage: 0,
      };
      setLookupResult(details);
      setVehicleDetails(details);
      setLookupComplete(true);
      setError('Vehicle not found in our database. Please enter details manually.');
    }

    setIsLoading(false);
  };

  const handleManualEntry = () => {
    const details: VehicleDetails = {
      plate: plateNumber || '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      bodyType: '',
      fuelType: '',
      transmission: '',
      color: '',
      mileage: 0,
    };
    setVehicleDetails(details);
    setLookupComplete(true);
    onNext();
  };

  const handleContinue = () => {
    if (lookupResult) {
      onNext();
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Let's start with your plate number
        </h1>
        <p className="text-gray-600">
          We'll look up your vehicle details automatically from NZTA records
        </p>
      </div>

      {/* Plate Input */}
      <div className="mb-6">
        <div
          className={cn(
            'bg-white border-4 border-gray-800 rounded-lg px-4 py-4 shadow-lg',
            error && !lookupResult && 'border-red-500'
          )}
        >
          <input
            type="text"
            value={plateNumber}
            onChange={handlePlateChange}
            placeholder="ABC123"
            maxLength={7}
            className={cn(
              'w-full text-center text-4xl font-bold tracking-[0.3em] uppercase',
              'bg-transparent border-none outline-none',
              'placeholder:text-gray-300 placeholder:tracking-[0.3em]'
            )}
            disabled={isLoading}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
          />
        </div>
        {error && !lookupResult && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        )}
      </div>

      {/* Lookup Button */}
      <Button
        onClick={handleLookup}
        disabled={!plateNumber || isLoading}
        isLoading={isLoading}
        fullWidth
        size="lg"
        className="mb-4"
      >
        <Search className="h-5 w-5 mr-2" />
        Look Up My Car
      </Button>

      {/* Manual entry link */}
      <p className="text-center text-sm text-gray-500 mb-8">
        Don't have the plate?{' '}
        <button
          onClick={handleManualEntry}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          Enter details manually
        </button>
      </p>

      {/* Lookup Result */}
      {lookupResult && lookupResult.make && (
        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <h3 className="font-semibold text-gray-900">Vehicle Found!</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Make</p>
              <p className="font-medium text-gray-900">{lookupResult.make}</p>
            </div>
            <div>
              <p className="text-gray-500">Model</p>
              <p className="font-medium text-gray-900">{lookupResult.model}</p>
            </div>
            <div>
              <p className="text-gray-500">Year</p>
              <p className="font-medium text-gray-900">{lookupResult.year}</p>
            </div>
            <div>
              <p className="text-gray-500">Color</p>
              <p className="font-medium text-gray-900">{lookupResult.color}</p>
            </div>
          </div>
          <Button onClick={handleContinue} fullWidth className="mt-4">
            Continue with this vehicle
          </Button>
        </Card>
      )}

      {/* Not found but valid plate */}
      {lookupResult && !lookupResult.make && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">Vehicle not in database</h3>
          </div>
          <p className="text-sm text-yellow-700 mb-4">
            We couldn't find this plate in our records. You can still continue and enter the details manually.
          </p>
          <Button onClick={handleContinue} fullWidth variant="outline">
            Continue with manual entry
          </Button>
        </Card>
      )}
    </div>
  );
}
