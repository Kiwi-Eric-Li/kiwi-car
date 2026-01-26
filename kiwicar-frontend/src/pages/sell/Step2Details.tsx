import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useListingWizardStore, type VehicleDetails } from '@/stores/listingWizardStore';
import { mockFilterOptions } from '@/mock/data';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Card from '@/components/common/Card';

const vehicleDetailsSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1980, 'Year must be 1980 or later').max(new Date().getFullYear() + 1),
  bodyType: z.string().min(1, 'Body type is required'),
  fuelType: z.string().min(1, 'Fuel type is required'),
  transmission: z.string().min(1, 'Transmission is required'),
  color: z.string().min(1, 'Color is required'),
  mileage: z.number().min(0, 'Mileage must be 0 or greater').max(1000000),
  vin: z.string().optional(),
});

type VehicleDetailsForm = z.infer<typeof vehicleDetailsSchema>;

interface Step2DetailsProps {
  onNext: () => void;
  onBack: () => void;
}

const colorOptions = [
  'White', 'Black', 'Silver', 'Grey', 'Red', 'Blue', 'Green',
  'Brown', 'Orange', 'Yellow', 'Gold', 'Beige', 'Purple', 'Other'
].map(c => ({ value: c, label: c }));

const yearOptions = Array.from(
  { length: new Date().getFullYear() - 1979 },
  (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: String(year), label: String(year) };
  }
);

export default function Step2Details({ onNext, onBack }: Step2DetailsProps) {
  const { vehicleDetails, setVehicleDetails } = useListingWizardStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VehicleDetailsForm>({
    resolver: zodResolver(vehicleDetailsSchema),
    defaultValues: {
      make: vehicleDetails?.make || '',
      model: vehicleDetails?.model || '',
      year: vehicleDetails?.year || new Date().getFullYear(),
      bodyType: vehicleDetails?.bodyType || '',
      fuelType: vehicleDetails?.fuelType || '',
      transmission: vehicleDetails?.transmission || '',
      color: vehicleDetails?.color || '',
      mileage: vehicleDetails?.mileage || 0,
      vin: vehicleDetails?.vin || '',
    },
  });

  const selectedMake = watch('make');

  const makeOptions = mockFilterOptions.makes.map(m => ({ value: m, label: m }));

  const modelOptions = selectedMake && mockFilterOptions.models[selectedMake]
    ? mockFilterOptions.models[selectedMake].map(m => ({ value: m, label: m }))
    : [];

  const bodyTypeOptions = mockFilterOptions.bodyTypes.map(b => ({ value: b, label: b }));
  const fuelTypeOptions = mockFilterOptions.fuelTypes.map(f => ({ value: f, label: f }));
  const transmissionOptions = mockFilterOptions.transmissions.map(t => ({ value: t, label: t }));

  const onSubmit = (data: VehicleDetailsForm) => {
    const details: VehicleDetails = {
      plate: vehicleDetails?.plate || '',
      make: data.make,
      model: data.model,
      year: data.year,
      bodyType: data.bodyType,
      fuelType: data.fuelType,
      transmission: data.transmission,
      color: data.color,
      mileage: data.mileage,
      vin: data.vin,
    };
    setVehicleDetails(details);
    onNext();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Confirm your vehicle details
        </h1>
        <p className="text-gray-600">
          {vehicleDetails?.make
            ? 'We found these details - please verify and update if needed'
            : 'Enter your vehicle information'
          }
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Plate (read-only) */}
          {vehicleDetails?.plate && (
            <div className="p-3 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-500">Plate Number</p>
              <p className="text-lg font-bold tracking-wider">{vehicleDetails.plate}</p>
            </div>
          )}

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
                setValue('model', ''); // Reset model when make changes
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
              placeholder="e.g., 50000"
              {...register('mileage', { valueAsNumber: true })}
              error={errors.mileage?.message}
              helperText="Enter the current odometer reading"
            />
          </div>

          {/* VIN (optional) */}
          <Input
            label="VIN (Optional)"
            placeholder="17-character Vehicle Identification Number"
            {...register('vin')}
            error={errors.vin?.message}
            helperText="Found on the compliance plate or windscreen"
          />

          {/* Navigation */}
          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1">
              Back
            </Button>
            <Button type="submit" className="flex-1">
              Continue
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
