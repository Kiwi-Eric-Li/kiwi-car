import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  Edit2,
  MapPin,
  Calendar,
  Gauge,
  Fuel,
  Settings2,
  Image as ImageIcon,
  FileText,
  DollarSign,
  Share2,
  Copy,
  CheckCircle,
} from 'lucide-react';
import { formatPrice, formatMileage } from '@/utils/format';
import { useListingWizardStore } from '@/stores/listingWizardStore';
import { useToast } from '@/components/common/Toast';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Checkbox from '@/components/common/Checkbox';
import Modal from '@/components/common/Modal';
import Badge from '@/components/common/Badge';

interface Step6ReviewProps {
  onBack: () => void;
  onEditStep: (step: number) => void;
}

export default function Step6Review({ onBack, onEditStep }: Step6ReviewProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const {
    vehicleDetails,
    photos,
    description,
    price,
    negotiable,
    region,
    reset,
  } = useListingWizardStore();

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [publishedListingId, setPublishedListingId] = useState<string | null>(null);

  const canPublish = acceptedTerms && vehicleDetails && photos.length >= 3 && description && price && region;

  const handlePublish = async () => {
    if (!canPublish) return;

    setIsPublishing(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate mock listing ID
    const listingId = Math.random().toString(36).slice(2, 10);
    setPublishedListingId(listingId);
    setIsPublishing(false);
    setShowSuccessModal(true);
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/buy/${publishedListingId}`;
    await navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const handleViewListing = () => {
    reset();
    navigate(`/buy/${publishedListingId}`);
  };

  const handleCreateAnother = () => {
    reset();
    setShowSuccessModal(false);
  };

  const handleGoHome = () => {
    reset();
    navigate('/buy');
  };

  if (!vehicleDetails) {
    return <div>Loading...</div>;
  }

  const title = `${vehicleDetails.year} ${vehicleDetails.make} ${vehicleDetails.model}`;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Review your listing
        </h1>
        <p className="text-gray-600">
          Make sure everything looks good before publishing
        </p>
      </div>

      {/* Preview Card */}
      <Card className="mb-6 overflow-hidden" padding="none">
        {/* Image Preview */}
        <div className="relative aspect-[16/9] bg-gray-100">
          {photos[0] && (
            <img
              src={photos[0].url}
              alt={title}
              className="w-full h-full object-cover"
            />
          )}
          <button
            onClick={() => onEditStep(3)}
            className="absolute top-3 right-3 p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 text-white text-sm rounded">
            <ImageIcon className="h-4 w-4 inline mr-1" />
            {photos.length} photos
          </div>
        </div>

        <div className="p-6">
          {/* Title & Price */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              <div className="flex items-center gap-2 mt-1 text-gray-500">
                <MapPin className="h-4 w-4" />
                {region}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary-600">{formatPrice(price!)}</p>
              {negotiable && (
                <Badge variant="default" size="sm">Negotiable</Badge>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 py-4 border-t border-b border-gray-200">
            <div className="text-center">
              <Calendar className="h-5 w-5 text-gray-400 mx-auto mb-1" />
              <p className="text-sm text-gray-500">Year</p>
              <p className="font-medium">{vehicleDetails.year}</p>
            </div>
            <div className="text-center">
              <Gauge className="h-5 w-5 text-gray-400 mx-auto mb-1" />
              <p className="text-sm text-gray-500">Mileage</p>
              <p className="font-medium">{formatMileage(vehicleDetails.mileage)}</p>
            </div>
            <div className="text-center">
              <Fuel className="h-5 w-5 text-gray-400 mx-auto mb-1" />
              <p className="text-sm text-gray-500">Fuel</p>
              <p className="font-medium">{vehicleDetails.fuelType}</p>
            </div>
            <div className="text-center">
              <Settings2 className="h-5 w-5 text-gray-400 mx-auto mb-1" />
              <p className="text-sm text-gray-500">Trans.</p>
              <p className="font-medium">{vehicleDetails.transmission}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Section Summaries */}
      <div className="space-y-4 mb-8">
        {/* Vehicle Details */}
        <ReviewSection
          icon={<Settings2 className="h-5 w-5" />}
          title="Vehicle Details"
          onEdit={() => onEditStep(2)}
        >
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Make</span>
              <span className="font-medium">{vehicleDetails.make}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Model</span>
              <span className="font-medium">{vehicleDetails.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Body Type</span>
              <span className="font-medium">{vehicleDetails.bodyType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Color</span>
              <span className="font-medium">{vehicleDetails.color}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Plate</span>
              <span className="font-medium">{vehicleDetails.plate || 'Not provided'}</span>
            </div>
            {vehicleDetails.vin && (
              <div className="flex justify-between">
                <span className="text-gray-500">VIN</span>
                <span className="font-medium">{vehicleDetails.vin}</span>
              </div>
            )}
          </div>
        </ReviewSection>

        {/* Photos */}
        <ReviewSection
          icon={<ImageIcon className="h-5 w-5" />}
          title={`Photos (${photos.length})`}
          onEdit={() => onEditStep(3)}
        >
          <div className="flex gap-2 overflow-x-auto pb-2">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden"
              >
                <img
                  src={photo.url}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </ReviewSection>

        {/* Description */}
        <ReviewSection
          icon={<FileText className="h-5 w-5" />}
          title="Description"
          onEdit={() => onEditStep(4)}
        >
          <p className="text-sm text-gray-700 line-clamp-3">{description}</p>
        </ReviewSection>

        {/* Price */}
        <ReviewSection
          icon={<DollarSign className="h-5 w-5" />}
          title="Price & Location"
          onEdit={() => onEditStep(5)}
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Asking Price</span>
            <span className="font-medium">
              {formatPrice(price!)} {negotiable && '(Negotiable)'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-500">Location</span>
            <span className="font-medium">{region}</span>
          </div>
        </ReviewSection>
      </div>

      {/* Terms & Publish */}
      <Card>
        <Checkbox
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          label={
            <>
              I confirm this listing is accurate and I agree to the{' '}
              <a href="#" className="text-primary-600 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary-600 hover:underline">
                Listing Guidelines
              </a>
            </>
          }
        />

        <div className="flex gap-4 mt-6">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button
            onClick={handlePublish}
            disabled={!canPublish}
            isLoading={isPublishing}
            className="flex-1"
          >
            <Check className="h-5 w-5 mr-2" />
            Publish Listing
          </Button>
        </div>
      </Card>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {}}
        showCloseButton={false}
        size="md"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your listing is live!
          </h2>
          <p className="text-gray-600 mb-6">
            Your {title} is now visible to buyers on KiwiCar.
          </p>

          {/* Share options */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Share your listing</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={handleCopyLink}>
                <Copy className="h-4 w-4 mr-1" />
                Copy Link
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={handleViewListing} fullWidth>
              View Your Listing
            </Button>
            <Button variant="ghost" onClick={handleCreateAnother}>
              Create Another Listing
            </Button>
            <Button variant="ghost" onClick={handleGoHome}>
              Go to Home
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

interface ReviewSectionProps {
  icon: React.ReactNode;
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}

function ReviewSection({ icon, title, onEdit, children }: ReviewSectionProps) {
  return (
    <Card className="overflow-hidden" padding="none">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2 font-medium text-gray-900">
          {icon}
          {title}
        </div>
        <button
          onClick={onEdit}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
        >
          <Edit2 className="h-4 w-4" />
          Edit
        </button>
      </div>
      <div className="p-4">{children}</div>
    </Card>
  );
}
