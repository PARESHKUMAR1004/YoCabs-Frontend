export interface Coordinate {
  latitude: number;
  longitude: number;
}

export type MarkerKind = 'pickup' | 'destination' | 'stop' | 'centre';

export interface MapMarker extends Coordinate {
  id: string;
  kind: MarkerKind;
  /** Shown as a small always-visible label next to the pin. */
  label?: string;
}

/** A service area: a centre and the distance around it the partner covers. */
export interface MapCircle extends Coordinate {
  radiusKm: number;
}
