import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, X, Bell, BellOff, ArrowUpDown } from 'lucide-react';
import { cn } from '@/utils';
import { formatPrice, formatRelativeTime } from '@/utils/format';
import { useFavorites } from '@/hooks/useFavorites';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import { PageSpinner } from '@/components/common';

type SortOption = 'date_desc' | 'date_asc' | 'price_asc' | 'price_desc';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'date_desc', label: 'Recently Saved' },
  { value: 'date_asc', label: 'Oldest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export default function FavoritesPage() {
  const { favorites, isLoading, removeFavorite, updateAlert } = useFavorites();
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Sort favorites
  const sortedFavorites = [...favorites].sort((a, b) => {
    switch (sortBy) {
      case 'date_desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'date_asc':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'price_asc':
        return (a.listing?.price || 0) - (b.listing?.price || 0);
      case 'price_desc':
        return (b.listing?.price || 0) - (a.listing?.price || 0);
      default:
        return 0;
    }
  });

  const handleRemove = async (listingId: string) => {
    setRemovingId(listingId);
    await removeFavorite(listingId);
    setRemovingId(null);
  };

  const handleToggleAlert = async (listingId: string, currentAlert: boolean) => {
    await updateAlert(listingId, !currentAlert);
  };

  if (isLoading) {
    return <PageSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Saved Listings</h1>
            <p className="text-gray-500 mt-1">
              {favorites.length} {favorites.length === 1 ? 'car' : 'cars'} saved
            </p>
          </div>

          {/* Sort Dropdown */}
          {favorites.length > 0 && (
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Empty State */}
        {favorites.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No saved listings yet</p>
            <p className="text-gray-400 mb-6">
              Browse cars and tap the heart icon to save them here
            </p>
            <Link to="/buy">
              <Button>Browse Cars</Button>
            </Link>
          </div>
        ) : (
          /* Favorites Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedFavorites.map((favorite) => (
              <FavoriteCard
                key={favorite.id}
                favorite={favorite}
                isRemoving={removingId === favorite.listingId}
                onRemove={() => handleRemove(favorite.listingId)}
                onToggleAlert={() =>
                  handleToggleAlert(favorite.listingId, favorite.priceAlert)
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface FavoriteCardProps {
  favorite: {
    id: string;
    listingId: string;
    listing: {
      id: string;
      title: string;
      price: number;
      coverImage: string | null;
      status: string;
    } | null;
    priceAlert: boolean;
    targetPrice: number | null;
    createdAt: string;
  };
  isRemoving: boolean;
  onRemove: () => void;
  onToggleAlert: () => void;
}

function FavoriteCard({ favorite, isRemoving, onRemove, onToggleAlert }: FavoriteCardProps) {
  const { listing, priceAlert, createdAt } = favorite;

  const isUnavailable = !listing || listing.status === 'SOLD' || listing.status === 'REMOVED';

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200 overflow-hidden transition-opacity',
        isRemoving && 'opacity-50',
        isUnavailable && 'opacity-75'
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3]">
        {listing ? (
          <Link to={`/buy/${listing.id}`}>
            {listing.coverImage ? (
              <img
                src={listing.coverImage}
                alt={listing.title}
                className={cn(
                  'w-full h-full object-cover',
                  isUnavailable && 'grayscale'
                )}
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">No Image</span>
              </div>
            )}
          </Link>
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">Listing Removed</span>
          </div>
        )}

        {/* Status Badge */}
        {listing?.status === 'SOLD' && (
          <div className="absolute top-2 left-2">
            <Badge variant="danger">Sold</Badge>
          </div>
        )}
        {listing?.status === 'REMOVED' && (
          <div className="absolute top-2 left-2">
            <Badge variant="default">Removed</Badge>
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={onToggleAlert}
            className={cn(
              'p-2 rounded-full transition-colors',
              priceAlert
                ? 'bg-primary-500 text-white'
                : 'bg-white/90 text-gray-600 hover:bg-white'
            )}
            title={priceAlert ? 'Price alert on' : 'Set price alert'}
          >
            {priceAlert ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={onRemove}
            disabled={isRemoving}
            className="p-2 bg-white/90 rounded-full text-gray-600 hover:bg-white hover:text-red-500 transition-colors"
            title="Remove from saved"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {listing ? (
          <>
            <Link to={`/buy/${listing.id}`}>
              <h3 className="font-semibold text-gray-900 hover:text-primary-600 line-clamp-1">
                {listing.title}
              </h3>
            </Link>
            <p className="text-xl font-bold text-primary-600 mt-1">
              {formatPrice(listing.price)}
            </p>
          </>
        ) : (
          <>
            <h3 className="font-semibold text-gray-400">Listing Unavailable</h3>
            <p className="text-gray-400 mt-1">This listing is no longer available</p>
          </>
        )}

        <p className="text-xs text-gray-400 mt-2">
          Saved {formatRelativeTime(createdAt)}
        </p>

        {priceAlert && favorite.targetPrice && (
          <div className="mt-2 text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded inline-block">
            Alert when below {formatPrice(favorite.targetPrice)}
          </div>
        )}
      </div>
    </div>
  );
}
