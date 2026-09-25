import type { IsoDate, IsoInstant, Role, Uuid } from './common';
import type { BookingStatus } from './booking';
import type { PartnerStatus } from './fleet';

export interface AdminPartner {
  id: Uuid;
  name: string;
  status: PartnerStatus;
  createdAt: IsoInstant;
}

export interface AdminUser {
  id: Uuid;
  mobile: string | null;
  email: string | null;
  displayName: string | null;
  role: Role;
  partnerId: Uuid | null;
  status: 'ACTIVE' | 'BLOCKED';
  createdAt: IsoInstant;
}

export interface BookingStats {
  total: number;
  byStatus: Record<BookingStatus, number>;
  grossValue: number;
  commission: number;
}

export interface Dashboard {
  bookings: BookingStats;
  partnersByStatus: Record<string, number>;
  vehicles: number;
  availableVehicles: number;
  activeDrivers: number;
  tourists: number;
  pendingDocuments: number;
  pendingPayouts: number;
  openSupportTickets: number;
  generatedAt: IsoInstant;
}

export interface AuditLog {
  id: Uuid;
  actorId: Uuid;
  actorRole: Role;
  action: string;
  targetType: string | null;
  targetId: Uuid | null;
  details: string | null;
  createdAt: IsoInstant;
}

export interface FinanceRange {
  from: IsoDate;
  to: IsoDate;
}

export interface PaymentRow {
  paymentId: Uuid;
  bookingId: Uuid;
  travelPartnerId: Uuid;
  touristId: Uuid;
  amount: number;
  currency: string;
  status: string;
  refundedAmount: number;
  gateway: string;
  createdAt: IsoInstant;
}

export interface PaymentsView {
  range: FinanceRange;
  summary: { paidPayments: number; collected: number; refunded: number; netCollected: number };
  payments: PaymentRow[];
}

export interface RefundRow {
  transactionId: Uuid;
  paymentId: Uuid;
  bookingId: Uuid;
  travelPartnerId: Uuid;
  amount: number;
  cancellationReason: string | null;
  cancelledBy: string | null;
  refundedAt: IsoInstant;
}

export interface RefundsView {
  range: FinanceRange;
  totalRefunded: number;
  refunds: RefundRow[];
}

export interface AdminCancellationRow {
  bookingId: Uuid;
  travelPartnerId: Uuid;
  touristId: Uuid;
  startDate: IsoDate;
  totalAmount: number;
  tokenAmount: number;
  reason: string | null;
  cancelledBy: string | null;
  cancelledAt: IsoInstant;
  refunded: number;
}

export interface AdminCancellationsView {
  range: FinanceRange;
  countsByCancelledBy: Record<string, number>;
  totalRefunded: number;
  cancellations: AdminCancellationRow[];
}
