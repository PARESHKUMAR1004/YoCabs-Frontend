import type { Booking, BookingStatus } from '@yocabs/api-client';

export type BookingGroup = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export const BOOKING_GROUP_OPTIONS: { value: BookingGroup; label: string }[] = [
  { value: 'UPCOMING', label: 'Upcoming' },
  { value: 'ONGOING', label: 'Ongoing' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const GROUP_BY_STATUS: Record<BookingStatus, BookingGroup> = {
  PENDING_PAYMENT: 'UPCOMING',
  CONFIRMED: 'UPCOMING',
  IN_PROGRESS: 'ONGOING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'CANCELLED',
};

export const groupOf = (status: BookingStatus): BookingGroup => GROUP_BY_STATUS[status];

/** Filters to one group; upcoming trips soonest first, everything else newest first. */
export function bookingsInGroup(bookings: Booking[], group: BookingGroup): Booking[] {
  const inGroup = bookings.filter((booking) => groupOf(booking.status) === group);
  const direction = group === 'UPCOMING' ? 1 : -1;
  return inGroup.sort((a, b) => direction * a.startDate.localeCompare(b.startDate));
}
