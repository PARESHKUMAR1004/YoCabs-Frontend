export type Uuid = string;
/** ISO-8601 instant, e.g. 2026-09-19T07:22:06.301Z */
export type IsoInstant = string;
/** yyyy-MM-dd */
export type IsoDate = string;

export type Role =
  'TOURIST' | 'PARTNER_OWNER' | 'PARTNER_STAFF' | 'DRIVER' | 'ADMIN' | 'SUPER_ADMIN';

export type TripType = 'CHAUFFEUR_ONE_WAY' | 'CHAUFFEUR_ROUND_TRIP' | 'CHAUFFEUR_RENTAL';

export type VehicleCategory = 'SEDAN' | 'SUV' | 'MUV' | 'TEMPO_TRAVELLER' | 'BUS';

export interface Location {
  description: string;
  latitude: number | null;
  longitude: number | null;
}

export interface PriceComponent {
  code: string;
  description: string;
  amount: number;
}

export interface PriceCalculation {
  totalAmount: number;
  currency: string;
  components: PriceComponent[];
}

export interface DateRangeQuery {
  from?: IsoDate;
  to?: IsoDate;
}
