import { create } from 'zustand';
import type { ListingFilters, SortOption } from '@/types';

interface FilterState {
  filters: ListingFilters;
  setFilter: <K extends keyof ListingFilters>(key: K, value: ListingFilters[K]) => void;
  setFilters: (filters: Partial<ListingFilters>) => void;
  resetFilters: () => void;
  filtersToQueryString: () => string;
  loadFromQueryString: (queryString: string) => void;
}

const defaultFilters: ListingFilters = {
  keyword: '',
  makes: [],
  models: [],
  priceMin: undefined,
  priceMax: undefined,
  yearMin: undefined,
  yearMax: undefined,
  mileageMin: undefined,
  mileageMax: undefined,
  regions: [],
  fuelTypes: [],
  transmissions: [],
  bodyTypes: [],
  sortBy: 'newest',
};

export const useFilterStore = create<FilterState>((set, get) => ({
  filters: { ...defaultFilters },

  setFilter: (key, value) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    }));
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...newFilters,
      },
    }));
  },

  resetFilters: () => {
    set({ filters: { ...defaultFilters } });
  },

  filtersToQueryString: () => {
    const { filters } = get();
    const params = new URLSearchParams();

    if (filters.keyword) params.set('q', filters.keyword);
    if (filters.makes?.length) params.set('makes', filters.makes.join(','));
    if (filters.models?.length) params.set('models', filters.models.join(','));
    if (filters.priceMin) params.set('priceMin', String(filters.priceMin));
    if (filters.priceMax) params.set('priceMax', String(filters.priceMax));
    if (filters.yearMin) params.set('yearMin', String(filters.yearMin));
    if (filters.yearMax) params.set('yearMax', String(filters.yearMax));
    if (filters.mileageMin) params.set('mileageMin', String(filters.mileageMin));
    if (filters.mileageMax) params.set('mileageMax', String(filters.mileageMax));
    if (filters.regions?.length) params.set('regions', filters.regions.join(','));
    if (filters.fuelTypes?.length) params.set('fuelTypes', filters.fuelTypes.join(','));
    if (filters.transmissions?.length) params.set('transmissions', filters.transmissions.join(','));
    if (filters.bodyTypes?.length) params.set('bodyTypes', filters.bodyTypes.join(','));
    if (filters.sortBy && filters.sortBy !== 'newest') params.set('sort', filters.sortBy);

    return params.toString();
  },

  loadFromQueryString: (queryString: string) => {
    const params = new URLSearchParams(queryString);
    const filters: ListingFilters = { ...defaultFilters };

    const keyword = params.get('q');
    if (keyword) filters.keyword = keyword;

    const makes = params.get('makes');
    if (makes) filters.makes = makes.split(',');

    const models = params.get('models');
    if (models) filters.models = models.split(',');

    const priceMin = params.get('priceMin');
    if (priceMin) filters.priceMin = Number(priceMin);

    const priceMax = params.get('priceMax');
    if (priceMax) filters.priceMax = Number(priceMax);

    const yearMin = params.get('yearMin');
    if (yearMin) filters.yearMin = Number(yearMin);

    const yearMax = params.get('yearMax');
    if (yearMax) filters.yearMax = Number(yearMax);

    const mileageMin = params.get('mileageMin');
    if (mileageMin) filters.mileageMin = Number(mileageMin);

    const mileageMax = params.get('mileageMax');
    if (mileageMax) filters.mileageMax = Number(mileageMax);

    const regions = params.get('regions');
    if (regions) filters.regions = regions.split(',');

    const fuelTypes = params.get('fuelTypes');
    if (fuelTypes) filters.fuelTypes = fuelTypes.split(',');

    const transmissions = params.get('transmissions');
    if (transmissions) filters.transmissions = transmissions.split(',');

    const bodyTypes = params.get('bodyTypes');
    if (bodyTypes) filters.bodyTypes = bodyTypes.split(',');

    const sortBy = params.get('sort');
    if (sortBy) filters.sortBy = sortBy as SortOption;

    set({ filters });
  },
}));
