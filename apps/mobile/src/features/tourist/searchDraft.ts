import type { TripSearchRequest, TripType, VehicleCategory } from '@yocabs/api-client';
import type { Place } from '@/shared/places';
import { addDays, toIsoDate } from '@/shared/utils/format';

/** What the tourist has typed into the search form so far. */
export interface SearchDraft {
  pickup: Place | null;
  destination: Place | null;
  stops: Place[];
  startDate: string;
  endDate: string;
  vehicleCategory?: VehicleCategory;
  tripType?: TripType;
}

/**
 * The trip API still takes a passenger count, but the tourist is not asked: every search and
 * request says one, so no vehicle is filtered out by seats.
 */
export const DEFAULT_PASSENGERS = 1;
export const MAX_STOPS = 5;

export function initialDraft(today: Date = new Date()): SearchDraft {
  const start = toIsoDate(today);
  return {
    pickup: null,
    destination: null,
    stops: [],
    startDate: start,
    endDate: start,
  };
}

/** Returns the first problem with the draft as a person-readable message, or null when it is ready. */
export function validateDraft(
  draft: SearchDraft,
  today: string = toIsoDate(new Date()),
): string | null {
  if (!draft.pickup) return 'Choose where you want to be picked up.';
  if (!draft.destination) return 'Choose where you want to go.';
  if (draft.pickup.id === draft.destination.id)
    return 'Pickup and destination cannot be the same place.';
  if (draft.startDate < today) return 'The travel date cannot be in the past.';
  if (draft.endDate < draft.startDate) return 'The return date cannot be before the start date.';
  return null;
}

const toLocation = (place: Place) => ({
  description: place.name,
  latitude: place.latitude,
  longitude: place.longitude,
});

/** The search API request for a draft that passed validateDraft. */
export function toSearchRequest(draft: SearchDraft): TripSearchRequest {
  if (!draft.pickup || !draft.destination) throw new Error('Draft is not ready to search');

  return {
    pickup: toLocation(draft.pickup),
    destination: toLocation(draft.destination),
    stops: draft.stops.map(toLocation),
    startDate: draft.startDate,
    endDate: draft.endDate,
    passengerCount: DEFAULT_PASSENGERS,
    vehicleCategory: draft.vehicleCategory,
    tripType: draft.tripType,
  };
}

/** Same journey (places, stops, dates)? Used to decide whether a trip request can be reused. */
export function isSameTrip(a: SearchDraft | null, b: SearchDraft | null): boolean {
  if (!a || !b) return false;
  return (
    a.pickup?.id === b.pickup?.id &&
    a.destination?.id === b.destination?.id &&
    a.startDate === b.startDate &&
    a.endDate === b.endDate &&
    a.stops.map((s) => s.id).join('|') === b.stops.map((s) => s.id).join('|')
  );
}

export function tripBrief(draft: SearchDraft): string {
  return `${draft.pickup?.name ?? 'Pickup'} to ${draft.destination?.name ?? 'destination'}`;
}

export { addDays };
