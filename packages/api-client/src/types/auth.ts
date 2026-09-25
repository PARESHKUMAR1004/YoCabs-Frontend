import type { IsoInstant, Role, Uuid } from './common';

export interface AuthTokenResponse {
  accessToken: string;
  accessTokenExpiresAt: IsoInstant;
  refreshToken: string;
  userId: Uuid;
  role: Role;
  partnerId: Uuid | null;
}

/** Who is signed in; derived from the token response and kept by the app. */
export interface SessionUser {
  userId: Uuid;
  role: Role;
  partnerId: Uuid | null;
}

export interface Profile {
  id: Uuid;
  role: Role;
  mobile: string | null;
  email: string | null;
  displayName: string | null;
  preferredLanguage: string | null;
  partnerId: Uuid | null;
  createdAt: IsoInstant;
}

export interface UpdateProfileRequest {
  displayName?: string;
  email?: string;
  preferredLanguage?: string;
}

export interface PartnerRegistrationRequest {
  mobile: string;
  ownerName: string;
  businessName: string;
}

export interface PartnerRegistrationResponse {
  travelPartnerId: Uuid;
  status: string;
}
