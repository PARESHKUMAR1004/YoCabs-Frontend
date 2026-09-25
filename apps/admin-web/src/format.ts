import type { Tone } from './components/ui';

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export const formatMoney = (amount: number | null | undefined): string => money.format(amount ?? 0);

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-IN', { dateStyle: 'medium' });
}

export const humanize = (code: string): string =>
  code.charAt(0) + code.slice(1).toLowerCase().replaceAll('_', ' ');

export const shortId = (id: string): string => id.slice(0, 8);

const TONES: Record<string, Tone> = {
  ACTIVE: 'success',
  AVAILABLE: 'success',
  APPROVED: 'success',
  CONFIRMED: 'success',
  COMPLETED: 'success',
  PAID: 'success',
  SUCCEEDED: 'success',
  RESOLVED: 'success',
  PENDING: 'warning',
  PENDING_APPROVAL: 'warning',
  PENDING_PAYMENT: 'warning',
  REQUESTED: 'warning',
  IN_PROGRESS: 'info',
  OPEN: 'info',
  SUSPENDED: 'danger',
  BLOCKED: 'danger',
  REJECTED: 'danger',
  CANCELLED: 'danger',
  FAILED: 'danger',
  EXPIRED: 'neutral',
};

/** One status → colour mapping for the whole console. */
export const toneOf = (status: string): Tone => TONES[status] ?? 'neutral';
