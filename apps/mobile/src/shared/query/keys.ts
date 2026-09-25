/** One place for every query key, so invalidation after a mutation is never guesswork. */
export const keys = {
  profile: ['profile'] as const,
  notifications: {
    all: ['notifications'] as const,
    list: () => ['notifications', 'list'] as const,
    unread: () => ['notifications', 'unread'] as const,
  },
  support: {
    all: ['support'] as const,
    mine: () => ['support', 'mine'] as const,
    detail: (id: string) => ['support', 'detail', id] as const,
  },
  documents: (ownerType: string, ownerId: string) => ['documents', ownerType, ownerId] as const,
  tourist: {
    search: (request: unknown) => ['tourist', 'search', request] as const,
    bookings: () => ['tourist', 'bookings'] as const,
    booking: (id: string) => ['tourist', 'booking', id] as const,
    payments: (bookingId: string) => ['tourist', 'payments', bookingId] as const,
    tripLocation: (bookingId: string) => ['tourist', 'trip-location', bookingId] as const,
    tripRoute: (bookingId: string) => ['tourist', 'trip-route', bookingId] as const,
    negotiation: (id: string) => ['tourist', 'negotiation', id] as const,
    negotiationsForTrip: (tripRequestId: string) =>
      ['tourist', 'negotiations', tripRequestId] as const,
  },
  partner: {
    root: (partnerId: string) => ['partner', partnerId] as const,
    detail: (partnerId: string) => ['partner', partnerId, 'detail'] as const,
    vehicles: (partnerId: string) => ['partner', partnerId, 'vehicles'] as const,
    vehicle: (partnerId: string, vehicleId: string) =>
      ['partner', partnerId, 'vehicle', vehicleId] as const,
    vehicleProfile: (partnerId: string, vehicleId: string) =>
      ['partner', partnerId, 'vehicle', vehicleId, 'profile'] as const,
    vehicleServiceAreas: (partnerId: string, vehicleId: string) =>
      ['partner', partnerId, 'vehicle', vehicleId, 'service-areas'] as const,
    liveTrips: (partnerId: string) => ['partner', partnerId, 'live-trips'] as const,
    tripLocation: (bookingId: string) => ['partner', 'trip-location', bookingId] as const,
    pricing: (vehicleId: string) => ['partner', 'pricing', vehicleId] as const,
    facilities: () => ['facilities'] as const,
    drivers: (partnerId: string) => ['partner', partnerId, 'drivers'] as const,
    staff: (partnerId: string) => ['partner', partnerId, 'staff'] as const,
    bookings: (partnerId: string, status?: string) =>
      ['partner', partnerId, 'bookings', status ?? 'all'] as const,
    booking: (id: string) => ['partner', 'booking', id] as const,
    negotiations: (partnerId: string, status?: string) =>
      ['partner', partnerId, 'negotiations', status ?? 'all'] as const,
    negotiation: (id: string) => ['partner', 'negotiation', id] as const,
    reviews: (partnerId: string) => ['partner', partnerId, 'reviews'] as const,
    rating: (partnerId: string) => ['partner', partnerId, 'rating'] as const,
    wallet: (partnerId: string) => ['partner', partnerId, 'wallet'] as const,
    payouts: (partnerId: string) => ['partner', partnerId, 'payouts'] as const,
    report: (partnerId: string, name: string, range: unknown) =>
      ['partner', partnerId, 'report', name, range] as const,
  },
  driver: {
    trips: () => ['driver', 'trips'] as const,
    trip: (id: string) => ['driver', 'trip', id] as const,
  },
};
