import type { Booking } from '@yocabs/api-client';

/** The trip the tourist is in the middle of, if any: running, or ready to start with a driver. */
export function findOngoingTrip(bookings: Booking[], today: string): Booking | undefined {
  return (
    bookings.find((booking) => booking.status === 'IN_PROGRESS') ??
    bookings.find(
      (booking) =>
        booking.status === 'CONFIRMED' && booking.driverId !== null && booking.startDate <= today,
    )
  );
}
