import type { IsoDate, IsoInstant, PriceComponent, TripType, Uuid } from './common';

export type BookingStatus =
  'PENDING_PAYMENT' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';

export interface VehicleSummary {
  id: Uuid;
  registrationNumber: string;
  make: string;
  model: string;
  category: string;
  passengerCapacity?: number;
}

export interface PersonSummary {
  id: Uuid;
  name: string | null;
  mobile: string | null;
}

export interface Booking {
  id: Uuid;
  tripRequestId: Uuid;
  travelPartnerId: Uuid;
  partnerName: string | null;
  vehicleId: Uuid;
  vehicle: VehicleSummary | null;
  negotiationId: Uuid | null;
  tripType: TripType;
  startDate: IsoDate;
  endDate: IsoDate;
  passengerCount: number;
  pickup: string;
  destination: string;
  status: BookingStatus;
  currency: string;
  totalAmount: number;
  tokenAmount: number;
  /** Only present for partner / admin viewers. */
  commissionAmount: number | null;
  priceComponents: PriceComponent[];
  holdExpiresAt: IsoInstant | null;
  driverId: Uuid | null;
  driver: PersonSummary | null;
  tourist: PersonSummary | null;
  cancellationReason: string | null;
  createdAt: IsoInstant;
}

export interface CreateBookingInput {
  tripRequestId: Uuid;
  vehicleId: Uuid;
  tripType: TripType;
  negotiationId?: Uuid;
}

export type PaymentStatus =
  'INITIATED' | 'SUCCEEDED' | 'FAILED' | 'PARTIALLY_REFUNDED' | 'REFUNDED';

export interface Payment {
  id: Uuid;
  bookingId: Uuid;
  amount: number;
  currency: string;
  status: PaymentStatus;
  gateway: string;
  gatewayOrderId: string;
  refundedAmount: number;
  createdAt: IsoInstant;
}

export interface Review {
  id: Uuid;
  bookingId: Uuid;
  rating: number;
  comment: string | null;
  createdAt: IsoInstant;
}

export interface PartnerRating {
  average: number;
  reviewCount: number;
}
