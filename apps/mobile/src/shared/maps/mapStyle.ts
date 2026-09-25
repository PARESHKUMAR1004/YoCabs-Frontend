import type { MapStyleElement } from 'react-native-maps';

/**
 * A quieter Google map: shops, transit and other clutter are hidden so the route and the car
 * stand out. Only applies to the standard (not satellite) map type.
 */
export const PREMIUM_MAP_STYLE: MapStyleElement[] = [
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.medical', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f4f1ea' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#cfdbe6' }] },
];
