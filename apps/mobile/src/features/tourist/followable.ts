import type { Booking } from '@yocabs/api-client';

/**
 * Can the car be followed on the map? While the trip runs, and from the day of the trip once a
 * driver has been assigned, when the traveller wants to know the driver is on the way. Trips days
 * away are not tracked.
 */
export function isFollowable(booking: Booking, today: string): boolean {
  if (booking.status === 'IN_PROGRESS') return true;
  return booking.status === 'CONFIRMED' && booking.driverId !== null && booking.startDate <= today;
}
