import { compareToStandard } from './standardRateCompare';

describe('compareToStandard', () => {
  it('is nothing when no admin rate is set for this vehicle type', () => {
    expect(compareToStandard(2000, null)).toBeNull();
    expect(compareToStandard(2000, 0)).toBeNull();
  });

  it('flags a price meaningfully below the standard as good news', () => {
    expect(compareToStandard(1800, 2000)).toEqual({
      tone: 'success',
      label: '10% below YoCabs standard fare',
    });
  });

  it('flags a price meaningfully above the standard as a caution', () => {
    expect(compareToStandard(2400, 2000)).toEqual({
      tone: 'warning',
      label: '20% above YoCabs standard fare',
    });
  });

  it('treats a price within a hair of the standard as matching, not off by a stray percent', () => {
    expect(compareToStandard(2005, 2000)).toEqual({
      tone: 'neutral',
      label: 'Matches YoCabs standard fare',
    });
    expect(compareToStandard(2000, 2000)).toEqual({
      tone: 'neutral',
      label: 'Matches YoCabs standard fare',
    });
  });
});
