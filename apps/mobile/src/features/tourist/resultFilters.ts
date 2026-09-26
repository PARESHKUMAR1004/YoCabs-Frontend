import type { FacilityRef, SearchOption, VehicleCategory } from '@yocabs/api-client';
import { sortOptions, type SortMode } from './sortOptions';

/** What the tourist has narrowed the results down to. Every field has an "anything goes" value. */
export interface ResultFilters {
  sort: SortMode;
  categories: VehicleCategory[];
  /** 0 means any. Partners with no reviews yet never pass a rating filter. */
  minRating: number;
  /** 0 means any. */
  minSeats: number;
  maxPrice: number | null;
  /** A cab must have all of these. */
  facilityCodes: string[];
}

export const DEFAULT_FILTERS: ResultFilters = {
  sort: 'price',
  categories: [],
  minRating: 0,
  minSeats: 0,
  maxPrice: null,
  facilityCodes: [],
};

/** The options that pass the filters, in the chosen order. Never changes the list it is given. */
export function applyFilters(options: SearchOption[], filters: ResultFilters): SearchOption[] {
  const kept = options.filter(
    (option) =>
      (filters.categories.length === 0 || filters.categories.includes(option.category)) &&
      (filters.minRating === 0 || (option.reviewCount > 0 && option.rating >= filters.minRating)) &&
      option.passengerCapacity >= filters.minSeats &&
      (filters.maxPrice === null || option.price.totalAmount <= filters.maxPrice) &&
      filters.facilityCodes.every((code) =>
        option.facilities.some((facility) => facility.code === code),
      ),
  );

  return sortOptions(kept, filters.sort);
}

/** How many separate things have been changed from the default: the number on the Filters button. */
export function activeFilterCount(filters: ResultFilters): number {
  return [
    filters.sort !== DEFAULT_FILTERS.sort,
    filters.categories.length > 0,
    filters.minRating > 0,
    filters.minSeats > 0,
    filters.maxPrice !== null,
    filters.facilityCodes.length > 0,
  ].filter(Boolean).length;
}

/**
 * Price limits worth offering for these results: about a third, two thirds and all of the way
 * up, rounded up to a neat figure, so every choice keeps at least one cab.
 */
export function priceLimits(options: SearchOption[]): number[] {
  const prices = options.map((option) => option.price.totalAmount).sort((a, b) => a - b);
  if (prices.length < 2) return [];

  const at = (share: number) =>
    prices[Math.min(prices.length - 1, Math.floor(prices.length * share))];
  const neat = (amount: number) => Math.ceil(amount / 100) * 100;

  const limits = [at(0.34), at(0.67), prices[prices.length - 1]].map((price) => neat(price ?? 0));
  return [...new Set(limits)].filter((limit) => limit > 0);
}

/** The facilities offered by at least one cab in the results, by name. */
export function facilitiesIn(options: SearchOption[]): FacilityRef[] {
  const byCode = new Map<string, FacilityRef>();
  for (const option of options) {
    for (const facility of option.facilities) byCode.set(facility.code, facility);
  }
  return [...byCode.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** The vehicle types present in the results, in a stable order. */
export function categoriesIn(options: SearchOption[]): VehicleCategory[] {
  return [...new Set(options.map((option) => option.category))].sort();
}
