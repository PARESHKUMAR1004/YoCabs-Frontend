import type { Booking } from '@yocabs/api-client';
import { findOngoingTrip } from './ongoingTrip';

const booking = (overrides: Partial<Booking>) =>
  ({
    id: 'b',
    status: 'CONFIRMED',
    driverId: 'd',
    startDate: '2026-09-25',
    ...overrides,
  }) as Booking;

describe('findOngoingTrip', () => {
  const today = '2026-09-25';

  it('prefers a trip that is running', () => {
    const running = booking({ id: 'running', status: 'IN_PROGRESS' });
    expect(findOngoingTrip([booking({ id: 'ready' }), running], today)).toBe(running);
  });

  it('offers a confirmed trip once it has a driver and its day has come', () => {
    expect(findOngoingTrip([booking({ id: 'ready' })], today)?.id).toBe('ready');
  });

  it('ignores trips with no driver, in the future, or already over', () => {
    expect(
      findOngoingTrip(
        [
          booking({ driverId: null }),
          booking({ startDate: '2026-09-26' }),
          booking({ status: 'COMPLETED' }),
          booking({ status: 'CANCELLED' }),
          booking({ status: 'PENDING_PAYMENT' }),
        ],
        today,
      ),
    ).toBeUndefined();
  });
});
