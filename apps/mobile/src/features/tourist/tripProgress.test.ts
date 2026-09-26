import { formatArrival, formatRemaining, tripProgress } from './tripProgress';

describe('tripProgress', () => {
  it('runs from 0 at the start to 1 on arrival', () => {
    expect(tripProgress(100, 100)).toBe(0);
    expect(tripProgress(25, 100)).toBe(0.75);
    expect(tripProgress(0, 100)).toBe(1);
  });

  it('never leaves the 0 to 1 range, even when the road is longer than planned', () => {
    expect(tripProgress(120, 100)).toBe(0);
    expect(tripProgress(-1, 100)).toBe(1);
  });

  it('is unknown without both distances', () => {
    expect(tripProgress(null, 100)).toBeNull();
    expect(tripProgress(10, undefined)).toBeNull();
    expect(tripProgress(10, 0)).toBeNull();
  });
});

describe('formatRemaining', () => {
  it('uses metres close to the destination and kilometres further out', () => {
    expect(formatRemaining(0.42)).toBe('420 m');
    expect(formatRemaining(0.004)).toBe('10 m');
    expect(formatRemaining(8.44)).toBe('8.4 km');
    expect(formatRemaining(42.6)).toBe('43 km');
  });
});

describe('formatArrival', () => {
  it('reads as a 12-hour clock time', () => {
    expect(formatArrival(new Date(2026, 8, 26, 18, 30), 12)).toBe('6:42 pm');
    expect(formatArrival(new Date(2026, 8, 26, 23, 50), 20)).toBe('12:10 am');
    expect(formatArrival(new Date(2026, 8, 26, 11, 50), 15)).toBe('12:05 pm');
  });
});
