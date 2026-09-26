import { api } from '@/shared/api/client';

/** Where a vehicle's photo can be fetched. Public, and only ever serves photos that are live. */
export const vehiclePhotoUrl = (vehicleId: string, documentId: string) =>
  api.assetUrl(`/api/v1/vehicles/${vehicleId}/photos/${documentId}`);
