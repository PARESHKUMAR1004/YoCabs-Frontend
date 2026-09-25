import type { HttpClient } from '../core/http';
import { newId } from '../core/http';
import type { Booking, CreateBookingInput, PartnerRating, Payment, Review } from '../types/booking';
import type { Uuid } from '../types/common';
import type { Negotiation } from '../types/negotiation';
import type { TripLocation, TripRoute } from '../types/tracking';
import type {
  CreateTripRequestInput,
  TripRequest,
  TripSearchRequest,
  TripSearchResponse,
} from '../types/trip';

const API = '/api/v1';

/** Everything a tourist does between "where to?" and "rate your trip". */
export function createTouristApi(http: HttpClient) {
  return {
    search: (input: TripSearchRequest) =>
      http.request<TripSearchResponse>({
        method: 'POST',
        path: `${API}/trip-search`,
        body: input,
        auth: false,
      }),

    tripRequests: {
      /** The API returns just the new id. */
      create: (input: CreateTripRequestInput) =>
        http.request<Uuid>({ method: 'POST', path: `${API}/trip-requests`, body: input }),
      get: (id: Uuid) => http.request<TripRequest>({ path: `${API}/trip-requests/${id}` }),
      submit: (id: Uuid) =>
        http.request<TripRequest>({ method: 'POST', path: `${API}/trip-requests/${id}/submit` }),
    },

    negotiations: {
      start: (
        tripRequestId: Uuid,
        input: { vehicleId: Uuid; tripType: string; offeredAmount: number },
      ) =>
        http.request<Negotiation>({
          method: 'POST',
          path: `${API}/trip-requests/${tripRequestId}/negotiations`,
          body: input,
        }),
      forTripRequest: (tripRequestId: Uuid) =>
        http.request<Negotiation[]>({ path: `${API}/trip-requests/${tripRequestId}/negotiations` }),
      get: (id: Uuid) => http.request<Negotiation>({ path: `${API}/negotiations/${id}` }),
      respondToCounter: (id: Uuid, accept: boolean) =>
        http.request<Negotiation>({
          method: 'POST',
          path: `${API}/negotiations/${id}/counter-response`,
          body: { accept },
        }),
    },

    bookings: {
      /**
       * `idempotencyKey` makes retries safe: reuse the same key when retrying the same booking
       * attempt (for example after a network error), generate a new one for a new attempt.
       */
      create: (input: CreateBookingInput, idempotencyKey: string = newId()) =>
        http.request<Booking>({
          method: 'POST',
          path: `${API}/bookings`,
          body: input,
          headers: { 'Idempotency-Key': idempotencyKey },
        }),
      mine: () => http.request<Booking[]>({ path: `${API}/bookings` }),
      get: (id: Uuid) => http.request<Booking>({ path: `${API}/bookings/${id}` }),
      cancel: (id: Uuid, reason?: string) =>
        http.request<Booking>({
          method: 'POST',
          path: `${API}/bookings/${id}/cancel`,
          body: { reason },
        }),
      review: (id: Uuid, rating: number, comment?: string) =>
        http.request<Review>({
          method: 'POST',
          path: `${API}/bookings/${id}/review`,
          body: { rating, comment },
        }),
    },

    payments: {
      /** Starts (or resumes) the token payment for a booking awaiting payment. */
      initiate: (bookingId: Uuid) =>
        http.request<Payment>({ method: 'POST', path: `${API}/bookings/${bookingId}/payments` }),
      /** After the trip: starts (or resumes) payment of the rest of the fare online. */
      initiateBalance: (bookingId: Uuid) =>
        http.request<Payment>({
          method: 'POST',
          path: `${API}/bookings/${bookingId}/payments/balance`,
        }),
      forBooking: (bookingId: Uuid) =>
        http.request<Payment[]>({ path: `${API}/bookings/${bookingId}/payments` }),
      /** DEV ONLY: plays the payment provider. Not available when the API runs the prod profile. */
      simulateSandbox: (paymentId: Uuid, outcome: 'SUCCESS' | 'FAILURE') =>
        http.request<void>({
          method: 'POST',
          path: `${API}/dev/payments/${paymentId}/simulate`,
          body: { outcome },
        }),
    },

    /** Where the car on the traveller's trip is now. Null until the driver shares a position. */
    tripLocation: (bookingId: Uuid) =>
      http.request<TripLocation | null>({ path: `${API}/bookings/${bookingId}/location` }),

    /** The journey (pickup, stops, destination) with coordinates, for the live map. */
    tripRoute: (bookingId: Uuid) =>
      http.request<TripRoute>({ path: `${API}/bookings/${bookingId}/route` }),

    partnerRating: (partnerId: Uuid) =>
      http.request<PartnerRating>({ path: `${API}/travel-partners/${partnerId}/rating` }),
  };
}
