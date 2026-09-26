import type { Uuid, VehicleCategory } from './common';
import type { FacilityRef } from './trip';

/** A travel partner with vehicles working around a place. */
export interface ExplorePartner {
  id: Uuid;
  name: string;
  rating: number;
  reviewCount: number;
  /** Vehicles of theirs that work around the place. */
  vehicleCount: number;
  categories: VehicleCategory[];
  /** Relative path of a photo of one of their vehicles, if any has been added. */
  coverPhoto: string | null;
}

export interface ExploreVehicle {
  id: Uuid;
  make: string;
  model: string;
  category: VehicleCategory;
  passengerCapacity: number;
  fuelType: string | null;
  transmission: string | null;
  modelYear: number | null;
  luggageCapacity: number | null;
  facilities: FacilityRef[];
  /** Relative paths; resolve with client.assetUrl(). */
  photos: string[];
}

export interface ExplorePartnerDetail {
  partner: ExplorePartner;
  vehicles: ExploreVehicle[];
}
