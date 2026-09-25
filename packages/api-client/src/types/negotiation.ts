import type { IsoDate, IsoInstant, TripType, Uuid } from './common';

export type NegotiationStatus =
  | 'OFFER_SENT'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'COUNTER_SENT'
  | 'COUNTER_ACCEPTED'
  | 'COUNTER_REJECTED'
  | 'EXPIRED';

export type PartnerDecision = 'ACCEPT' | 'REJECT' | 'COUNTER';

export interface Negotiation {
  id: Uuid;
  tripRequestId: Uuid;
  travelPartnerId: Uuid;
  partnerName: string | null;
  vehicleId: Uuid;
  vehicle: {
    id: Uuid;
    registrationNumber: string;
    make: string;
    model: string;
    category: string;
  } | null;
  trip: {
    pickup: string;
    destination: string;
    startDate: IsoDate;
    endDate: IsoDate;
    passengerCount: number;
  } | null;
  tripType: TripType;
  currency: string;
  listedAmount: number;
  offeredAmount: number;
  counterAmount: number | null;
  agreedAmount: number | null;
  status: NegotiationStatus;
  expiresAt: IsoInstant;
  createdAt: IsoInstant;
}
