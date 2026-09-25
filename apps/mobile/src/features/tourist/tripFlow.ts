import { api } from '@/shared/api/client';
import { useBookingFlow } from './bookingFlow';
import { tripBrief, validateDraft } from './searchDraft';

/**
 * The API needs a submitted trip request before anyone can negotiate or book. The tourist never
 * sees this step: it is created the first time it is needed and reused for the same journey.
 */
export async function ensureSubmittedTripRequest(): Promise<string> {
  const flow = useBookingFlow.getState();

  if (flow.tripRequestId) return flow.tripRequestId;

  const { draft, option } = flow;
  if (!draft?.pickup || !draft.destination || !option) {
    throw new Error('Choose a vehicle first.');
  }

  const problem = validateDraft(draft);
  if (problem) throw new Error(problem);

  const id = await api.tourist.tripRequests.create({
    pickupDescription: draft.pickup.name,
    pickupLatitude: draft.pickup.latitude,
    pickupLongitude: draft.pickup.longitude,
    stops: draft.stops.map((stop) => ({
      description: stop.name,
      latitude: stop.latitude,
      longitude: stop.longitude,
    })),
    destinationDescription: draft.destination.name,
    destinationLatitude: draft.destination.latitude,
    destinationLongitude: draft.destination.longitude,
    startDate: draft.startDate,
    endDate: draft.endDate,
    passengerCount: draft.passengerCount,
    tripBrief: tripBrief(draft),
    tripType: draft.tripType,
    vehicleCategory: draft.vehicleCategory,
  });

  await api.tourist.tripRequests.submit(id);
  useBookingFlow.getState().setTripRequest(id);
  return id;
}
