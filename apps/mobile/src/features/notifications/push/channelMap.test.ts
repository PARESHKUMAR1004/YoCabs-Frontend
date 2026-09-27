import { CHANNELS, channelForType } from './channelMap';

describe('channelForType', () => {
  it('gives each kind of news its own sound', () => {
    expect(channelForType('BOOKING_CONFIRMED')).toBe('bookings');
    expect(channelForType('NEGOTIATION_OFFER_RECEIVED')).toBe('offers');
    expect(channelForType('NEGOTIATION_COUNTER_SENT')).toBe('offers');
    expect(channelForType('TRIP_STARTED')).toBe('trips');
    expect(channelForType('BALANCE_PAID')).toBe('payments');
    expect(channelForType('SUPPORT_REPLY')).toBe('support');
  });

  it('uses the alert sound when something went wrong', () => {
    for (const type of ['BOOKING_CANCELLED', 'PAYMENT_FAILED', 'PAYOUT_REJECTED']) {
      expect(channelForType(type)).toBe('alerts');
    }
  });

  it('falls back to the gentle default', () => {
    expect(channelForType('REVIEW_RECEIVED')).toBe('updates');
    expect(channelForType(null)).toBe('updates');
  });
});

describe('CHANNELS', () => {
  it('has a channel, with its own sound file, for every id the API can choose', () => {
    const sounds = CHANNELS.map((channel) => channel.sound);
    expect(new Set(sounds).size).toBe(CHANNELS.length);
    for (const id of ['bookings', 'offers', 'trips', 'payments', 'alerts', 'support', 'updates']) {
      expect(CHANNELS.some((channel) => channel.id === id)).toBe(true);
    }
  });
});
