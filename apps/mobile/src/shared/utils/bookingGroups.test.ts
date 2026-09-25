import type { Booking } from '@yocabs/api-client';
import { bookingsInGroup, groupOf } from './bookingGroups';

const booking = (id: string, status: Booking['status'], startDate: string) =>
  ({ id, status, startDate }) as Booking;

describe('groupOf', () => {
  it('puts unpaid and confirmed trips under upcoming, and expired ones under cancelled', () => {
    expect(groupOf('PENDING_PAYMENT')).toBe('UPCOMING');
    expect(groupOf('CONFIRMED')).toBe('UPCOMING');
    expect(groupOf('IN_PROGRESS')).toBe('ONGOING');
    expect(groupOf('COMPLETED')).toBe('COMPLETED');
    expect(groupOf('EXPIRED')).toBe('CANCELLED');
  });
});

describe('bookingsInGroup', () => {
  const all = [
    booking('late', 'CONFIRMED', '2026-10-20'),
    booking('soon', 'PENDING_PAYMENT', '2026-10-01'),
    booking('done-old', 'COMPLETED', '2026-01-01'),
    booking('done-new', 'COMPLETED', '2026-03-01'),
  ];

  it('lists upcoming trips soonest first', () => {
    expect(bookingsInGroup(all, 'UPCOMING').map((b) => b.id)).toEqual(['soon', 'late']);
  });

  it('lists past trips newest first', () => {
    expect(bookingsInGroup(all, 'COMPLETED').map((b) => b.id)).toEqual(['done-new', 'done-old']);
  });

  it('does not reorder the input', () => {
    const copy = [...all];
    bookingsInGroup(all, 'UPCOMING');
    expect(all).toEqual(copy);
  });
});
