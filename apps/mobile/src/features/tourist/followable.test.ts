import type { Booking } from '@yocabs/api-client';
import { isFollowable } from './followable';

const booking = (overrides: Partial<Booking>) =>
  ({ status: 'CONFIRMED', driverId: 'd', startDate: '2026-09-27', ...overrides }) as Booking;

describe('isFollowable', () => {
  const today = '2026-09-27';

  it('is true while the trip runs', () => {
    expect(isFollowable(booking({ status: 'IN_PROGRESS' }), today)).toBe(true);
  });

  it('is true on the day of the trip once a driver is assigned', () => {
    expect(isFollowable(booking({}), today)).toBe(true);
  });

  it('is false with no driver, before the day, or when the trip is over', () => {
    expect(isFollowable(booking({ driverId: null }), today)).toBe(false);
    expect(isFollowable(booking({ startDate: '2026-09-28' }), today)).toBe(false);
    expect(isFollowable(booking({ status: 'COMPLETED' }), today)).toBe(false);
    expect(isFollowable(booking({ status: 'CANCELLED' }), today)).toBe(false);
  });
});
