import type { Place, PlaceProvider } from './types';

const p = (
  id: string,
  name: string,
  subtitle: string,
  latitude: number,
  longitude: number,
): Place => ({
  id: `static:${id}`,
  name,
  subtitle,
  latitude,
  longitude,
});

/** Frequently travelled Odisha places: works offline and gives every search real coordinates. */
export const ODISHA_PLACES: Place[] = [
  p('bbsr-airport', 'Bhubaneswar Airport', 'Biju Patnaik International Airport', 20.2444, 85.8178),
  p('bbsr-station', 'Bhubaneswar Railway Station', 'Bhubaneswar', 20.2695, 85.8436),
  p('bbsr', 'Bhubaneswar', 'Odisha', 20.2961, 85.8245),
  p('baramunda', 'Baramunda Bus Stand', 'Bhubaneswar', 20.276, 85.7959),
  p('puri', 'Puri', 'Odisha', 19.8135, 85.8312),
  p('jagannath', 'Jagannath Temple', 'Puri', 19.8049, 85.818),
  p('konark', 'Konark Sun Temple', 'Konark', 19.8876, 86.0945),
  p('lingaraj', 'Lingaraj Temple', 'Bhubaneswar', 20.238, 85.8339),
  p('dhauli', 'Dhauli Shanti Stupa', 'Bhubaneswar', 20.1922, 85.8394),
  p('udayagiri', 'Udayagiri & Khandagiri Caves', 'Bhubaneswar', 20.2626, 85.7857),
  p('nandankanan', 'Nandankanan Zoological Park', 'Bhubaneswar', 20.3962, 85.8171),
  p('chilika', 'Chilika Lake (Satapada)', 'Puri district', 19.67, 85.45),
  p('cuttack', 'Cuttack', 'Odisha', 20.4625, 85.883),
  p('paradip', 'Paradip', 'Jagatsinghpur', 20.3167, 86.6167),
  p('gopalpur', 'Gopalpur-on-Sea', 'Ganjam', 19.2633, 84.904),
  p('berhampur', 'Berhampur', 'Ganjam', 19.3149, 84.7941),
  p('balasore', 'Balasore', 'Odisha', 21.4934, 86.9135),
  p('chandipur', 'Chandipur Beach', 'Balasore', 21.4568, 87.0125),
  p('bhitarkanika', 'Bhitarkanika National Park', 'Kendrapara', 20.7167, 86.8667),
  p('sambalpur', 'Sambalpur', 'Odisha', 21.4669, 83.9812),
  p('rourkela', 'Rourkela', 'Sundargarh', 22.2604, 84.8536),
  p('angul', 'Angul', 'Odisha', 20.84, 85.1),
  p('koraput', 'Koraput', 'Odisha', 18.8121, 82.7104),
  p('daringbadi', 'Daringbadi', 'Kandhamal', 19.9167, 84.1167),
  p('simlipal', 'Simlipal National Park', 'Mayurbhanj', 21.6, 86.4),
];

const POPULAR_IDS = ['bbsr-airport', 'bbsr-station', 'puri', 'konark', 'chilika', 'cuttack'];

export const staticPlaceProvider: PlaceProvider = {
  async search(query) {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];

    const matches = ODISHA_PLACES.filter((place) =>
      `${place.name} ${place.subtitle ?? ''}`.toLowerCase().includes(needle),
    );

    // Names that start with the query first.
    return matches.sort(
      (a, b) =>
        Number(b.name.toLowerCase().startsWith(needle)) -
        Number(a.name.toLowerCase().startsWith(needle)),
    );
  },

  popular() {
    return POPULAR_IDS.map((id) =>
      ODISHA_PLACES.find((place) => place.id === `static:${id}`),
    ).filter((place): place is Place => place !== undefined);
  },
};
