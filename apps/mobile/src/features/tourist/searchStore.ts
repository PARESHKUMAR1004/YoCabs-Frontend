import { create } from 'zustand';
import type { TripType, VehicleCategory } from '@yocabs/api-client';
import type { Place } from '@/shared/places';
import { initialDraft, MAX_STOPS, type SearchDraft } from './searchDraft';

export type PlaceField = 'pickup' | 'destination' | 'stop';

/** Set when the tourist picked a particular partner or cab from Explore: results narrow to it. */
export interface OnlyChoice {
  partnerId: string;
  partnerName: string;
  vehicleId?: string;
  vehicleLabel?: string;
}

interface SearchState extends SearchDraft {
  only: OnlyChoice | null;
  setOnly: (only: OnlyChoice | null) => void;
  setPlace: (field: PlaceField, place: Place) => void;
  removeStop: (index: number) => void;
  swapPlaces: () => void;
  setDates: (startDate: string, endDate?: string) => void;
  setVehicleCategory: (category: VehicleCategory | undefined) => void;
  setTripType: (tripType: TripType | undefined) => void;
  reset: () => void;
}

/** The search form. In memory only: a fresh app start begins a fresh search. */
export const useSearchStore = create<SearchState>((set) => ({
  ...initialDraft(),
  only: null,

  setOnly: (only) => set({ only }),

  setPlace: (field, place) =>
    set((state) => {
      if (field === 'pickup') return { pickup: place };
      if (field === 'destination') return { destination: place };
      return state.stops.length < MAX_STOPS ? { stops: [...state.stops, place] } : {};
    }),

  removeStop: (index) => set((state) => ({ stops: state.stops.filter((_, i) => i !== index) })),

  swapPlaces: () => set((state) => ({ pickup: state.destination, destination: state.pickup })),

  setDates: (startDate, endDate) =>
    set((state) => {
      const end = endDate ?? state.endDate;
      // Moving the start past the end drags the end along.
      return { startDate, endDate: end < startDate ? startDate : end };
    }),

  setVehicleCategory: (vehicleCategory) => set({ vehicleCategory }),
  setTripType: (tripType) => set({ tripType }),
  reset: () => set({ ...initialDraft(), only: null }),
}));

/** The draft part of the store as a plain object. */
export function selectDraft(state: SearchState): SearchDraft {
  return {
    pickup: state.pickup,
    destination: state.destination,
    stops: state.stops,
    startDate: state.startDate,
    endDate: state.endDate,
    vehicleCategory: state.vehicleCategory,
    tripType: state.tripType,
  };
}
