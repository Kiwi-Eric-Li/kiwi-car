import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Share2,
  MapPin,
  Calendar,
  Gauge,
  Fuel,
  Settings2,
  User,
  MessageCircle,
  ChevronRight,
  CheckCircle,
  Flag,
} from 'lucide-react';
import { cn } from '@/utils';
import { formatPrice, formatMileage, formatDate, formatRelativeTime } from '@/utils/format';
import { useListing, useSimilarListings } from '@/hooks/useListings';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Card, { CardTitle, CardContent } from '@/components/common/Card';
import Modal from '@/components/common/Modal';
import { PageSpinner } from '@/components/common';
import { ImageGallery, ListingCard, VehicleInfoCard } from '@/components/features';

export default function ListingDetailPage() {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const { listing, isLoading, isError } = useListing(listingId || '');
  const { listings: similarListings } = useSimilarListings(listingId || '');
  const { isAuthenticated } = useAuthStore();
  const { isFavorite: checkIsFavorite, toggleFavorite } = useFavorites();

  const [showContactModal, setShowContactModal] = useState(false);
  const [showVehicleInfo, setShowVehicleInfo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isFavorite = listingId ? checkIsFavorite(listingId) : false;

  if (isLoading) {
    return <PageSpinner />;
  }

  if (isError || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Listing Not Found</h1>
          <p className="text-gray-500 mb-4">This listing may have been removed or sold.</p>
          <Link to="/buy">
            <Button>Browse All Cars</Button>
          </Link>
        </div>
      </div>
    );
  }

  const priceAnalysis = listing.priceAnalysis;

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/buy/${listingId}` } });
      return;
    }
    if (!listingId || isSaving) return;

    setIsSaving(true);
    const result = await toggleFavorite(listingId);
    setIsSaving(false);

    if (result.requiresAuth) {
      navigate('/login', { state: { from: `/buy/${listingId}` } });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${listing.year} ${listing.make} ${listing.model}`,
        text: `Check out this ${listing.make} ${listing.model} on KiwiCar!`,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      // Show toast
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/buy" className="hover:text-gray-700">
            Buy
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to={`/buy?makes=${listing.make}`} className="hover:text-gray-700">
            {listing.make}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900">{listing.model}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <ImageGallery
              images={listing.images}
              alt={`${listing.year} ${listing.make} ${listing.model}`}
            />

            {/* Title & Price (Mobile) */}
            <div className="lg:hidden">
              <h1 className="text-2xl font-bold text-gray-900">
                {listing.year} {listing.make} {listing.model}
              </h1>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold text-primary-600">
                  {formatPrice(listing.price)}
                </span>
                {listing.negotiable && (
                  <span className="text-sm text-gray-500">Negotiable</span>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard icon={Calendar} label="Year" value={String(listing.year)} />
              <StatCard icon={Gauge} label="Mileage" value={formatMileage(listing.mileage)} />
              <StatCard icon={Fuel} label="Fuel" value={listing.fuelType} />
              <StatCard icon={Settings2} label="Transmission" value={listing.transmission} />
            </div>

            {/* Description */}
            <Card>
              <CardTitle className="mb-4">Description</CardTitle>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line">{listing.description}</p>
                {listing.aiDescription && (
                  <div className="mt-4 p-4 bg-primary-50 rounded-lg">
                    <p className="text-sm font-medium text-primary-800 mb-2">
                      AI Summary
                    </p>
                    <p className="text-sm text-primary-700">{listing.aiDescription}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vehicle Details */}
            <Card>
              <CardTitle className="mb-4">Vehicle Details</CardTitle>
              <CardContent>
                <dl className="grid grid-cols-2 gap-4">
                  <DetailRow label="Make" value={listing.make} />
                  <DetailRow label="Model" value={listing.model} />
                  <DetailRow label="Year" value={String(listing.year)} />
                  <DetailRow label="Body Type" value={listing.bodyType} />
                  <DetailRow label="Fuel Type" value={listing.fuelType} />
                  <DetailRow label="Transmission" value={listing.transmission} />
                  <DetailRow label="Color" value={listing.color} />
                  <DetailRow label="Mileage" value={formatMileage(listing.mileage)} />
                  <DetailRow label="Location" value={listing.region} />
                </dl>
              </CardContent>
            </Card>

            {/* NZTA Vehicle Check */}
            {listing.vehicleInfo && (
              <Card padding="none">
                <button
                  onClick={() => setShowVehicleInfo(!showVehicleInfo)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">NZTA Vehicle Check</p>
                      <p className="text-sm text-gray-500">
                        WOF & Registration status, odometer history
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className={cn(
                      'h-5 w-5 text-gray-400 transition-transform',
                      showVehicleInfo && 'rotate-90'
                    )}
                  />
                </button>
                {showVehicleInfo && (
                  <div className="border-t border-gray-200">
                    <VehicleInfoCard vehicle={listing.vehicleInfo} />
                  </div>
                )}
              </Card>
            )}

            {/* AI Price Analysis */}
            {priceAnalysis && (
              <Card>
                <CardTitle className="mb-4 flex items-center gap-2">
                  AI Price Analysis
                  <Badge variant={
                    priceAnalysis.rating === 'good' ? 'success' :
                    priceAnalysis.rating === 'fair' ? 'warning' : 'danger'
                  }>
                    {priceAnalysis.rating === 'good' ? 'Good Deal' :
                     priceAnalysis.rating === 'fair' ? 'Fair Price' : 'Above Market'}
                  </Badge>
                </CardTitle>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Low</p>
                      <p className="font-semibold text-gray-900">
                        {formatPrice(priceAnalysis.suggestedMin)}
                      </p>
                    </div>
                    <div className="flex-1 mx-4 h-2 bg-gray-200 rounded-full relative">
                      <div
                        className="absolute h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full"
                        style={{ width: '100%' }}
                      />
                      <div
                        className="absolute w-3 h-3 bg-white border-2 border-gray-800 rounded-full -top-0.5"
                        style={{
                          left: `${Math.min(
                            100,
                            Math.max(
                              0,
                              ((listing.price - priceAnalysis.suggestedMin) /
                                (priceAnalysis.suggestedMax - priceAnalysis.suggestedMin)) *
                                100
                            )
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">High</p>
                      <p className="font-semibold text-gray-900">
                        {formatPrice(priceAnalysis.suggestedMax)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{priceAnalysis.explanation}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price & Actions Card (Desktop) */}
            <Card className="hidden lg:block sticky top-20">
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                {listing.year} {listing.make} {listing.model}
              </h1>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-primary-600">
                  {formatPrice(listing.price)}
                </span>
                {listing.negotiable && (
                  <span className="text-sm text-gray-500">Negotiable</span>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <MapPin className="h-4 w-4" />
                {listing.region}
                <span className="mx-2">•</span>
                Listed {formatRelativeTime(listing.createdAt)}
              </div>

              <div className="space-y-3">
                <Button fullWidth size="lg" onClick={() => setShowContactModal(true)}>
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Contact Seller
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={handleFavoriteToggle}
                    className={cn(isFavorite && 'text-red-500 border-red-200 bg-red-50')}
                  >
                    <Heart className={cn('h-5 w-5 mr-2', isFavorite && 'fill-current')} />
                    {isFavorite ? 'Saved' : 'Save'}
                  </Button>
                  <Button variant="outline" fullWidth onClick={handleShare}>
                    <Share2 className="h-5 w-5 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Seller Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  {listing.sellerAvatar ? (
                    <img
                      src={listing.sellerAvatar}
                      alt={listing.sellerName}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{listing.sellerName}</p>
                    <p className="text-sm text-gray-500">
                      Member since {formatDate(listing.sellerJoinedDate)}
                    </p>
                  </div>
                </div>
              </div>

              <button className="mt-4 w-full text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1">
                <Flag className="h-4 w-4" />
                Report this listing
              </button>
            </Card>

            {/* Mobile Actions */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-30">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleFavoriteToggle}
                  className={cn(isFavorite && 'text-red-500 border-red-200')}
                >
                  <Heart className={cn('h-5 w-5', isFavorite && 'fill-current')} />
                </Button>
                <Button fullWidth onClick={() => setShowContactModal(true)}>
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Contact Seller
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Listings */}
        {similarListings.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Similar Listings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similarListings.map((similar) => (
                <ListingCard key={similar.id} listing={similar} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Contact Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title="Contact Seller"
      >
        {isAuthenticated ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              Send a message to {listing.sellerName} about the {listing.year} {listing.make}{' '}
              {listing.model}.
            </p>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 min-h-[120px] focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              placeholder="Hi, I'm interested in this car. Is it still available?"
              defaultValue={`Hi, I'm interested in your ${listing.year} ${listing.make} ${listing.model}. Is it still available?`}
            />
            <Button fullWidth>Send Message</Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">
              Please sign in to contact the seller.
            </p>
            <Link to="/login">
              <Button>Sign In</Button>
            </Link>
          </div>
        )}
      </Modal>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
      <Icon className="h-5 w-5 text-gray-400 mx-auto mb-2" />
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-2 border-b border-gray-100 last:border-0">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-900">{value}</dd>
    </div>
  );
}
