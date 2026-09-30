import type { Booking } from '@yocabs/api-client';
import { formatDateRange, formatMoney } from '@/shared/utils/format';
import { bookingStatusLabel } from '@/shared/utils/labels';

/**
 * The trip as a plain-text message for WhatsApp, SMS, email or anywhere else the phone's share
 * sheet offers. `billUrl` is appended only when there is one to share (a completed trip).
 */
export function tripShareMessage(booking: Booking, billUrl?: string): string {
  const lines = [
    `YoCabs trip: ${booking.pickup} → ${booking.destination}`,
    formatDateRange(booking.startDate, booking.endDate),
  ];

  if (booking.partnerName) lines.push(`Travel partner: ${booking.partnerName}`);

  if (booking.vehicle) {
    lines.push(`Vehicle: ${booking.vehicle.make} ${booking.vehicle.model} (${booking.vehicle.registrationNumber})`);
  }

  if (booking.driver?.name) lines.push(`Driver: ${booking.driver.name}`);

  lines.push(`Total fare: ${formatMoney(booking.totalAmount, booking.currency)}`);
  lines.push(`Status: ${bookingStatusLabel(booking.status)}`);

  if (billUrl) lines.push('', `Bill: ${billUrl}`);

  return lines.join('\n');
}
