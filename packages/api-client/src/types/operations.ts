import type { IsoDate, IsoInstant, Role, Uuid } from './common';

// ---- wallet & payouts ---------------------------------------------------------------------

export interface WalletEntry {
  id: Uuid;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  referenceType: string;
  referenceId: Uuid;
  description: string;
  createdAt: IsoInstant;
}

export interface Wallet {
  balance: number;
  pendingPayouts: number;
  availableForPayout: number;
  entries: WalletEntry[];
}

export interface Payout {
  id: Uuid;
  travelPartnerId: Uuid;
  amount: number;
  status: 'REQUESTED' | 'PAID' | 'REJECTED';
  bankReference: string | null;
  note: string | null;
  createdAt: IsoInstant;
  processedAt: IsoInstant | null;
}

// ---- notifications ------------------------------------------------------------------------

export interface AppNotification {
  id: Uuid;
  type: string;
  title: string;
  body: string;
  referenceType: string | null;
  referenceId: Uuid | null;
  read: boolean;
  createdAt: IsoInstant;
}

// ---- support ------------------------------------------------------------------------------

export type TicketCategory =
  'BOOKING_ISSUE' | 'PAYMENT_ISSUE' | 'DRIVER_ISSUE' | 'CANCELLATION_REFUND' | 'SAFETY' | 'OTHER';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface TicketSummary {
  id: Uuid;
  category: TicketCategory;
  subject: string;
  status: TicketStatus;
  bookingId: Uuid | null;
  createdBy: Uuid;
  creatorRole: Role;
  assignedAdminId: Uuid | null;
  createdAt: IsoInstant;
  updatedAt: IsoInstant;
}

export interface TicketMessage {
  id: Uuid;
  authorId: Uuid;
  authorRole: Role;
  body: string;
  createdAt: IsoInstant;
}

export interface Ticket {
  ticket: TicketSummary;
  messages: TicketMessage[];
}

export interface OpenTicketInput {
  category: TicketCategory;
  subject: string;
  description: string;
  bookingId?: Uuid;
}

// ---- partner reports ----------------------------------------------------------------------

export interface ReportDateRange {
  from: IsoDate;
  to: IsoDate;
}

export interface MonthlyEarnings {
  month: string;
  completedTrips: number;
  grossFare: number;
  commission: number;
}

export interface EarningsReport {
  range: ReportDateRange;
  completedTrips: number;
  upcomingTrips: number;
  grossFare: number;
  commission: number;
  partnerEarnings: number;
  tokenCollectedByYoCabs: number;
  walletBalance: number;
  months: MonthlyEarnings[];
}

export interface TripRow {
  bookingId: Uuid;
  startDate: IsoDate;
  endDate: IsoDate;
  pickup: string;
  destination: string;
  status: string;
  totalAmount: number;
  vehicle: string;
  driver: string | null;
}

export interface TripsReport {
  range: ReportDateRange;
  countsByStatus: Record<string, number>;
  trips: TripRow[];
}

export interface VehicleReportRow {
  vehicleId: Uuid;
  registrationNumber: string;
  makeModel: string;
  category: string;
  status: string;
  completedTrips: number;
  cancelledTrips: number;
  revenue: number;
  daysOnRoad: number;
}

export interface DriverReportRow {
  driverId: Uuid;
  name: string;
  status: string;
  completedTrips: number;
  averageRating: number;
  reviewCount: number;
}

export interface CancellationRow {
  bookingId: Uuid;
  startDate: IsoDate;
  pickup: string;
  destination: string;
  totalAmount: number;
  reason: string | null;
  cancelledBy: string | null;
  cancelledAt: IsoInstant | null;
  refunded: number;
}

export interface CancellationsReport {
  range: ReportDateRange;
  countsByCancelledBy: Record<string, number>;
  totalRefunded: number;
  cancellations: CancellationRow[];
}
