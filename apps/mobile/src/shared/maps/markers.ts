import type { Place } from '@/shared/places';
import type { MapMarker } from './types';

/** Pickup, stops and destination as pins in travel order; missing places are simply left out. */
export function tripMarkers(
  pickup: Place | null,
  destination: Place | null,
  stops: Place[] = [],
): MapMarker[] {
  const markers: MapMarker[] = [];

  if (pickup) markers.push({ id: 'pickup', kind: 'pickup', label: pickup.name, ...coords(pickup) });

  stops.forEach((stop, index) =>
    markers.push({ id: `stop-${index}`, kind: 'stop', label: stop.name, ...coords(stop) }),
  );

  if (destination) {
    markers.push({
      id: 'destination',
      kind: 'destination',
      label: destination.name,
      ...coords(destination),
    });
  }

  return markers;
}

const coords = (place: Place) => ({ latitude: place.latitude, longitude: place.longitude });
