import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Booking, CreateBookingInput, TripSearchRequest } from '@yocabs/api-client';
import { paymentLauncher } from '@/features/payment/launcher';
import { api } from '@/shared/api/client';
import { keys } from '@/shared/query/keys';
import { useBookingFlow } from './bookingFlow';
import { ensureSubmittedTripRequest } from './tripFlow';

const LIVE: Booking['status'][] = ['PENDING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS'];

export function useTripSearch(request: TripSearchRequest | null) {
  return useQuery({
    queryKey: keys.tourist.search(request),
    queryFn: () => api.tourist.search(request as TripSearchRequest),
    enabled: request !== null,
    staleTime: 60_000,
  });
}

export function useMyBookings() {
  return useQuery({
    queryKey: keys.tourist.bookings(),
    queryFn: () => api.tourist.bookings.mine(),
  });
}

/** Keeps a live booking fresh (driver assigned, trip started) without the person refreshing. */
export function useBooking(id: string) {
  return useQuery({
    queryKey: keys.tourist.booking(id),
    queryFn: () => api.tourist.bookings.get(id),
    refetchInterval: (query) =>
      query.state.data && LIVE.includes(query.state.data.status) ? 15_000 : false,
  });
}

const CAR_REFRESH_MS = 8_000;

/** Where the traveller's car is now, refreshed while the trip runs. Null until the driver shares. */
export function useTripLocation(bookingId: string, enabled: boolean) {
  return useQuery({
    queryKey: keys.tourist.tripLocation(bookingId),
    queryFn: () => api.tourist.tripLocation(bookingId),
    enabled,
    refetchInterval: enabled ? CAR_REFRESH_MS : false,
  });
}

/** The journey's pickup, stops and destination. It does not change once booked. */
export function useTripRoute(bookingId: string, enabled: boolean) {
  return useQuery({
    queryKey: keys.tourist.tripRoute(bookingId),
    queryFn: () => api.tourist.tripRoute(bookingId),
    enabled,
    staleTime: Infinity,
  });
}

/** After the trip: pay the rest of the fare online. The traveller may instead pay the driver. */
export function usePayBalance(bookingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const payment = await api.tourist.payments.initiateBalance(bookingId);
      await paymentLauncher.pay(payment);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.tourist.payments(bookingId) }),
  });
}

export function useBookingPayments(bookingId: string) {
  return useQuery({
    queryKey: keys.tourist.payments(bookingId),
    queryFn: () => api.tourist.payments.forBooking(bookingId),
  });
}

/** Polls while the partner has not answered yet. */
export function useNegotiation(id: string | null) {
  return useQuery({
    queryKey: keys.tourist.negotiation(id ?? ''),
    queryFn: () => api.tourist.negotiations.get(id as string),
    enabled: id !== null,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'OFFER_SENT' || status === 'COUNTER_SENT' ? 10_000 : false;
    },
  });
}

export function useStartNegotiation() {
  const setNegotiation = useBookingFlow((state) => state.setNegotiation);

  return useMutation({
    mutationFn: async (offeredAmount: number) => {
      const { option } = useBookingFlow.getState();
      if (!option) throw new Error('Choose a vehicle first.');

      const tripRequestId = await ensureSubmittedTripRequest();
      return api.tourist.negotiations.start(tripRequestId, {
        vehicleId: option.vehicleId,
        tripType: option.tripType,
        offeredAmount,
      });
    },
    onSuccess: (negotiation) => setNegotiation(negotiation),
  });
}

export function useRespondToCounter(negotiationId: string) {
  const queryClient = useQueryClient();
  const setNegotiation = useBookingFlow((state) => state.setNegotiation);

  return useMutation({
    mutationFn: (accept: boolean) =>
      api.tourist.negotiations.respondToCounter(negotiationId, accept),
    onSuccess: (negotiation) => {
      setNegotiation(negotiation);
      queryClient.setQueryData(keys.tourist.negotiation(negotiationId), negotiation);
    },
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    /**
     * Books the option currently in the flow. The idempotency key stays the same until the flow
     * changes, so pressing "Confirm" again after a timeout cannot create a second booking.
     */
    mutationFn: async () => {
      const flow = useBookingFlow.getState();
      if (!flow.option) throw new Error('Choose a vehicle first.');

      const tripRequestId = await ensureSubmittedTripRequest();

      const input: CreateBookingInput = {
        tripRequestId,
        vehicleId: flow.option.vehicleId,
        tripType: flow.option.tripType,
        negotiationId: flow.negotiation?.agreedAmount ? flow.negotiation.id : undefined,
      };

      return api.tourist.bookings.create(input, flow.ensureIdempotencyKey());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.tourist.bookings() }),
  });
}

export function useInitiatePayment() {
  return useMutation({
    mutationFn: (bookingId: string) => api.tourist.payments.initiate(bookingId),
  });
}

export function useCancelBooking(bookingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason?: string) => api.tourist.bookings.cancel(bookingId, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.tourist.booking(bookingId) });
      void queryClient.invalidateQueries({ queryKey: keys.tourist.bookings() });
      void queryClient.invalidateQueries({ queryKey: keys.tourist.payments(bookingId) });
    },
  });
}

export function useSubmitReview(bookingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rating, comment }: { rating: number; comment?: string }) =>
      api.tourist.bookings.review(bookingId, rating, comment),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.tourist.booking(bookingId) }),
  });
}
