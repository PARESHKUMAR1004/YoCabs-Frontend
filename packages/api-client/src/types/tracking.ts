import type { IsoInstant, Uuid } from './common';

/** A driver's latest known position on a trip in progress. */
export interface TripLocation {
  bookingId: Uuid;
  latitude: number;
  longitude: number;
  accuracyMetres: number | null;
  speedKph: number | null;
  recordedAt: IsoInstant;
}

export interface ReportLocationInput {
  latitude: number;
  longitude: number;
  accuracyMetres?: number;
  speedKph?: number;
}

/** A trip currently on the road, with its car's position when the driver is sharing one. */
export interface LiveTrip {
  bookingId: Uuid;
  travelPartnerId: Uuid;
  vehicleId: Uuid;
  driverId: Uuid | null;
  pickup: string;
  destination: string;
  location: TripLocation | null;
}
