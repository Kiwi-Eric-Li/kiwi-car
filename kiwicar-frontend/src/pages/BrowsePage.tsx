import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Grid, List, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/utils';
import { useListings, countActiveFilters } from '@/hooks/useListings';
import { useFilterStore } from '@/stores/filterStore';
import Button from '@/components/common/Button';
import Select from '@/components/common/Select';
import { SkeletonCard } from '@/components/common';
import { ListingCard, FilterPanel, SearchBar } from '@/components/features';
import type { SortOption } from '@/types';

const sortOptions = [
  { value: 'newest', label: 'Newest Listed' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'mileage_asc', label: 'Lowest Mileage' },
  { value: 'year_desc', label: 'Newest Year' },
];

export default function BrowsePage() {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { filters, setFilter, loadFromQueryString } = useFilterStore();
  const { listings, isLoading, total } = useListings();
  const activeFilterCount = countActiveFilters(filters);

  // Load filters from URL on mount
  useEffect(() => {
    loadFromQueryString(searchParams.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter('sortBy', e.target.value as SortOption);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SearchBar
            placeholder="Search make, model, or keyword..."
            className="max-w-2xl mx-auto"
          />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-20">
              <FilterPanel className="rounded-xl border border-gray-200 shadow-sm" />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {total} Cars Available
                </h1>
                {activeFilterCount > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} applied
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <Button
                  variant="outline"
                  className="lg:hidden"
                  onClick={() => setShowMobileFilters(true)}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>

                {/* Sort */}
                <Select
                  options={sortOptions}
                  value={filters.sortBy || 'newest'}
                  onChange={handleSortChange}
                  className="w-44"
                />

                {/* View Toggle */}
                <div className="hidden sm:flex items-center border border-gray-300 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'p-1.5 rounded',
                      viewMode === 'grid'
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-400 hover:text-gray-600'
                    )}
                    aria-label="Grid view"
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'p-1.5 rounded',
                      viewMode === 'list'
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-400 hover:text-gray-600'
                    )}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Listings Grid/List */}
            {isLoading ? (
              <div
                className={cn(
                  'grid gap-4',
                  viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                    : 'grid-cols-1'
                )}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">No cars found matching your criteria.</p>
                <p className="text-gray-400 mt-2">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <div
                className={cn(
                  'grid gap-4',
                  viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                    : 'grid-cols-1'
                )}
              >
                {listings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    variant={viewMode}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setShowMobileFilters(false)}
          />

          {/* Drawer */}
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl">
            <FilterPanel
              isMobile
              onClose={() => setShowMobileFilters(false)}
              className="h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
