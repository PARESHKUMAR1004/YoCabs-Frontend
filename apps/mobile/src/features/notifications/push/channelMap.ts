export type ChannelId =
  'bookings' | 'offers' | 'trips' | 'payments' | 'alerts' | 'support' | 'updates';

export interface ChannelSpec {
  id: ChannelId;
  name: string;
  description: string;
  /** File in assets/sounds (bundled into the app by the notifications plugin in app.config.ts). */
  sound: string;
  /** Vibration pattern in milliseconds: off, on, off, on... */
  vibration: number[];
}

/**
 * One Android notification channel per kind of news, each with its own sound, so a person can tell
 * a new offer from a warning without looking. The API picks the channel for each notification;
 * the type-to-channel rules below are the same ones as the API's PushChannels, kept in step.
 */
export const CHANNELS: ChannelSpec[] = [
  {
    id: 'bookings',
    name: 'Bookings',
    description: 'New and confirmed bookings',
    sound: 'bookings.wav',
    vibration: [0, 250, 150, 250],
  },
  {
    id: 'offers',
    name: 'Price offers',
    description: 'Offers and counter offers waiting for you',
    sound: 'offers.wav',
    vibration: [0, 150, 100, 150],
  },
  {
    id: 'trips',
    name: 'Trips',
    description: 'Driver assigned, trip started and finished',
    sound: 'trips.wav',
    vibration: [0, 300, 200, 300],
  },
  {
    id: 'payments',
    name: 'Payments',
    description: 'Payments, refunds and payouts',
    sound: 'payments.wav',
    vibration: [0, 120, 80, 120],
  },
  {
    id: 'alerts',
    name: 'Needs attention',
    description: 'Cancellations, failed payments and other problems',
    sound: 'alerts.wav',
    vibration: [0, 400, 150, 400, 150, 400],
  },
  {
    id: 'support',
    name: 'Support',
    description: 'Replies from YoCabs support',
    sound: 'support.wav',
    vibration: [0, 200],
  },
  {
    id: 'updates',
    name: 'Updates',
    description: 'Everything else',
    sound: 'updates.wav',
    vibration: [0, 200],
  },
];

export function channelForType(type: string | null | undefined): ChannelId {
  switch (type) {
    case 'BOOKING_CONFIRMED':
    case 'BOOKING_RECEIVED':
      return 'bookings';
    case 'BOOKING_CANCELLED':
    case 'BOOKING_HOLD_EXPIRED':
    case 'PAYMENT_FAILED':
    case 'PAYOUT_REJECTED':
      return 'alerts';
    case 'DRIVER_ASSIGNED':
    case 'TRIP_ASSIGNED':
    case 'TRIP_STARTED':
    case 'TRIP_COMPLETED':
      return 'trips';
    case 'BALANCE_PAID':
    case 'PAYOUT_PAID':
    case 'PAYMENT_REFUNDED':
      return 'payments';
    default:
      if (type?.startsWith('NEGOTIATION')) return 'offers';
      if (type?.startsWith('SUPPORT')) return 'support';
      return 'updates';
  }
}
