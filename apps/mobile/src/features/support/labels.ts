import type { TicketCategory, TicketStatus } from '@yocabs/api-client';
import type { Tone } from '@/shared/utils/labels';

export const TICKET_CATEGORY_OPTIONS: { value: TicketCategory; label: string }[] = [
  { value: 'BOOKING_ISSUE', label: 'Booking' },
  { value: 'PAYMENT_ISSUE', label: 'Payment' },
  { value: 'DRIVER_ISSUE', label: 'Driver' },
  { value: 'CANCELLATION_REFUND', label: 'Refund' },
  { value: 'SAFETY', label: 'Safety' },
  { value: 'OTHER', label: 'Other' },
];

const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

const STATUS_TONES: Record<TicketStatus, Tone> = {
  OPEN: 'info',
  IN_PROGRESS: 'warning',
  RESOLVED: 'success',
  CLOSED: 'neutral',
};

export const ticketStatusLabel = (status: TicketStatus): string => STATUS_LABELS[status];
export const ticketStatusTone = (status: TicketStatus): Tone => STATUS_TONES[status];
export const isTicketClosed = (status: TicketStatus): boolean => status === 'CLOSED';
