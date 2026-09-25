import type { HttpClient, Query } from '../core/http';
import type { Booking, BookingStatus, Review } from '../types/booking';
import type { DateRangeQuery, Uuid } from '../types/common';
import type {
  Driver,
  DriverInput,
  Facility,
  PricingConfiguration,
  PricingConfigurationInput,
  ServiceArea,
  ServiceAreaInput,
  StaffMember,
  TravelPartner,
  Vehicle,
  VehicleInput,
  VehicleProfile,
  VehicleProfileInput,
} from '../types/fleet';
import type { Negotiation, NegotiationStatus, PartnerDecision } from '../types/negotiation';
import type { LiveTrip, ReportLocationInput, TripLocation } from '../types/tracking';
import type {
  CancellationsReport,
  DriverReportRow,
  EarningsReport,
  Payout,
  TripsReport,
  VehicleReportRow,
  Wallet,
} from '../types/operations';

const API = '/api/v1';

/** A travel partner's own organisation: fleet, pricing, drivers, bookings, money and reports. */
export function createPartnerApi(http: HttpClient) {
  const base = (partnerId: Uuid) => `${API}/travel-partners/${partnerId}`;
  const range = (r?: DateRangeQuery): Query => ({ from: r?.from, to: r?.to });

  return {
    get: (partnerId: Uuid) => http.request<TravelPartner>({ path: base(partnerId) }),

    vehicles: {
      list: (partnerId: Uuid) => http.request<Vehicle[]>({ path: `${base(partnerId)}/vehicles` }),
      get: (partnerId: Uuid, vehicleId: Uuid) =>
        http.request<Vehicle>({ path: `${base(partnerId)}/vehicles/${vehicleId}` }),
      create: (partnerId: Uuid, input: VehicleInput) =>
        http.request<Vehicle>({ method: 'POST', path: `${base(partnerId)}/vehicles`, body: input }),
      update: (partnerId: Uuid, vehicleId: Uuid, input: VehicleInput) =>
        http.request<Vehicle>({
          method: 'PUT',
          path: `${base(partnerId)}/vehicles/${vehicleId}`,
          body: input,
        }),
      /** action: make-available | make-unavailable | maintenance | deactivate */
      changeStatus: (
        partnerId: Uuid,
        vehicleId: Uuid,
        action: 'make-available' | 'make-unavailable' | 'maintenance' | 'deactivate',
      ) =>
        http.request<Vehicle>({
          method: 'POST',
          path: `${base(partnerId)}/vehicles/${vehicleId}/${action}`,
        }),
      /** The ground this vehicle covers; pickups inside it put the car in search results. */
      serviceAreas: (partnerId: Uuid, vehicleId: Uuid) =>
        http.request<ServiceArea[]>({
          path: `${base(partnerId)}/vehicles/${vehicleId}/service-areas`,
        }),
      addServiceArea: (partnerId: Uuid, vehicleId: Uuid, input: ServiceAreaInput) =>
        http.request<ServiceArea>({
          method: 'POST',
          path: `${base(partnerId)}/vehicles/${vehicleId}/service-areas`,
          body: input,
        }),
      removeServiceArea: (partnerId: Uuid, vehicleId: Uuid, areaId: Uuid) =>
        http.request<void>({
          method: 'DELETE',
          path: `${base(partnerId)}/vehicles/${vehicleId}/service-areas/${areaId}`,
        }),

      getProfile: (partnerId: Uuid, vehicleId: Uuid) =>
        http.request<VehicleProfile>({ path: `${base(partnerId)}/vehicles/${vehicleId}/profile` }),
      updateProfile: (partnerId: Uuid, vehicleId: Uuid, input: VehicleProfileInput) =>
        http.request<VehicleProfile>({
          method: 'PUT',
          path: `${base(partnerId)}/vehicles/${vehicleId}/profile`,
          body: input,
        }),
    },

    facilities: () => http.request<Facility[]>({ path: `${API}/facilities` }),

    pricing: {
      forVehicle: (vehicleId: Uuid) =>
        http.request<PricingConfiguration[]>({
          path: `${API}/pricing-configurations/vehicle/${vehicleId}`,
        }),
      create: (input: PricingConfigurationInput) =>
        http.request<PricingConfiguration>({
          method: 'POST',
          path: `${API}/pricing-configurations`,
          body: input,
        }),
      update: (id: Uuid, input: PricingConfigurationInput) =>
        http.request<PricingConfiguration>({
          method: 'PUT',
          path: `${API}/pricing-configurations/${id}`,
          body: input,
        }),
      setActive: (id: Uuid, active: boolean) =>
        http.request<PricingConfiguration>({
          method: 'PATCH',
          path: `${API}/pricing-configurations/${id}/${active ? 'activate' : 'deactivate'}`,
        }),
    },

    drivers: {
      list: (partnerId: Uuid) => http.request<Driver[]>({ path: `${base(partnerId)}/drivers` }),
      create: (partnerId: Uuid, input: DriverInput) =>
        http.request<Driver>({ method: 'POST', path: `${base(partnerId)}/drivers`, body: input }),
      setActive: (partnerId: Uuid, driverId: Uuid, active: boolean) =>
        http.request<Driver>({
          method: 'POST',
          path: `${base(partnerId)}/drivers/${driverId}/${active ? 'activate' : 'deactivate'}`,
        }),
    },

    staff: {
      list: (partnerId: Uuid) => http.request<StaffMember[]>({ path: `${base(partnerId)}/staff` }),
      add: (partnerId: Uuid, input: { name: string; mobile: string }) =>
        http.request<StaffMember>({
          method: 'POST',
          path: `${base(partnerId)}/staff`,
          body: input,
        }),
      remove: (partnerId: Uuid, staffId: Uuid) =>
        http.request<void>({ method: 'DELETE', path: `${base(partnerId)}/staff/${staffId}` }),
    },

    bookings: {
      list: (partnerId: Uuid, status?: BookingStatus) =>
        http.request<Booking[]>({ path: `${base(partnerId)}/bookings`, query: { status } }),
      get: (bookingId: Uuid) => http.request<Booking>({ path: `${API}/bookings/${bookingId}` }),
      assignDriver: (bookingId: Uuid, driverId: Uuid) =>
        http.request<Booking>({
          method: 'POST',
          path: `${API}/bookings/${bookingId}/driver`,
          body: { driverId },
        }),
      start: (bookingId: Uuid) =>
        http.request<Booking>({ method: 'POST', path: `${API}/bookings/${bookingId}/start` }),
      complete: (bookingId: Uuid) =>
        http.request<Booking>({ method: 'POST', path: `${API}/bookings/${bookingId}/complete` }),
      cancel: (bookingId: Uuid, reason?: string) =>
        http.request<Booking>({
          method: 'POST',
          path: `${API}/bookings/${bookingId}/cancel`,
          body: { reason },
        }),
    },

    negotiations: {
      list: (partnerId: Uuid, status?: NegotiationStatus) =>
        http.request<Negotiation[]>({ path: `${base(partnerId)}/negotiations`, query: { status } }),
      get: (id: Uuid) => http.request<Negotiation>({ path: `${API}/negotiations/${id}` }),
      /** Accept, reject, or make one counter offer. */
      respond: (id: Uuid, decision: PartnerDecision, counterAmount?: number) =>
        http.request<Negotiation>({
          method: 'POST',
          path: `${API}/negotiations/${id}/respond`,
          body: { decision, counterAmount },
        }),
    },

    /** Where the car on one booking is now. Null until the driver starts sharing. */
    tripLocation: (bookingId: Uuid) =>
      http.request<TripLocation | null>({ path: `${API}/bookings/${bookingId}/location` }),

    /** Trips this partner has on the road right now, with each car's last known position. */
    liveTrips: (partnerId: Uuid) =>
      http.request<LiveTrip[]>({ path: `${base(partnerId)}/live-trips` }),

    reviews: (partnerId: Uuid, limit = 20) =>
      http.request<Review[]>({ path: `${base(partnerId)}/reviews`, query: { limit } }),

    wallet: {
      get: (partnerId: Uuid, limit = 50) =>
        http.request<Wallet>({ path: `${base(partnerId)}/wallet`, query: { limit } }),
      requestPayout: (partnerId: Uuid, amount: number) =>
        http.request<Payout>({
          method: 'POST',
          path: `${base(partnerId)}/payouts`,
          body: { amount },
        }),
      payouts: (partnerId: Uuid) => http.request<Payout[]>({ path: `${base(partnerId)}/payouts` }),
    },

    reports: {
      earnings: (partnerId: Uuid, r?: DateRangeQuery) =>
        http.request<EarningsReport>({
          path: `${base(partnerId)}/reports/earnings`,
          query: range(r),
        }),
      trips: (partnerId: Uuid, r?: DateRangeQuery, limit = 100) =>
        http.request<TripsReport>({
          path: `${base(partnerId)}/reports/trips`,
          query: { ...range(r), limit },
        }),
      vehicles: (partnerId: Uuid, r?: DateRangeQuery) =>
        http.request<VehicleReportRow[]>({
          path: `${base(partnerId)}/reports/vehicles`,
          query: range(r),
        }),
      drivers: (partnerId: Uuid, r?: DateRangeQuery) =>
        http.request<DriverReportRow[]>({
          path: `${base(partnerId)}/reports/drivers`,
          query: range(r),
        }),
      cancellations: (partnerId: Uuid, r?: DateRangeQuery, limit = 100) =>
        http.request<CancellationsReport>({
          path: `${base(partnerId)}/reports/cancellations`,
          query: { ...range(r), limit },
        }),
    },
  };
}

/** What a driver does: see assigned trips, start and finish them. */
export function createDriverApi(http: HttpClient) {
  return {
    trips: () => http.request<Booking[]>({ path: `${API}/driver/bookings` }),
    get: (bookingId: Uuid) => http.request<Booking>({ path: `${API}/bookings/${bookingId}` }),
    start: (bookingId: Uuid) =>
      http.request<Booking>({ method: 'POST', path: `${API}/bookings/${bookingId}/start` }),
    complete: (bookingId: Uuid) =>
      http.request<Booking>({ method: 'POST', path: `${API}/bookings/${bookingId}/complete` }),

    /** Shares where the car is. The API only accepts this while the trip is in progress. */
    reportLocation: (bookingId: Uuid, input: ReportLocationInput) =>
      http.request<TripLocation>({
        method: 'POST',
        path: `${API}/bookings/${bookingId}/location`,
        body: input,
      }),
  };
}
