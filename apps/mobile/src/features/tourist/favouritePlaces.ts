import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import type { Place } from '@/shared/places';

const STORAGE_KEY = 'yocabs.favourite-places';
export const MAX_FAVOURITES = 10;

interface FavouritesState {
  places: Place[];
  hydrate: () => Promise<void>;
  toggle: (place: Place) => void;
}

const persist = (places: Place[]) =>
  SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(places)).catch(() => {
    // Favourites are a convenience: failing to save one must never interrupt a booking.
  });

/** Places the tourist starred. Kept on the device, most recently saved first. */
export const useFavouritePlaces = create<FavouritesState>((set, get) => ({
  places: [],

  hydrate: async () => {
    try {
      const raw = await SecureStore.getItemAsync(STORAGE_KEY);
      if (raw) set({ places: JSON.parse(raw) as Place[] });
    } catch {
      // Unreadable data is treated as no favourites.
    }
  },

  toggle: (place) => {
    const current = get().places;
    const next = current.some((saved) => saved.id === place.id)
      ? current.filter((saved) => saved.id !== place.id)
      : [place, ...current].slice(0, MAX_FAVOURITES);
    set({ places: next });
    void persist(next);
  },
}));

export const isFavourite = (places: Place[], id: string) => places.some((place) => place.id === id);
