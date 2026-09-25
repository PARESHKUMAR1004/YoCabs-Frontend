import type {
  IsoDate,
  IsoInstant,
  Location,
  PriceCalculation,
  TripType,
  Uuid,
  VehicleCategory,
} from './common';

export interface SearchLocation {
  description: string;
  latitude: number;
  longitude: number;
}

export interface TripSearchRequest {
  pickup: SearchLocation;
  destination: SearchLocation;
  stops?: SearchLocation[];
  startDate: IsoDate;
  endDate: IsoDate;
  passengerCount: number;
  vehicleCategory?: VehicleCategory;
  tripType?: TripType;
}

export interface FacilityRef {
  code: string;
  name: string;
}

export interface SearchOption {
  travelPartnerId: Uuid;
  travelPartnerName: string;
  rating: number;
  reviewCount: number;
  vehicleId: Uuid;
  registrationNumber: string;
  make: string;
  model: string;
  category: VehicleCategory;
  passengerCapacity: number;
  fuelType: string | null;
  transmission: string | null;
  modelYear: number | null;
  luggageCapacity: number | null;
  facilities: FacilityRef[];
  /** Relative paths such as /api/v1/vehicles/{id}/photos/{docId}; resolve with client.assetUrl(). */
  photos: string[];
  tripType: TripType;
  price: PriceCalculation;
}

export interface TripSearchResponse {
  distanceKm: number;
  durationMinutes: number;
  options: SearchOption[];
}

export interface CreateTripRequestInput {
  pickupDescription: string;
  pickupLatitude: number;
  pickupLongitude: number;
  stops?: { description: string; latitude: number; longitude: number }[];
  destinationDescription: string;
  destinationLatitude: number;
  destinationLongitude: number;
  startDate: IsoDate;
  endDate: IsoDate;
  passengerCount: number;
  tripBrief: string;
  tripType?: TripType;
  vehicleCategory?: VehicleCategory;
}

export interface TripRequest {
  id: Uuid;
  touristId: Uuid;
  status: 'DRAFT' | 'SUBMITTED' | 'CANCELLED';
  startDate: IsoDate;
  endDate: IsoDate;
  passengerCount: number;
  tripBrief: string;
  tripType: TripType | null;
  vehicleCategory: VehicleCategory | null;
  pickup: Location;
  stops: Location[];
  destination: Location;
  version: number;
  createdAt: IsoInstant;
  updatedAt: IsoInstant;
}
