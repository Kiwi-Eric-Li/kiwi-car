import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface VehicleDetails {
  plate: string;
  make: string;
  model: string;
  year: number;
  bodyType: string;
  fuelType: string;
  transmission: string;
  color: string;
  mileage: number;
  vin?: string;
}

export interface UploadedPhoto {
  id: string;
  url: string;
  file?: File;
  isUploading?: boolean;
}

interface ListingWizardState {
  // Current step (1-6)
  step: number;

  // Step 1: Plate lookup
  plateNumber: string;
  lookupComplete: boolean;

  // Step 2: Vehicle details
  vehicleDetails: VehicleDetails | null;

  // Step 3: Photos
  photos: UploadedPhoto[];

  // Step 4: Description
  description: string;
  aiDescriptionGenerated: boolean;

  // Step 5: Pricing
  price: number | null;
  negotiable: boolean;
  region: string;

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  setPlateNumber: (plate: string) => void;
  setLookupComplete: (complete: boolean) => void;

  setVehicleDetails: (details: VehicleDetails) => void;
  updateVehicleDetail: <K extends keyof VehicleDetails>(key: K, value: VehicleDetails[K]) => void;

  addPhoto: (photo: UploadedPhoto) => void;
  removePhoto: (id: string) => void;
  reorderPhotos: (fromIndex: number, toIndex: number) => void;
  updatePhoto: (id: string, updates: Partial<UploadedPhoto>) => void;

  setDescription: (description: string) => void;
  setAiDescriptionGenerated: (generated: boolean) => void;

  setPrice: (price: number | null) => void;
  setNegotiable: (negotiable: boolean) => void;
  setRegion: (region: string) => void;

  reset: () => void;

  // Validation helpers
  canProceedToStep: (step: number) => boolean;
}

const initialState = {
  step: 1,
  plateNumber: '',
  lookupComplete: false,
  vehicleDetails: null,
  photos: [],
  description: '',
  aiDescriptionGenerated: false,
  price: null,
  negotiable: false,
  region: '',
};

export const useListingWizardStore = create<ListingWizardState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStep: (step) => set({ step }),

      nextStep: () => set((state) => ({ step: Math.min(state.step + 1, 6) })),

      prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),

      setPlateNumber: (plate) => set({ plateNumber: plate.toUpperCase() }),

      setLookupComplete: (complete) => set({ lookupComplete: complete }),

      setVehicleDetails: (details) => set({ vehicleDetails: details }),

      updateVehicleDetail: (key, value) =>
        set((state) => ({
          vehicleDetails: state.vehicleDetails
            ? { ...state.vehicleDetails, [key]: value }
            : null,
        })),

      addPhoto: (photo) =>
        set((state) => ({
          photos: state.photos.length < 10 ? [...state.photos, photo] : state.photos,
        })),

      removePhoto: (id) =>
        set((state) => ({
          photos: state.photos.filter((p) => p.id !== id),
        })),

      reorderPhotos: (fromIndex, toIndex) =>
        set((state) => {
          const photos = [...state.photos];
          const [removed] = photos.splice(fromIndex, 1);
          photos.splice(toIndex, 0, removed);
          return { photos };
        }),

      updatePhoto: (id, updates) =>
        set((state) => ({
          photos: state.photos.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      setDescription: (description) => set({ description }),

      setAiDescriptionGenerated: (generated) => set({ aiDescriptionGenerated: generated }),

      setPrice: (price) => set({ price }),

      setNegotiable: (negotiable) => set({ negotiable }),

      setRegion: (region) => set({ region }),

      reset: () => set(initialState),

      canProceedToStep: (targetStep) => {
        const state = get();

        // Can always go back
        if (targetStep < state.step) return true;

        // Check requirements for each step
        switch (targetStep) {
          case 2:
            return state.lookupComplete && state.vehicleDetails !== null;
          case 3:
            return (
              state.vehicleDetails !== null &&
              state.vehicleDetails.make !== '' &&
              state.vehicleDetails.model !== '' &&
              state.vehicleDetails.mileage > 0
            );
          case 4:
            return state.photos.length >= 3;
          case 5:
            return state.description.length >= 50;
          case 6:
            return (
              state.price !== null &&
              state.price > 0 &&
              state.region !== ''
            );
          default:
            return true;
        }
      },
    }),
    {
      name: 'kiwicar-listing-wizard',
      partialize: (state) => ({
        step: state.step,
        plateNumber: state.plateNumber,
        lookupComplete: state.lookupComplete,
        vehicleDetails: state.vehicleDetails,
        // Don't persist photos (they contain File objects)
        description: state.description,
        aiDescriptionGenerated: state.aiDescriptionGenerated,
        price: state.price,
        negotiable: state.negotiable,
        region: state.region,
      }),
    }
  )
);
