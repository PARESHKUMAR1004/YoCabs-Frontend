import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';
import type {
  BookingStatus,
  NegotiationStatus,
  TripType,
  VehicleCategory,
  VehicleStatus,
} from '@yocabs/api-client';
import { humanize } from './format';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const FACILITY_ICONS: Record<string, IoniconName> = {
  AC: 'snow-outline',
  HEATER: 'flame-outline',
  MUSIC_SYSTEM: 'musical-notes-outline',
  SEAT_COVERS: 'car-sport-outline',
  SANITIZED_CAB: 'sparkles-outline',
  MOBILE_CHARGER: 'battery-charging-outline',
  WATER_BOTTLE: 'water-outline',
  FIRST_AID_KIT: 'medkit-outline',
  EXTRA_LUGGAGE_SPACE: 'briefcase-outline',
  TOLL_PARKING_INCLUDED: 'card-outline',
  WIFI: 'wifi-outline',
};

/** A facility an admin added later with no mapped icon still gets a sensible generic one. */
export const facilityIcon = (code: string): IoniconName => FACILITY_ICONS[code] ?? 'checkmark-circle-outline';

export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export const TRIP_TYPE_OPTIONS: { value: TripType; label: string }[] = [
  { value: 'CHAUFFEUR_ONE_WAY', label: 'One way' },
  { value: 'CHAUFFEUR_ROUND_TRIP', label: 'Round trip' },
  { value: 'CHAUFFEUR_RENTAL', label: 'Rental' },
];

export const VEHICLE_CATEGORY_OPTIONS: { value: VehicleCategory; label: string }[] = [
  { value: 'MINI', label: 'Mini' },
  { value: 'SEDAN', label: 'Sedan' },
  { value: 'SUV', label: 'SUV' },
  { value: 'MUV', label: 'MUV' },
  { value: 'LUXURY', label: 'Luxury' },
  { value: 'TEMPO_TRAVELLER', label: 'Tempo Traveller' },
  { value: 'BUS', label: 'Bus' },
];

export const tripTypeLabel = (type: TripType): string =>
  TRIP_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? humanize(type);

export const categoryLabel = (category: string): string =>
  VEHICLE_CATEGORY_OPTIONS.find((o) => o.value === category)?.label ?? humanize(category);

export function bookingStatusLabel(status: BookingStatus): string {
  switch (status) {
    case 'PENDING_PAYMENT':
      return 'Awaiting payment';
    case 'CONFIRMED':
      return 'Confirmed';
    case 'IN_PROGRESS':
      return 'On the way';
    default:
      return humanize(status);
  }
}

export function bookingStatusTone(status: BookingStatus): Tone {
  switch (status) {
    case 'CONFIRMED':
    case 'COMPLETED':
      return 'success';
    case 'IN_PROGRESS':
      return 'info';
    case 'PENDING_PAYMENT':
      return 'warning';
    case 'CANCELLED':
    case 'EXPIRED':
      return 'danger';
  }
}

export function negotiationStatusLabel(status: NegotiationStatus): string {
  switch (status) {
    case 'OFFER_SENT':
      return 'Waiting for the partner';
    case 'ACCEPTED':
      return 'Offer accepted';
    case 'REJECTED':
      return 'Offer declined';
    case 'COUNTER_SENT':
      return 'Counter offer received';
    case 'COUNTER_ACCEPTED':
      return 'Counter offer accepted';
    case 'COUNTER_REJECTED':
      return 'Counter offer declined';
    case 'EXPIRED':
      return 'Expired';
  }
}

export function negotiationStatusTone(status: NegotiationStatus): Tone {
  switch (status) {
    case 'ACCEPTED':
    case 'COUNTER_ACCEPTED':
      return 'success';
    case 'COUNTER_SENT':
      return 'info';
    case 'OFFER_SENT':
      return 'warning';
    default:
      return 'danger';
  }
}

export function vehicleStatusTone(status: VehicleStatus): Tone {
  switch (status) {
    case 'AVAILABLE':
      return 'success';
    case 'MAINTENANCE':
      return 'warning';
    default:
      return 'neutral';
  }
}
