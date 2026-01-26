import { useState } from 'react';
import { X, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { cn } from '@/utils';
import { formatPrice } from '@/utils/format';
import { useFilterStore } from '@/stores/filterStore';
import { useFilterOptions, countActiveFilters } from '@/hooks/useListings';
import Button from '@/components/common/Button';
import Checkbox from '@/components/common/Checkbox';
import RangeSlider from '@/components/common/RangeSlider';

interface FilterPanelProps {
  className?: string;
  onClose?: () => void;
  isMobile?: boolean;
}

export default function FilterPanel({
  className,
  onClose,
  isMobile = false,
}: FilterPanelProps) {
  const { filters, setFilter, resetFilters } = useFilterStore();
  const { options } = useFilterOptions();
  const activeCount = countActiveFilters(filters);

  return (
    <div className={cn('bg-white', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-gray-900">Filters</h2>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
          {isMobile && (
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600"
              aria-label="Close filters"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter sections */}
      <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
        {/* Make */}
        <FilterSection title="Make" defaultOpen>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {options.makes.map((make) => (
              <Checkbox
                key={make}
                label={make}
                checked={filters.makes?.includes(make) || false}
                onChange={(e) => {
                  const current = filters.makes || [];
                  if (e.target.checked) {
                    setFilter('makes', [...current, make]);
                  } else {
                    setFilter('makes', current.filter((m) => m !== make));
                  }
                }}
              />
            ))}
          </div>
        </FilterSection>

        {/* Price Range */}
        <FilterSection title="Price Range" defaultOpen>
          <RangeSlider
            min={0}
            max={100000}
            step={1000}
            value={[filters.priceMin, filters.priceMax]}
            onChange={([min, max]) => {
              setFilter('priceMin', min);
              setFilter('priceMax', max);
            }}
            formatValue={(v) => formatPrice(v)}
          />
        </FilterSection>

        {/* Year Range */}
        <FilterSection title="Year" defaultOpen>
          <RangeSlider
            min={1990}
            max={new Date().getFullYear()}
            step={1}
            value={[filters.yearMin, filters.yearMax]}
            onChange={([min, max]) => {
              setFilter('yearMin', min);
              setFilter('yearMax', max);
            }}
          />
        </FilterSection>

        {/* Mileage Range */}
        <FilterSection title="Mileage">
          <RangeSlider
            min={0}
            max={300000}
            step={5000}
            value={[filters.mileageMin, filters.mileageMax]}
            onChange={([min, max]) => {
              setFilter('mileageMin', min);
              setFilter('mileageMax', max);
            }}
            formatValue={(v) => `${(v / 1000).toFixed(0)}k km`}
          />
        </FilterSection>

        {/* Region */}
        <FilterSection title="Region">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {options.regions.map((region) => (
              <Checkbox
                key={region}
                label={region}
                checked={filters.regions?.includes(region) || false}
                onChange={(e) => {
                  const current = filters.regions || [];
                  if (e.target.checked) {
                    setFilter('regions', [...current, region]);
                  } else {
                    setFilter('regions', current.filter((r) => r !== region));
                  }
                }}
              />
            ))}
          </div>
        </FilterSection>

        {/* Fuel Type */}
        <FilterSection title="Fuel Type">
          <div className="space-y-2">
            {options.fuelTypes.map((fuel) => (
              <Checkbox
                key={fuel}
                label={fuel}
                checked={filters.fuelTypes?.includes(fuel) || false}
                onChange={(e) => {
                  const current = filters.fuelTypes || [];
                  if (e.target.checked) {
                    setFilter('fuelTypes', [...current, fuel]);
                  } else {
                    setFilter('fuelTypes', current.filter((f) => f !== fuel));
                  }
                }}
              />
            ))}
          </div>
        </FilterSection>

        {/* Transmission */}
        <FilterSection title="Transmission">
          <div className="space-y-2">
            {options.transmissions.map((trans) => (
              <Checkbox
                key={trans}
                label={trans}
                checked={filters.transmissions?.includes(trans) || false}
                onChange={(e) => {
                  const current = filters.transmissions || [];
                  if (e.target.checked) {
                    setFilter('transmissions', [...current, trans]);
                  } else {
                    setFilter('transmissions', current.filter((t) => t !== trans));
                  }
                }}
              />
            ))}
          </div>
        </FilterSection>

        {/* Body Type */}
        <FilterSection title="Body Type">
          <div className="space-y-2">
            {options.bodyTypes.map((body) => (
              <Checkbox
                key={body}
                label={body}
                checked={filters.bodyTypes?.includes(body) || false}
                onChange={(e) => {
                  const current = filters.bodyTypes || [];
                  if (e.target.checked) {
                    setFilter('bodyTypes', [...current, body]);
                  } else {
                    setFilter('bodyTypes', current.filter((b) => b !== body));
                  }
                }}
              />
            ))}
          </div>
        </FilterSection>
      </div>

      {/* Mobile Apply Button */}
      {isMobile && (
        <div className="p-4 border-t border-gray-200">
          <Button fullWidth onClick={onClose}>
            Show Results
          </Button>
        </div>
      )}
    </div>
  );
}

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({ title, children, defaultOpen = false }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900">{title}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
