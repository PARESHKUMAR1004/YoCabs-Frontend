import type { HttpClient } from '../core/http';
import type { BookingStatus, Booking } from '../types/booking';
import type { DateRangeQuery, Role, Uuid } from '../types/common';
import type {
  AdminCancellationsView,
  AdminPartner,
  AdminUser,
  AuditLog,
  Dashboard,
  PaymentsView,
  RefundsView,
} from '../types/admin';
import type { DocumentRecord, Facility, PartnerStatus } from '../types/fleet';
import type { Payout, TicketSummary, TicketStatus } from '../types/operations';
import type { LiveTrip } from '../types/tracking';

const ADMIN = '/api/v1/admin';

export function createAdminApi(http: HttpClient) {
  const range = (r?: DateRangeQuery, extra: Record<string, string | number | undefined> = {}) => ({
    from: r?.from,
    to: r?.to,
    ...extra,
  });

  return {
    dashboard: () => http.request<Dashboard>({ path: `${ADMIN}/dashboard` }),

    partners: {
      list: (status?: PartnerStatus) =>
        http.request<AdminPartner[]>({ path: `${ADMIN}/travel-partners`, query: { status } }),
      /** Also used for admin-created partners: POST /api/v1/travel-partners returns the new id. */
      create: (name: string) =>
        http.request<Uuid>({ method: 'POST', path: '/api/v1/travel-partners', body: { name } }),
      createOwner: (partnerId: Uuid, input: { name: string; mobile: string }) =>
        http.request<AdminUser>({
          method: 'POST',
          path: `${ADMIN}/travel-partners/${partnerId}/owner`,
          body: input,
        }),
      activate: (id: Uuid) =>
        http.request<AdminPartner>({
          method: 'POST',
          path: `${ADMIN}/travel-partners/${id}/activate`,
        }),
      suspend: (id: Uuid, reason?: string) =>
        http.request<AdminPartner>({
          method: 'POST',
          path: `${ADMIN}/travel-partners/${id}/suspend`,
          body: { reason },
        }),
      reinstate: (id: Uuid) =>
        http.request<AdminPartner>({
          method: 'POST',
          path: `${ADMIN}/travel-partners/${id}/reinstate`,
        }),
      deactivate: (id: Uuid) =>
        http.request<AdminPartner>({
          method: 'POST',
          path: `${ADMIN}/travel-partners/${id}/deactivate`,
        }),
    },

    bookings: (status?: BookingStatus, limit = 50) =>
      http.request<Booking[]>({ path: `${ADMIN}/bookings`, query: { status, limit } }),

    users: {
      list: (role: Role) => http.request<AdminUser[]>({ path: `${ADMIN}/users`, query: { role } }),
      block: (id: Uuid) =>
        http.request<AdminUser>({ method: 'POST', path: `${ADMIN}/users/${id}/block` }),
      unblock: (id: Uuid) =>
        http.request<AdminUser>({ method: 'POST', path: `${ADMIN}/users/${id}/unblock` }),
      createAdmin: (input: { email: string; password: string; displayName: string }) =>
        http.request<AdminUser>({ method: 'POST', path: `${ADMIN}/admins`, body: input }),
    },

    documents: {
      queue: (status: 'PENDING' | 'APPROVED' | 'REJECTED' = 'PENDING', limit = 50) =>
        http.request<DocumentRecord[]>({ path: `${ADMIN}/documents`, query: { status, limit } }),
      approve: (id: Uuid) =>
        http.request<DocumentRecord>({ method: 'POST', path: `${ADMIN}/documents/${id}/approve` }),
      reject: (id: Uuid, reason: string) =>
        http.request<DocumentRecord>({
          method: 'POST',
          path: `${ADMIN}/documents/${id}/reject`,
          body: { reason },
        }),
    },

    payouts: {
      list: (status: Payout['status'] = 'REQUESTED', limit = 50) =>
        http.request<Payout[]>({ path: `${ADMIN}/payouts`, query: { status, limit } }),
      pay: (id: Uuid, bankReference: string) =>
        http.request<Payout>({
          method: 'POST',
          path: `${ADMIN}/payouts/${id}/pay`,
          body: { bankReference },
        }),
      reject: (id: Uuid, note: string) =>
        http.request<Payout>({
          method: 'POST',
          path: `${ADMIN}/payouts/${id}/reject`,
          body: { note },
        }),
    },

    finance: {
      payments: (r?: DateRangeQuery, status?: string, limit = 100) =>
        http.request<PaymentsView>({
          path: `${ADMIN}/payments`,
          query: range(r, { status, limit }),
        }),
      refunds: (r?: DateRangeQuery, limit = 100) =>
        http.request<RefundsView>({ path: `${ADMIN}/refunds`, query: range(r, { limit }) }),
      cancellations: (r?: DateRangeQuery, limit = 100) =>
        http.request<AdminCancellationsView>({
          path: `${ADMIN}/cancellations`,
          query: range(r, { limit }),
        }),
    },

    support: {
      queue: (status?: TicketStatus, limit = 50) =>
        http.request<TicketSummary[]>({
          path: `${ADMIN}/support/tickets`,
          query: { status, limit },
        }),
      assign: (id: Uuid) =>
        http.request<TicketSummary>({
          method: 'POST',
          path: `${ADMIN}/support/tickets/${id}/assign`,
        }),
      resolve: (id: Uuid) =>
        http.request<TicketSummary>({
          method: 'POST',
          path: `${ADMIN}/support/tickets/${id}/resolve`,
        }),
      close: (id: Uuid) =>
        http.request<TicketSummary>({
          method: 'POST',
          path: `${ADMIN}/support/tickets/${id}/close`,
        }),
    },

    facilities: {
      list: () => http.request<Facility[]>({ path: `${ADMIN}/facilities` }),
      create: (code: string, name: string) =>
        http.request<Facility>({
          method: 'POST',
          path: `${ADMIN}/facilities`,
          body: { code, name },
        }),
      setActive: (code: string, active: boolean) =>
        http.request<Facility>({
          method: 'POST',
          path: `${ADMIN}/facilities/${code}/${active ? 'activate' : 'deactivate'}`,
        }),
    },

    /** Every trip on the road across the marketplace, for the live map. */
    liveTrips: (limit = 100) =>
      http.request<LiveTrip[]>({ path: `${ADMIN}/live-trips`, query: { limit } }),

    auditLogs: (limit = 100) =>
      http.request<AuditLog[]>({ path: `${ADMIN}/audit-logs`, query: { limit } }),
  };
}
