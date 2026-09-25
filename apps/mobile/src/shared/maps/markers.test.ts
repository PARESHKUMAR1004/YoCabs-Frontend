import type { Place } from '@/shared/places';
import { tripMarkers } from './markers';

const place = (name: string, latitude: number, longitude: number): Place => ({
  id: name,
  name,
  latitude,
  longitude,
});

const airport = place('Airport', 20.2444, 85.8178);
const puri = place('Puri', 19.8135, 85.8312);
const konark = place('Konark', 19.8876, 86.0945);

describe('tripMarkers', () => {
  it('orders the pins pickup, stops, destination', () => {
    const markers = tripMarkers(airport, puri, [konark]);

    expect(markers.map((marker) => marker.kind)).toEqual(['pickup', 'stop', 'destination']);
    expect(markers.map((marker) => marker.label)).toEqual(['Airport', 'Konark', 'Puri']);
  });

  it('carries the coordinates through', () => {
    const [pin] = tripMarkers(airport, null);

    expect(pin).toMatchObject({ latitude: 20.2444, longitude: 85.8178 });
  });

  it('leaves out places that have not been chosen yet', () => {
    expect(tripMarkers(null, null)).toEqual([]);
    expect(tripMarkers(null, puri).map((marker) => marker.kind)).toEqual(['destination']);
  });

  it('gives every pin a distinct key so the map can track them', () => {
    const ids = tripMarkers(airport, puri, [konark, airport]).map((marker) => marker.id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});
