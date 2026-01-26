import { useListingWizardStore } from '@/stores/listingWizardStore';
import Button from '@/components/common/Button';
import { ImageUploader } from '@/components/features';

interface Step3PhotosProps {
  onNext: () => void;
  onBack: () => void;
}

export default function Step3Photos({ onNext, onBack }: Step3PhotosProps) {
  const {
    photos,
    addPhoto,
    removePhoto,
    reorderPhotos,
    vehicleDetails,
  } = useListingWizardStore();

  const minPhotos = 3;
  const maxPhotos = 10;
  const canContinue = photos.length >= minPhotos;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Add photos of your {vehicleDetails?.make} {vehicleDetails?.model}
        </h1>
        <p className="text-gray-600">
          Great photos help your listing stand out. Add at least {minPhotos} photos (up to {maxPhotos}).
        </p>
      </div>

      <ImageUploader
        photos={photos}
        onAdd={addPhoto}
        onRemove={removePhoto}
        onReorder={reorderPhotos}
        minPhotos={minPhotos}
        maxPhotos={maxPhotos}
      />

      {/* Navigation */}
      <div className="flex gap-4 mt-8">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!canContinue}
          className="flex-1"
        >
          {canContinue
            ? 'Continue'
            : `Add ${minPhotos - photos.length} more photo${minPhotos - photos.length > 1 ? 's' : ''}`
          }
        </Button>
      </div>
    </div>
  );
}
