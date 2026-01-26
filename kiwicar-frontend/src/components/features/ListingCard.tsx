import { Link } from 'react-router-dom';
import { Heart, MapPin, Calendar, Gauge, Fuel, Settings2 } from 'lucide-react';
import { cn } from '@/utils';
import { formatPrice, formatMileage, formatRelativeTime } from '@/utils/format';
import Badge from '@/components/common/Badge';
import type { ListingCard as ListingCardType } from '@/types';

interface ListingCardProps {
  listing: ListingCardType;
  onFavoriteToggle?: (id: string) => void;
  variant?: 'grid' | 'list';
}

export default function ListingCard({
  listing,
  onFavoriteToggle,
  variant = 'grid',
}: ListingCardProps) {
  const priceRatingColors = {
    good: 'success',
    fair: 'warning',
    above: 'danger',
  } as const;

  const priceRatingLabels = {
    good: 'Good Deal',
    fair: 'Fair Price',
    above: 'Above Market',
  };

  if (variant === 'list') {
    return (
      <Link
        to={`/buy/${listing.id}`}
        className="flex bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
      >
        {/* Image */}
        <div className="relative w-48 md:w-64 flex-shrink-0">
          <img
            src={listing.image}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
          {listing.priceRating && (
            <Badge
              variant={priceRatingColors[listing.priceRating]}
              className="absolute top-2 left-2"
            >
              {priceRatingLabels[listing.priceRating]}
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{listing.title}</h3>
              <p className="text-2xl font-bold text-primary-600 mt-1">
                {formatPrice(listing.price)}
                {listing.negotiable && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    Negotiable
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                onFavoriteToggle?.(listing.id);
              }}
              className={cn(
                'p-2 rounded-full transition-colors',
                listing.isFavorite
                  ? 'text-red-500 bg-red-50'
                  : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'
              )}
              aria-label={listing.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={cn('h-5 w-5', listing.isFavorite && 'fill-current')} />
            </button>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {listing.year}
            </span>
            <span className="flex items-center gap-1">
              <Gauge className="h-4 w-4" />
              {formatMileage(listing.mileage)}
            </span>
            <span className="flex items-center gap-1">
              <Fuel className="h-4 w-4" />
              {listing.fuelType}
            </span>
            <span className="flex items-center gap-1">
              <Settings2 className="h-4 w-4" />
              {listing.transmission}
            </span>
          </div>

          <div className="mt-auto pt-3 flex items-center justify-between text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {listing.location}
            </span>
            <span>{formatRelativeTime(listing.createdAt)}</span>
          </div>
        </div>
      </Link>
    );
  }

  // Grid variant (default)
  return (
    <Link
      to={`/buy/${listing.id}`}
      className="block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className="relative aspect-[4/3]">
        <img
          src={listing.image}
          alt={listing.title}
          className="w-full h-full object-cover"
        />
        {listing.priceRating && (
          <Badge
            variant={priceRatingColors[listing.priceRating]}
            className="absolute top-2 left-2"
          >
            {priceRatingLabels[listing.priceRating]}
          </Badge>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            onFavoriteToggle?.(listing.id);
          }}
          className={cn(
            'absolute top-2 right-2 p-2 rounded-full bg-white/90 backdrop-blur-sm transition-colors',
            listing.isFavorite
              ? 'text-red-500'
              : 'text-gray-400 hover:text-red-500'
          )}
          aria-label={listing.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={cn('h-5 w-5', listing.isFavorite && 'fill-current')} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate">{listing.title}</h3>
        <p className="text-xl font-bold text-primary-600 mt-1">
          {formatPrice(listing.price)}
          {listing.negotiable && (
            <span className="text-xs font-normal text-gray-500 ml-1">
              Neg.
            </span>
          )}
        </p>

        <div className="flex flex-wrap gap-2 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {listing.year}
          </span>
          <span className="flex items-center gap-1">
            <Gauge className="h-3 w-3" />
            {formatMileage(listing.mileage)}
          </span>
          <span>{listing.fuelType}</span>
          <span>{listing.transmission}</span>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {listing.location}
          </span>
          <span>{formatRelativeTime(listing.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
