/** How far along the trip is, 0 (just left) to 1 (arrived), or null when it cannot be told. */
export function tripProgress(
  remainingKm: number | null | undefined,
  tripKm: number | null | undefined,
): number | null {
  if (remainingKm === null || remainingKm === undefined) return null;
  if (tripKm === null || tripKm === undefined || tripKm <= 0) return null;
  return Math.min(1, Math.max(0, 1 - remainingKm / tripKm));
}

/** "650 m" under a kilometre, otherwise "8.4 km". */
export function formatRemaining(km: number): string {
  if (km < 1) return `${Math.max(10, Math.round((km * 1000) / 10) * 10)} m`;
  return `${km < 10 ? km.toFixed(1) : Math.round(km)} km`;
}

/** The clock time the car should arrive: "6:42 pm". Independent of the phone's locale. */
export function formatArrival(now: Date, minutesAway: number): string {
  const arrival = new Date(now.getTime() + minutesAway * 60_000);
  const hours = arrival.getHours();
  const minutes = String(arrival.getMinutes()).padStart(2, '0');
  return `${hours % 12 === 0 ? 12 : hours % 12}:${minutes} ${hours < 12 ? 'am' : 'pm'}`;
}
