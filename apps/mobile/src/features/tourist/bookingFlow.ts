import { create } from 'zustand';
import { newId, type Negotiation, type SearchOption } from '@yocabs/api-client';
import { isSameTrip, type SearchDraft } from './searchDraft';

interface BookingFlowState {
  option: SearchOption | null;
  /** The search the option came from; the trip request is created from this. */
  draft: SearchDraft | null;
  tripRequestId: string | null;
  negotiation: Negotiation | null;
  /** Stable for one booking attempt, so a retry after a network error cannot double-book. */
  idempotencyKey: string | null;

  select: (option: SearchOption, draft: SearchDraft) => void;
  setTripRequest: (id: string) => void;
  setNegotiation: (negotiation: Negotiation | null) => void;
  ensureIdempotencyKey: () => string;
  reset: () => void;
}

const empty = {
  option: null,
  draft: null,
  tripRequestId: null,
  negotiation: null,
  idempotencyKey: null,
};

/** The tourist's chosen option on its way to a booking. */
export const useBookingFlow = create<BookingFlowState>((set, get) => ({
  ...empty,

  select: (option, draft) =>
    set((state) => {
      const sameTrip = isSameTrip(state.draft, draft);
      const sameOption =
        state.option?.vehicleId === option.vehicleId && state.option.tripType === option.tripType;

      return {
        option,
        draft,
        // A new journey needs a new trip request; the same journey can reuse its one.
        tripRequestId: sameTrip ? state.tripRequestId : null,
        // An accepted price only applies to the exact option it was negotiated for.
        negotiation: sameTrip && sameOption ? state.negotiation : null,
        idempotencyKey: sameTrip && sameOption ? state.idempotencyKey : null,
      };
    }),

  setTripRequest: (tripRequestId) => set({ tripRequestId }),
  setNegotiation: (negotiation) => set({ negotiation, idempotencyKey: null }),

  ensureIdempotencyKey: () => {
    const existing = get().idempotencyKey;
    if (existing) return existing;
    const key = newId();
    set({ idempotencyKey: key });
    return key;
  },

  reset: () => set({ ...empty }),
}));
