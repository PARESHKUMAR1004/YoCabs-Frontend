import type { SearchOption } from '@yocabs/api-client';

export type SortMode = 'price' | 'rating';

/** Returns a new, sorted list (never mutates the cached search result). */
export function sortOptions(options: SearchOption[], mode: SortMode): SearchOption[] {
  const byPrice = (a: SearchOption, b: SearchOption) => a.price.totalAmount - b.price.totalAmount;

  return [...options].sort((a, b) => {
    if (mode === 'price') return byPrice(a, b);
    // Better rated first; unrated partners (no reviews) after rated ones; price breaks ties.
    const aRated = a.reviewCount > 0 ? a.rating : -1;
    const bRated = b.reviewCount > 0 ? b.rating : -1;
    return bRated - aRated || byPrice(a, b);
  });
}
