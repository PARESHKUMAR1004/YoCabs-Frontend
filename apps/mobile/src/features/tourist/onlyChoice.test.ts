import type { SearchOption } from '@yocabs/api-client';
import { matchesOnly, onlyHeadline } from './onlyChoice';

const option = (vehicleId: string, model: string, travelPartnerId: string) =>
  ({ vehicleId, model, travelPartnerId }) as SearchOption;

describe('matchesOnly', () => {
  const dzireA = option('v1', 'Dzire', 'a');
  const dzireB = option('v2', ' DZIRE', 'b');
  const cityA = option('v3', 'City', 'a');

  it('a model matches every partner that runs it, however it was typed', () => {
    const only = { modelKey: 'dzire' };
    expect([dzireA, dzireB, cityA].filter((o) => matchesOnly(o, only))).toEqual([dzireA, dzireB]);
  });

  it('a partner matches all of their cabs', () => {
    expect([dzireA, dzireB, cityA].filter((o) => matchesOnly(o, { partnerId: 'a' }))).toEqual([
      dzireA,
      cityA,
    ]);
  });

  it('one particular cab beats the partner it belongs to', () => {
    expect(matchesOnly(cityA, { partnerId: 'a', vehicleId: 'v1' })).toBe(false);
    expect(matchesOnly(dzireA, { partnerId: 'a', vehicleId: 'v1' })).toBe(true);
  });
});

describe('onlyHeadline', () => {
  it('names the cab and its partner, the model, or the partner', () => {
    expect(onlyHeadline({ vehicleLabel: 'Toyota Innova', partnerName: 'Mahadev' })).toBe(
      'Toyota Innova · Mahadev',
    );
    expect(onlyHeadline({ modelLabel: 'Dzire' })).toBe('Dzire');
    expect(onlyHeadline({ partnerName: 'Mahadev' })).toBe('Mahadev');
  });
});
