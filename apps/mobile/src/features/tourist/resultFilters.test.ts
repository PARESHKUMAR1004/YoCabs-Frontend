import type { SearchOption } from '@yocabs/api-client';
import {
  activeFilterCount,
  applyFilters,
  categoriesIn,
  DEFAULT_FILTERS,
  facilitiesIn,
  priceLimits,
} from './resultFilters';

const option = (
  vehicleId: string,
  total: number,
  extra: Partial<SearchOption> = {},
): SearchOption =>
  ({
    vehicleId,
    category: 'SEDAN',
    passengerCapacity: 4,
    rating: 0,
    reviewCount: 0,
    facilities: [],
    price: { totalAmount: total },
    ...extra,
  }) as SearchOption;

const options = [
  option('cheap-sedan', 1000),
  option('good-suv', 2500, { category: 'SUV', passengerCapacity: 7, rating: 4.6, reviewCount: 12 }),
  option('ac-suv', 3000, {
    category: 'SUV',
    passengerCapacity: 6,
    rating: 4.1,
    reviewCount: 3,
    facilities: [{ code: 'AC', name: 'Air conditioning' }],
  }),
  option('luxury', 6000, { category: 'MUV', passengerCapacity: 4, rating: 5, reviewCount: 2 }),
];

const ids = (list: SearchOption[]) => list.map((o) => o.vehicleId);

describe('applyFilters', () => {
  it('keeps everything, cheapest first, by default', () => {
    expect(ids(applyFilters(options, DEFAULT_FILTERS))).toEqual([
      'cheap-sedan',
      'good-suv',
      'ac-suv',
      'luxury',
    ]);
  });

  it('sorts by highest price or by rating', () => {
    expect(ids(applyFilters(options, { ...DEFAULT_FILTERS, sort: 'priceDesc' }))[0]).toBe('luxury');
    expect(ids(applyFilters(options, { ...DEFAULT_FILTERS, sort: 'rating' }))[0]).toBe('luxury');
  });

  it('filters by vehicle type, allowing several', () => {
    const result = applyFilters(options, { ...DEFAULT_FILTERS, categories: ['SUV', 'MUV'] });
    expect(ids(result)).toEqual(['good-suv', 'ac-suv', 'luxury']);
  });

  it('filters by rating and never lets an unrated partner through', () => {
    const result = applyFilters(options, { ...DEFAULT_FILTERS, minRating: 4.5 });
    expect(ids(result)).toEqual(['good-suv', 'luxury']);
  });

  it('filters by seats, price and facilities together', () => {
    expect(ids(applyFilters(options, { ...DEFAULT_FILTERS, minSeats: 6 }))).toEqual([
      'good-suv',
      'ac-suv',
    ]);
    expect(ids(applyFilters(options, { ...DEFAULT_FILTERS, maxPrice: 2500 }))).toEqual([
      'cheap-sedan',
      'good-suv',
    ]);
    expect(ids(applyFilters(options, { ...DEFAULT_FILTERS, facilityCodes: ['AC'] }))).toEqual([
      'ac-suv',
    ]);
    expect(
      ids(applyFilters(options, { ...DEFAULT_FILTERS, categories: ['SUV'], maxPrice: 2600 })),
    ).toEqual(['good-suv']);
  });

  it('never changes the list it was given', () => {
    const before = ids(options);
    applyFilters(options, { ...DEFAULT_FILTERS, sort: 'priceDesc' });
    expect(ids(options)).toEqual(before);
  });
});

describe('activeFilterCount', () => {
  it('counts what differs from the default', () => {
    expect(activeFilterCount(DEFAULT_FILTERS)).toBe(0);
    expect(
      activeFilterCount({
        ...DEFAULT_FILTERS,
        sort: 'rating',
        categories: ['SUV'],
        maxPrice: 3000,
      }),
    ).toBe(3);
  });
});

describe('what the results offer to filter by', () => {
  it('suggests price limits that each keep a cab, rounded neatly', () => {
    const limits = priceLimits(options);
    expect(limits.at(-1)).toBe(6000);
    expect(limits.every((limit) => limit % 100 === 0)).toBe(true);
    expect(
      limits.every(
        (limit) => applyFilters(options, { ...DEFAULT_FILTERS, maxPrice: limit }).length > 0,
      ),
    ).toBe(true);
  });

  it('lists the facilities and vehicle types actually present', () => {
    expect(facilitiesIn(options).map((f) => f.code)).toEqual(['AC']);
    expect(categoriesIn(options)).toEqual(['MUV', 'SEDAN', 'SUV']);
  });
});
