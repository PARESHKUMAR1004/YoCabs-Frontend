import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import type {
  BookingStatus,
  DateRangeQuery,
  DriverInput,
  NegotiationStatus,
  PartnerDecision,
  PricingConfigurationInput,
  ServiceAreaInput,
  VehicleInput,
  VehicleProfileInput,
} from '@yocabs/api-client';
import { api } from '@/shared/api/client';
import { useSessionStore } from '@/shared/auth/session.store';
import { keys } from '@/shared/query/keys';

/** The organisation the signed-in owner or staff member works for. */
export function usePartnerId(): string {
  const partnerId = useSessionStore((state) => state.user?.partnerId);
  if (!partnerId) throw new Error('This account is not linked to a travel partner.');
  return partnerId;
}

export function usePartner() {
  const partnerId = usePartnerId();
  return useQuery({
    queryKey: keys.partner.detail(partnerId),
    queryFn: () => api.partner.get(partnerId),
  });
}

// ---- bookings ------------------------------------------------------------------------------

export function usePartnerBookings(status?: BookingStatus) {
  const partnerId = usePartnerId();
  return useQuery({
    queryKey: keys.partner.bookings(partnerId, status),
    queryFn: () => api.partner.bookings.list(partnerId, status),
  });
}

export function usePartnerBooking(id: string) {
  return useQuery({
    queryKey: keys.partner.booking(id),
    queryFn: () => api.partner.bookings.get(id),
  });
}

type BookingAction = 'assignDriver' | 'start' | 'complete' | 'cancel';

/** Any booking action changes both the booking and the lists it appears in. */
export function useBookingAction(bookingId: string) {
  const partnerId = usePartnerId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ action, value }: { action: BookingAction; value?: string }) => {
      const bookings = api.partner.bookings;
      switch (action) {
        case 'assignDriver':
          return bookings.assignDriver(bookingId, value as string);
        case 'start':
          return bookings.start(bookingId, value as string);
        case 'complete':
          return bookings.complete(bookingId);
        case 'cancel':
          return bookings.cancel(bookingId, value);
      }
    },
    onSuccess: (booking) => {
      queryClient.setQueryData(keys.partner.booking(bookingId), booking);
      void queryClient.invalidateQueries({
        queryKey: [...keys.partner.root(partnerId), 'bookings'],
      });
      void queryClient.invalidateQueries({ queryKey: keys.partner.wallet(partnerId) });
    },
  });
}

// ---- negotiations --------------------------------------------------------------------------

export function usePartnerNegotiations(status?: NegotiationStatus) {
  const partnerId = usePartnerId();
  return useQuery({
    queryKey: keys.partner.negotiations(partnerId, status),
    queryFn: () => api.partner.negotiations.list(partnerId, status),
    refetchInterval: 30_000,
  });
}

export function usePartnerNegotiation(id: string) {
  return useQuery({
    queryKey: keys.partner.negotiation(id),
    queryFn: () => api.partner.negotiations.get(id),
  });
}

export function useRespondToOffer(negotiationId: string) {
  const partnerId = usePartnerId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      decision,
      counterAmount,
    }: {
      decision: PartnerDecision;
      counterAmount?: number;
    }) => api.partner.negotiations.respond(negotiationId, decision, counterAmount),
    onSuccess: (negotiation) => {
      queryClient.setQueryData(keys.partner.negotiation(negotiationId), negotiation);
      void queryClient.invalidateQueries({
        queryKey: [...keys.partner.root(partnerId), 'negotiations'],
      });
    },
  });
}

// ---- fleet ---------------------------------------------------------------------------------

export function useVehicles() {
  const partnerId = usePartnerId();
  return useQuery({
    queryKey: keys.partner.vehicles(partnerId),
    queryFn: () => api.partner.vehicles.list(partnerId),
  });
}

export function useVehicle(vehicleId: string) {
  const partnerId = usePartnerId();
  return useQuery({
    queryKey: keys.partner.vehicle(partnerId, vehicleId),
    queryFn: () => api.partner.vehicles.get(partnerId, vehicleId),
  });
}

export function useSaveVehicle(vehicleId?: string) {
  const partnerId = usePartnerId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: VehicleInput) =>
      vehicleId
        ? api.partner.vehicles.update(partnerId, vehicleId, input)
        : api.partner.vehicles.create(partnerId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.partner.vehicles(partnerId) }),
  });
}

export function useChangeVehicleStatus(vehicleId: string) {
  const partnerId = usePartnerId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (action: 'make-available' | 'make-unavailable' | 'maintenance' | 'deactivate') =>
      api.partner.vehicles.changeStatus(partnerId, vehicleId, action),
    onSuccess: (vehicle) => {
      queryClient.setQueryData(keys.partner.vehicle(partnerId, vehicleId), vehicle);
      void queryClient.invalidateQueries({ queryKey: keys.partner.vehicles(partnerId) });
    },
  });
}

export function useVehicleProfile(vehicleId: string) {
  const partnerId = usePartnerId();
  return useQuery({
    queryKey: keys.partner.vehicleProfile(partnerId, vehicleId),
    queryFn: () => api.partner.vehicles.getProfile(partnerId, vehicleId),
  });
}

export function useSaveVehicleProfile(vehicleId: string) {
  const partnerId = usePartnerId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: VehicleProfileInput) =>
      api.partner.vehicles.updateProfile(partnerId, vehicleId, input),
    onSuccess: (profile) =>
      queryClient.setQueryData(keys.partner.vehicleProfile(partnerId, vehicleId), profile),
  });
}

export function useFacilities() {
  return useQuery({
    queryKey: keys.partner.facilities(),
    queryFn: () => api.partner.facilities(),
    staleTime: 3_600_000,
  });
}

export function usePricing(vehicleId: string) {
  return useQuery({
    queryKey: keys.partner.pricing(vehicleId),
    queryFn: () => api.partner.pricing.forVehicle(vehicleId),
  });
}

export function useSavePricing(vehicleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: PricingConfigurationInput }) =>
      id ? api.partner.pricing.update(id, input) : api.partner.pricing.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.partner.pricing(vehicleId) }),
  });
}

export function useSetPricingActive(vehicleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      api.partner.pricing.setActive(id, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.partner.pricing(vehicleId) }),
  });
}

// ---- drivers, staff, service areas ---------------------------------------------------------

export function useDrivers() {
  const partnerId = usePartnerId();
  return useQuery({
    queryKey: keys.partner.drivers(partnerId),
    queryFn: () => api.partner.drivers.list(partnerId),
  });
}

export function useCreateDriver() {
  const partnerId = usePartnerId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DriverInput) => api.partner.drivers.create(partnerId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.partner.drivers(partnerId) }),
  });
}

export function useSetDriverActive() {
  const partnerId = usePartnerId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ driverId, active }: { driverId: string; active: boolean }) =>
      api.partner.drivers.setActive(partnerId, driverId, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.partner.drivers(partnerId) }),
  });
}

export function useStaff() {
  const partnerId = usePartnerId();
  return useQuery({
    queryKey: keys.partner.staff(partnerId),
    queryFn: () => api.partner.staff.list(partnerId),
  });
}

export function useAddStaff() {
  const partnerId = usePartnerId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { name: string; mobile: string }) =>
      api.partner.staff.add(partnerId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.partner.staff(partnerId) }),
  });
}

export function useRemoveStaff() {
  const partnerId = usePartnerId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (staffId: string) => api.partner.staff.remove(partnerId, staffId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.partner.staff(partnerId) }),
  });
}

/** The ground one vehicle covers. Areas belong to the vehicle, so each car is opted in on its own. */
export function useVehicleServiceAreas(vehicleId: string) {
  const partnerId = usePartnerId();
  return useQuery({
    queryKey: keys.partner.vehicleServiceAreas(partnerId, vehicleId),
    queryFn: () => api.partner.vehicles.serviceAreas(partnerId, vehicleId),
  });
}

export function useVehicleServiceAreaActions(vehicleId: string) {
  const partnerId = usePartnerId();
  const queryClient = useQueryClient();

  // The fleet list carries each vehicle's areas too, so the map stays in step.
  const refresh = () => {
    void queryClient.invalidateQueries({
      queryKey: keys.partner.vehicleServiceAreas(partnerId, vehicleId),
    });
    void queryClient.invalidateQueries({ queryKey: keys.partner.vehicles(partnerId) });
  };

  return {
    add: useMutation({
      mutationFn: (input: ServiceAreaInput) =>
        api.partner.vehicles.addServiceArea(partnerId, vehicleId, input),
      onSuccess: refresh,
    }),
    remove: useMutation({
      mutationFn: (areaId: string) =>
        api.partner.vehicles.removeServiceArea(partnerId, vehicleId, areaId),
      onSuccess: refresh,
    }),
  };
}

/** Where one car is now. Polled while the trip runs; empty until the driver shares a position. */
export function useTripLocation(bookingId: string, enabled: boolean) {
  return useQuery({
    queryKey: keys.partner.tripLocation(bookingId),
    queryFn: () => api.partner.tripLocation(bookingId),
    enabled,
    refetchInterval: enabled ? 15_000 : false,
  });
}

/** Trips this partner has on the road, polled so the map keeps up with the cars. */
export function usePartnerLiveTrips() {
  const partnerId = usePartnerId();
  return useQuery({
    queryKey: keys.partner.liveTrips(partnerId),
    queryFn: () => api.partner.liveTrips(partnerId),
    refetchInterval: 20_000,
  });
}

// ---- money and insight ---------------------------------------------------------------------

export function useWallet() {
  const partnerId = usePartnerId();
  return useQuery({
    queryKey: keys.partner.wallet(partnerId),
    queryFn: () => api.partner.wallet.get(partnerId),
  });
}

export function usePayouts() {
  const partnerId = usePartnerId();
  return useQuery({
    queryKey: keys.partner.payouts(partnerId),
    queryFn: () => api.partner.wallet.payouts(partnerId),
  });
}

export function useRequestPayout() {
  const partnerId = usePartnerId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (amount: number) => api.partner.wallet.requestPayout(partnerId, amount),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.partner.wallet(partnerId) });
      void queryClient.invalidateQueries({ queryKey: keys.partner.payouts(partnerId) });
    },
  });
}

export function useReviews() {
  const partnerId = usePartnerId();
  return useQuery({
    queryKey: keys.partner.reviews(partnerId),
    queryFn: () => api.partner.reviews(partnerId),
  });
}

export function useRating() {
  const partnerId = usePartnerId();
  return useQuery({
    queryKey: keys.partner.rating(partnerId),
    queryFn: () => api.tourist.partnerRating(partnerId),
  });
}

export type ReportName = 'earnings' | 'trips' | 'vehicles' | 'drivers' | 'cancellations';

type Reports = typeof api.partner.reports;
type ReportResult<K extends ReportName> = Awaited<ReturnType<Reports[K]>>;

export function useReport<K extends ReportName>(name: K, range?: DateRangeQuery) {
  const partnerId = usePartnerId();
  return useQuery({
    queryKey: keys.partner.report(partnerId, name, range ?? null),
    queryFn: () =>
      (
        api.partner.reports[name] as (
          id: string,
          range?: DateRangeQuery,
        ) => Promise<ReportResult<K>>
      )(partnerId, range),
  });
}

export type PhotoSource = 'camera' | 'library';

/** The person said no to the camera, so there is nothing to retry: tell them how to allow it. */
export class CameraDeniedError extends Error {
  constructor() {
    super('Camera access was not allowed');
    this.name = 'CameraDeniedError';
  }
}

/**
 * Shrunk on the phone before it is sent (quality 0.8), so a big camera photo is a fraction of the
 * upload. The API tidies it further and stands it upright.
 */
const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  quality: 0.8,
  exif: false,
};

async function choosePhotos(source: PhotoSource): Promise<ImagePicker.ImagePickerAsset[]> {
  if (source === 'camera') {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) throw new CameraDeniedError();

    const shot = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
    return shot.canceled ? [] : shot.assets;
  }

  const picked = await ImagePicker.launchImageLibraryAsync({
    ...PICKER_OPTIONS,
    allowsMultipleSelection: true,
    selectionLimit: 10,
  });
  return picked.canceled ? [] : picked.assets;
}

/** Takes a photo with the camera, or picks some from the gallery, and uploads them to the vehicle. */
export function useAddVehiclePhotos(vehicleId: string) {
  const partnerId = usePartnerId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (source: PhotoSource) => {
      const photos = await choosePhotos(source);

      for (const photo of photos) {
        await api.documents.upload({
          ownerType: 'VEHICLE',
          ownerId: vehicleId,
          documentType: 'VEHICLE_PHOTO',
          file: {
            uri: photo.uri,
            name: photo.fileName ?? `photo-${Date.now()}.jpg`,
            type: photo.mimeType ?? 'image/jpeg',
          },
        });
      }
      return photos.length;
    },
    // Some photos may have gone up before a later one failed: always show what is there now.
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: keys.partner.vehicleProfile(partnerId, vehicleId),
      }),
  });
}

export function useRemoveVehiclePhoto(vehicleId: string) {
  const partnerId = usePartnerId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => api.documents.remove(documentId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: keys.partner.vehicleProfile(partnerId, vehicleId),
      }),
  });
}
