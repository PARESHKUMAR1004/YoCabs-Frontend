import type { Booking } from '@yocabs/api-client';
import { pickDutyTrip } from './dutyTrip';

const trip = (id: string, status: Booking['status'], startDate: string) =>
  ({ id, status, startDate }) as Booking;

describe('pickDutyTrip', () => {
  const today = '2026-09-27';

  it('is the trip that is running, even when others are due', () => {
    const trips = [trip('due', 'CONFIRMED', today), trip('running', 'IN_PROGRESS', today)];
    expect(pickDutyTrip(trips, today)?.id).toBe('running');
  });

  it('is the earliest assigned trip whose day has come', () => {
    const trips = [
      trip('later', 'CONFIRMED', '2026-09-27'),
      trip('overdue', 'CONFIRMED', '2026-09-25'),
      trip('future', 'CONFIRMED', '2026-09-30'),
    ];
    expect(pickDutyTrip(trips, today)?.id).toBe('overdue');
  });

  it('is nothing when every trip is days away or already over', () => {
    const trips = [
      trip('future', 'CONFIRMED', '2026-09-30'),
      trip('done', 'COMPLETED', today),
      trip('cancelled', 'CANCELLED', today),
    ];
    expect(pickDutyTrip(trips, today)).toBeUndefined();
  });
});
