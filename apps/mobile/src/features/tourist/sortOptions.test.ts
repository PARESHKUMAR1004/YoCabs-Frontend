import type { SearchOption } from '@yocabs/api-client';
import { sortOptions } from './sortOptions';

const option = (vehicleId: string, total: number, rating: number, reviewCount: number) =>
  ({ vehicleId, rating, reviewCount, price: { totalAmount: total } }) as SearchOption;

const options = [
  option('expensive-best', 3000, 4.9, 20),
  option('cheap-unrated', 1000, 0, 0),
  option('mid-good', 2000, 4.5, 8),
  option('cheap-good', 1500, 4.5, 3),
];

describe('sortOptions', () => {
  it('sorts by price, lowest first', () => {
    expect(sortOptions(options, 'price').map((o) => o.vehicleId)).toEqual([
      'cheap-unrated',
      'cheap-good',
      'mid-good',
      'expensive-best',
    ]);
  });

  it('sorts by rating with unrated last and price as tie-break', () => {
    expect(sortOptions(options, 'rating').map((o) => o.vehicleId)).toEqual([
      'expensive-best',
      'cheap-good',
      'mid-good',
      'cheap-unrated',
    ]);
  });

  it('never mutates the cached list', () => {
    const before = options.map((o) => o.vehicleId);
    sortOptions(options, 'price');
    expect(options.map((o) => o.vehicleId)).toEqual(before);
  });
});
