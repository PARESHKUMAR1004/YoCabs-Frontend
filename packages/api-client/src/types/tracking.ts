import type { IsoInstant, Uuid } from './common';

/** A driver's latest known position on a trip in progress. */
export interface TripLocation {
  bookingId: Uuid;
  latitude: number;
  longitude: number;
  accuracyMetres: number | null;
  speedKph: number | null;
  recordedAt: IsoInstant;
  /** How far the car still has to go, by road, when the API could work it out. */
  remainingDistanceKm?: number | null;
  remainingMinutes?: number | null;
  /** The whole journey's length, so an app can show progress. */
  tripDistanceKm?: number | null;
}

export interface ReportLocationInput {
  latitude: number;
  longitude: number;
  accuracyMetres?: number;
  speedKph?: number;
}

/** One end point or stop of a booked journey. Coordinates are absent if the trip was booked without them. */
export interface RoutePlace {
  description: string;
  latitude: number | null;
  longitude: number | null;
}

/** The journey a booking covers, for drawing on a map. */
export interface TripRoute {
  pickup: RoutePlace;
  stops: RoutePlace[];
  destination: RoutePlace;
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
