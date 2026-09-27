import type { Booking } from '@yocabs/api-client';

/**
 * The trip the driver is on duty for: the one running, or else the earliest assigned trip whose day
 * has come. Their location is shared for this trip and no other.
 */
export function pickDutyTrip(trips: Booking[], today: string): Booking | undefined {
  const running = trips.find((trip) => trip.status === 'IN_PROGRESS');
  if (running) return running;

  return trips
    .filter((trip) => trip.status === 'CONFIRMED' && trip.startDate <= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];
}
