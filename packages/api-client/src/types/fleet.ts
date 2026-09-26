import type { IsoDate, IsoInstant, TripType, Uuid, VehicleCategory } from './common';
import type { FacilityRef } from './trip';

export type PartnerStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';

/** The ground one vehicle covers. Areas belong to the vehicle, not the partner. */
export interface ServiceArea {
  id: Uuid;
  name: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
}

export interface TravelPartner {
  id: Uuid;
  name: string;
  status: PartnerStatus;
  createdAt: IsoInstant;
}

export interface ServiceAreaInput {
  name: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
}

export type VehicleStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'MAINTENANCE' | 'INACTIVE';

export interface Vehicle {
  id: Uuid;
  travelPartnerId: Uuid;
  registrationNumber: string;
  make: string;
  model: string;
  category: VehicleCategory;
  passengerCapacity: number;
  status: VehicleStatus;
  /** Pickups inside any of these put this vehicle in a traveller's search results. */
  serviceAreas: ServiceArea[];
  createdAt: IsoInstant;
  updatedAt: IsoInstant;
}

export interface VehicleInput {
  registrationNumber: string;
  make: string;
  model: string;
  category: VehicleCategory;
  passengerCapacity: number;
}

export type FuelType = 'PETROL' | 'DIESEL' | 'CNG' | 'ELECTRIC' | 'HYBRID';
export type Transmission = 'MANUAL' | 'AUTOMATIC';

export interface VehiclePhoto {
  documentId: Uuid;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason: string | null;
}

export interface VehicleProfile {
  vehicleId: Uuid;
  fuelType: FuelType | null;
  transmission: Transmission | null;
  modelYear: number | null;
  luggageCapacity: number | null;
  facilities: (FacilityRef & { active?: boolean })[];
  photos: VehiclePhoto[];
}

export interface VehicleProfileInput {
  fuelType?: FuelType | null;
  transmission?: Transmission | null;
  modelYear?: number | null;
  luggageCapacity?: number | null;
  /** Omit to keep the current facilities. */
  facilityCodes?: string[];
}

export interface Facility {
  code: string;
  name: string;
  active: boolean;
}

export interface PricingConfiguration {
  id: Uuid;
  vehicleId: Uuid;
  tripType: TripType;
  active: boolean;
  baseFee: number | null;
  perKmCharge: number | null;
  driverAllowance: number | null;
  minimumBillableKm: number | null;
  includedDurationMinutes: number | null;
  includedDistanceKm: number | null;
  packagePrice: number | null;
  extraHourCharge: number | null;
  extraKmCharge: number | null;
  createdAt: IsoInstant;
  updatedAt: IsoInstant;
}

export interface PricingConfigurationInput {
  vehicleId: Uuid;
  tripType: TripType;
  baseFee?: number;
  perKmCharge?: number;
  driverAllowance?: number;
  minimumBillableKm?: number;
  includedDurationMinutes?: number;
  includedDistanceKm?: number;
  packagePrice?: number;
  extraHourCharge?: number;
  extraKmCharge?: number;
}

export interface Driver {
  id: Uuid;
  travelPartnerId: Uuid;
  name: string;
  mobile: string;
  licenseNumber: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: IsoInstant;
}

export interface DriverInput {
  name: string;
  mobile: string;
  licenseNumber: string;
}

export interface StaffMember {
  id: Uuid;
  name: string | null;
  mobile: string | null;
  status: 'ACTIVE' | 'BLOCKED';
  createdAt: IsoInstant;
}

export type DocumentOwnerType = 'PARTNER' | 'VEHICLE' | 'DRIVER';

export type DocumentType =
  | 'RC_BOOK'
  | 'INSURANCE'
  | 'PUC'
  | 'FITNESS'
  | 'PERMIT'
  | 'DRIVING_LICENSE'
  | 'AADHAAR'
  | 'POLICE_VERIFICATION'
  | 'GST_CERTIFICATE'
  | 'TRADE_LICENSE'
  | 'PROFILE_PHOTO'
  | 'VEHICLE_PHOTO'
  | 'OTHER';

export interface DocumentRecord {
  id: Uuid;
  ownerType: DocumentOwnerType;
  ownerId: Uuid;
  documentType: DocumentType;
  filename: string;
  contentType: string;
  sizeBytes: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason: string | null;
  expiryDate: IsoDate | null;
  createdAt: IsoInstant;
}

/** A browser Blob/File, or a file on a phone described by its path, name and type. */
export type UploadFile = Blob | { uri: string; name: string; type: string };

export interface UploadDocumentInput {
  ownerType: DocumentOwnerType;
  ownerId: Uuid;
  documentType: DocumentType;
  expiryDate?: IsoDate;
  file: UploadFile;
  /** Required when file is a Blob without a name. */
  filename?: string;
}
