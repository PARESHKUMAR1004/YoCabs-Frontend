import type { Booking } from '@yocabs/api-client';
import { tripShareMessage } from './shareTrip';

const booking = (overrides: Partial<Booking> = {}) =>
  ({
    pickup: 'Bhubaneswar Airport',
    destination: 'Puri',
    startDate: '2026-09-30',
    endDate: '2026-09-30',
    partnerName: null,
    vehicle: null,
    driver: null,
    totalAmount: 2500,
    currency: 'INR',
    status: 'CONFIRMED',
    ...overrides,
  }) as Booking;

describe('tripShareMessage', () => {
  it('always names the route, date and fare', () => {
    const message = tripShareMessage(booking());
    expect(message).toContain('Bhubaneswar Airport → Puri');
    expect(message).toContain('₹2,500');
  });

  it('adds the partner, vehicle and driver only when known', () => {
    const bare = tripShareMessage(booking());
    expect(bare).not.toContain('Travel partner');
    expect(bare).not.toContain('Vehicle');
    expect(bare).not.toContain('Driver');

    const full = tripShareMessage(
      booking({
        partnerName: 'Mahadev Travels',
        vehicle: { make: 'Toyota', model: 'Innova', registrationNumber: 'OD02AB1234' } as never,
        driver: { name: 'Suresh' } as never,
      }),
    );
    expect(full).toContain('Travel partner: Mahadev Travels');
    expect(full).toContain('Toyota Innova (OD02AB1234)');
    expect(full).toContain('Driver: Suresh');
  });

  it('includes the bill link only when one is given', () => {
    expect(tripShareMessage(booking())).not.toContain('Bill:');
    expect(tripShareMessage(booking(), 'https://api.example/invoice?token=abc')).toContain(
      'Bill: https://api.example/invoice?token=abc',
    );
  });
});
