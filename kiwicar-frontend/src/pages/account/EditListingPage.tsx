import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle, Loader2, ArrowLeft } from 'lucide-react';
import { cn } from '@/utils';
import { formatPrice } from '@/utils/format';
import { apiClient } from '@/api/client';
import { mockFilterOptions } from '@/mock/data';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Card from '@/components/common/Card';
import { PageSpinner } from '@/components/common';

const NZ_REGIONS = [
  { value: 'Auckland', label: 'Auckland' },
  { value: 'Wellington', label: 'Wellington' },
  { value: 'Canterbury', label: 'Canterbury' },
  { value: 'Waikato', label: 'Waikato' },
  { value: 'Bay of Plenty', label: 'Bay of Plenty' },
  { value: 'Manawatu-Wanganui', label: 'Manawatu-Wanganui' },
  { value: 'Otago', label: 'Otago' },
  { value: "Hawke's Bay", label: "Hawke's Bay" },
  { value: 'Northland', label: 'Northland' },
  { value: 'Taranaki', label: 'Taranaki' },
  { value: 'Southland', label: 'Southland' },
  { value: 'Nelson', label: 'Nelson' },
  { value: 'Marlborough', label: 'Marlborough' },
  { value: 'Gisborne', label: 'Gisborne' },
  { value: 'West Coast', label: 'West Coast' },
  { value: 'Tasman', label: 'Tasman' },
];

const editListingSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1980).max(new Date().getFullYear() + 1),
  bodyType: z.string().min(1, 'Body type is required'),
  fuelType: z.string().min(1, 'Fuel type is required'),
  transmission: z.string().min(1, 'Transmission is required'),
  color: z.string().min(1, 'Color is required'),
  mileage: z.number().min(0).max(1000000),
  vin: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(100, 'Price must be at least $100'),
  region: z.string().min(1, 'Region is required'),
});

type EditListingForm = z.infer<typeof editListingSchema>;

interface ListingData {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  description: string;
  region: string;
  fuelType: string;
  transmission: string;
  bodyType: string;
  color: string;
  vin: string | null;
  images: { id: string; url: string; order: number }[];
}

const colorOptions = [
  'White', 'Black', 'Silver', 'Grey', 'Red', 'Blue', 'Green',
  'Brown', 'Orange', 'Yellow', 'Gold', 'Beige', 'Purple', 'Other',
].map((c) => ({ value: c, label: c }));

const yearOptions = Array.from(
  { length: new Date().getFullYear() - 1979 },
  (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: String(year), label: String(year) };
  }
);

export default function EditListingPage() {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();

  const [listing, setListing] = useState<ListingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EditListingForm>({
    resolver: zodResolver(editListingSchema),
  });

  const selectedMake = watch('make');
  const currentPrice = watch('price');
  const originalPrice = listing?.price;

  // Price change warning
  const priceChanged = originalPrice && currentPrice && currentPrice !== originalPrice;

  useEffect(() => {
    async function fetchListing() {
      if (!listingId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await apiClient.get<ListingData>(`/listings/${listingId}`);
        const data = response.data;
        setListing(data);

        // Pre-fill the form
        reset({
          make: data.make,
          model: data.model,
          year: data.year,
          bodyType: data.bodyType,
          fuelType: data.fuelType,
          transmission: data.transmission,
          color: data.color,
          mileage: data.mileage,
          vin: data.vin || '',
          description: data.description,
          price: data.price,
          region: data.region,
        });
      } catch (err: any) {
        console.error('Failed to fetch listing:', err);
        if (err.response?.status === 404) {
          setError('Listing not found');
        } else if (err.response?.status === 403) {
          setError('You do not have permission to edit this listing');
        } else {
          setError(err.response?.data?.error?.message || 'Failed to load listing');
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchListing();
  }, [listingId, reset]);

  const makeOptions = mockFilterOptions.makes.map((m) => ({ value: m, label: m }));

  const modelOptions =
    selectedMake && mockFilterOptions.models[selectedMake]
      ? mockFilterOptions.models[selectedMake].map((m) => ({ value: m, label: m }))
      : [];

  const bodyTypeOptions = mockFilterOptions.bodyTypes.map((b) => ({ value: b, label: b }));
  const fuelTypeOptions = mockFilterOptions.fuelTypes.map((f) => ({ value: f, label: f }));
  const transmissionOptions = mockFilterOptions.transmissions.map((t) => ({ value: t, label: t }));

  const onSubmit = async (data: EditListingForm) => {
    if (!listingId) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      await apiClient.put(`/listings/${listingId}`, {
        make: data.make,
        model: data.model,
        year: data.year,
        bodyType: data.bodyType,
        fuelType: data.fuelType,
        transmission: data.transmission,
        color: data.color,
        mileage: data.mileage,
        vin: data.vin || null,
        description: data.description,
        price: data.price,
        region: data.region,
      });

      setSaveMessage({ type: 'success', text: 'Listing updated successfully!' });

      // Update the original price reference
      if (listing) {
        setListing({ ...listing, price: data.price });
      }
    } catch (err: any) {
      console.error('Failed to update listing:', err);
      setSaveMessage({
        type: 'error',
        text: err.response?.data?.error?.message || 'Failed to update listing',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <PageSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => navigate('/account/listings')}>Back to My Listings</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/account/listings')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Listings
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Listing</h1>
          <p className="text-gray-500 mt-1">
            Update your listing details below. Changes will be published immediately.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Plate Number (locked) */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Identification</h2>
            <div className="p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-500">Plate Number (cannot be changed)</p>
              <p className="text-xl font-bold tracking-wider">{listing?.plateNumber}</p>
            </div>
          </Card>

          {/* Vehicle Details */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Details</h2>
            <div className="space-y-4">
              {/* Make & Model */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Make"
                  options={makeOptions}
                  placeholder="Select make"
                  {...register('make')}
                  error={errors.make?.message}
                  onChange={(e) => {
                    setValue('make', e.target.value);
                    setValue('model', '');
                  }}
                />
                <Select
                  label="Model"
                  options={modelOptions}
                  placeholder={selectedMake ? 'Select model' : 'Select make first'}
                  disabled={!selectedMake}
                  {...register('model')}
                  error={errors.model?.message}
                />
              </div>

              {/* Year & Body Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Year"
                  options={yearOptions}
                  {...register('year', { valueAsNumber: true })}
                  error={errors.year?.message}
                />
                <Select
                  label="Body Type"
                  options={bodyTypeOptions}
                  placeholder="Select body type"
                  {...register('bodyType')}
                  error={errors.bodyType?.message}
                />
              </div>

              {/* Fuel & Transmission */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Fuel Type"
                  options={fuelTypeOptions}
                  placeholder="Select fuel type"
                  {...register('fuelType')}
                  error={errors.fuelType?.message}
                />
                <Select
                  label="Transmission"
                  options={transmissionOptions}
                  placeholder="Select transmission"
                  {...register('transmission')}
                  error={errors.transmission?.message}
                />
              </div>

              {/* Color & Mileage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Color"
                  options={colorOptions}
                  placeholder="Select color"
                  {...register('color')}
                  error={errors.color?.message}
                />
                <Input
                  label="Mileage (km)"
                  type="number"
                  {...register('mileage', { valueAsNumber: true })}
                  error={errors.mileage?.message}
                />
              </div>

              {/* VIN */}
              <Input
                label="VIN (Optional)"
                placeholder="17-character Vehicle Identification Number"
                {...register('vin')}
                error={errors.vin?.message}
              />
            </div>
          </Card>

          {/* Description */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Listing Description
              </label>
              <textarea
                {...register('description')}
                rows={6}
                className={cn(
                  'w-full border rounded-lg p-3 focus:border-primary-500 focus:ring-1 focus:ring-primary-500',
                  errors.description ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="Describe your vehicle..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>
          </Card>

          {/* Price & Region */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Price & Location</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Price (NZD)"
                    type="number"
                    {...register('price', { valueAsNumber: true })}
                    error={errors.price?.message}
                  />
                  {originalPrice && (
                    <p className="mt-1 text-xs text-gray-500">
                      Current price: {formatPrice(originalPrice)}
                    </p>
                  )}
                </div>
                <Select
                  label="Region"
                  options={NZ_REGIONS}
                  placeholder="Select region"
                  {...register('region')}
                  error={errors.region?.message}
                />
              </div>

              {/* Price Change Warning */}
              {priceChanged && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Price Change Alert</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Changing the price from {formatPrice(originalPrice!)} to{' '}
                      {formatPrice(currentPrice!)} will trigger notifications to users who have
                      set price alerts for this listing.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Save Message */}
          {saveMessage && (
            <div
              className={cn(
                'p-4 rounded-lg',
                saveMessage.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              )}
            >
              {saveMessage.text}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/account/listings')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="flex-1">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Update Listing'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
