import { describe, expect, it } from 'vitest';
import { ApiError, type Booking } from '../../src';
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  BASE_URL,
  newClient,
  otpLogin,
  randomMobile,
  todayInIndia,
} from './harness';

/**
 * Drives the whole marketplace through the same typed client the apps use, against a running API:
 *   partner onboarding -> admin approval -> tourist search / negotiate / book / pay ->
 *   driver trip -> settlement, review, reports, support, notifications.
 *
 *   YOCABS_E2E_BASE_URL=http://localhost:8080 YOCABS_E2E_API_LOG=path/to/api.log npm run test:e2e
 */
describe.skipIf(!BASE_URL)('marketplace end to end', () => {
  it('runs a complete trip from onboarding to review and settlement', async () => {
    const day = todayInIndia();

    // ---- admin ---------------------------------------------------------------------------
    const admin = newClient();
    await admin.auth.adminLogin(ADMIN_EMAIL, ADMIN_PASSWORD);
    const dashboardBefore = await admin.admin.dashboard();

    // ---- partner self-registers, admin approves ------------------------------------------
    const ownerMobile = randomMobile();
    const registration = await newClient().auth.registerPartner({
      mobile: ownerMobile,
      ownerName: 'E2E Owner',
      businessName: `E2E Travels ${Date.now()}`,
    });
    const partnerId = registration.travelPartnerId;
    expect(registration.status).toBe('PENDING_APPROVAL');

    const partner = newClient();
    const owner = await otpLogin(partner, ownerMobile);
    expect(owner.role).toBe('PARTNER_OWNER');
    expect(owner.partnerId).toBe(partnerId);
    expect((await partner.partner.get(partnerId)).status).toBe('PENDING_APPROVAL');

    await admin.admin.partners.activate(partnerId);
    expect((await partner.partner.get(partnerId)).status).toBe('ACTIVE');

    // ---- partner sets up vehicle, its service area, pricing, driver -----------------------
    const registrationNumber = `OD02${Date.now().toString().slice(-6)}`;
    const vehicle = await partner.partner.vehicles.create(partnerId, {
      registrationNumber,
      make: 'Toyota',
      model: 'Innova',
      category: 'SUV',
      passengerCapacity: 7,
    });
    await partner.partner.vehicles.changeStatus(partnerId, vehicle.id, 'make-available');

    // The area belongs to this vehicle: without one it never appears in a search.
    await partner.partner.vehicles.addServiceArea(partnerId, vehicle.id, {
      name: 'Bhubaneswar',
      latitude: 20.2961,
      longitude: 85.8245,
      radiusKm: 50,
    });
    expect(
      (await partner.partner.vehicles.serviceAreas(partnerId, vehicle.id)).map((a) => a.name),
    ).toEqual(['Bhubaneswar']);

    const facilities = await partner.partner.facilities();
    expect(facilities.map((f) => f.code)).toContain('AC');
    const profile = await partner.partner.vehicles.updateProfile(partnerId, vehicle.id, {
      fuelType: 'DIESEL',
      transmission: 'MANUAL',
      modelYear: 2022,
      luggageCapacity: 4,
      facilityCodes: ['AC', 'WATER_BOTTLE'],
    });
    expect(profile.facilities).toHaveLength(2);

    await partner.partner.pricing.create({
      vehicleId: vehicle.id,
      tripType: 'CHAUFFEUR_ONE_WAY',
      baseFee: 600,
      perKmCharge: 20,
      driverAllowance: 350,
      minimumBillableKm: 50,
    });

    const driverMobile = randomMobile();
    const driverRecord = await partner.partner.drivers.create(partnerId, {
      name: 'E2E Driver',
      mobile: driverMobile,
      licenseNumber: `DL${Date.now()}`,
    });
    const driver = newClient();
    expect((await otpLogin(driver, driverMobile)).role).toBe('DRIVER');

    // ---- tourist: search, trip request, negotiate ----------------------------------------
    const tourist = newClient();
    const touristMobile = randomMobile();
    expect((await otpLogin(tourist, touristMobile)).role).toBe('TOURIST');
    await tourist.auth.updateProfile({ displayName: 'E2E Tourist', preferredLanguage: 'en' });

    const search = await newClient().tourist.search({
      pickup: { description: 'Bhubaneswar Airport', latitude: 20.2444, longitude: 85.8178 },
      destination: { description: 'Puri', latitude: 19.8135, longitude: 85.8312 },
      startDate: day,
      endDate: day,
      passengerCount: 4,
      vehicleCategory: 'SUV',
      tripType: 'CHAUFFEUR_ONE_WAY',
    });
    expect(search.distanceKm).toBeGreaterThan(30);
    const option = search.options.find((o) => o.vehicleId === vehicle.id);
    expect(option).toBeDefined();
    expect(option?.fuelType).toBe('DIESEL');
    expect(option?.facilities.map((f) => f.code).sort()).toEqual(['AC', 'WATER_BOTTLE']);
    const listed = option!.price.totalAmount;

    const tripRequestId = await tourist.tourist.tripRequests.create({
      pickupDescription: 'Bhubaneswar Airport',
      pickupLatitude: 20.2444,
      pickupLongitude: 85.8178,
      destinationDescription: 'Puri',
      destinationLatitude: 19.8135,
      destinationLongitude: 85.8312,
      startDate: day,
      endDate: day,
      passengerCount: 4,
      tripBrief: 'Airport to Puri',
      vehicleCategory: 'SUV',
    });
    expect((await tourist.tourist.tripRequests.submit(tripRequestId)).status).toBe('SUBMITTED');

    const offer = Math.round(listed * 0.8 * 100) / 100;
    const counter = Math.round(listed * 0.9 * 100) / 100;

    const negotiation = await tourist.tourist.negotiations.start(tripRequestId, {
      vehicleId: vehicle.id,
      tripType: 'CHAUFFEUR_ONE_WAY',
      offeredAmount: offer,
    });
    expect(negotiation.status).toBe('OFFER_SENT');
    expect(negotiation.trip?.pickup).toBe('Bhubaneswar Airport');

    const inbox = await partner.partner.negotiations.list(partnerId, 'OFFER_SENT');
    expect(inbox.map((n) => n.id)).toContain(negotiation.id);
    expect(
      (await partner.partner.negotiations.respond(negotiation.id, 'COUNTER', counter)).status,
    ).toBe('COUNTER_SENT');

    const accepted = await tourist.tourist.negotiations.respondToCounter(negotiation.id, true);
    expect(accepted.status).toBe('COUNTER_ACCEPTED');
    expect(accepted.agreedAmount).toBe(counter);

    // ---- book (idempotent), pay ----------------------------------------------------------
    const idempotencyKey = `e2e-${Date.now()}`;
    const input = {
      tripRequestId,
      vehicleId: vehicle.id,
      tripType: 'CHAUFFEUR_ONE_WAY' as const,
      negotiationId: negotiation.id,
    };
    const booking = await tourist.tourist.bookings.create(input, idempotencyKey);
    expect(booking.status).toBe('PENDING_PAYMENT');
    expect(booking.totalAmount).toBe(counter);
    expect(booking.commissionAmount).toBeNull();
    expect(booking.vehicle?.registrationNumber).toBe(registrationNumber);
    expect((await tourist.tourist.bookings.create(input, idempotencyKey)).id).toBe(booking.id);

    const payment = await tourist.tourist.payments.initiate(booking.id);
    expect(payment.amount).toBe(booking.tokenAmount);
    await tourist.tourist.payments.simulateSandbox(payment.id, 'SUCCESS');

    const confirmed = await tourist.tourist.bookings.get(booking.id);
    expect(confirmed.status).toBe('CONFIRMED');
    expect((await tourist.tourist.bookings.mine()).map((b) => b.id)).toContain(booking.id);

    // A second tourist cannot take the same vehicle for the same day.
    const rival = newClient();
    await otpLogin(rival, randomMobile());
    const rivalTrip = await rival.tourist.tripRequests.create({
      pickupDescription: 'Bhubaneswar Airport',
      pickupLatitude: 20.2444,
      pickupLongitude: 85.8178,
      destinationDescription: 'Puri',
      destinationLatitude: 19.8135,
      destinationLongitude: 85.8312,
      startDate: day,
      endDate: day,
      passengerCount: 3,
      tripBrief: 'Rival trip',
    });
    await rival.tourist.tripRequests.submit(rivalTrip);
    const rivalError = (await rival.tourist.bookings
      .create({ tripRequestId: rivalTrip, vehicleId: vehicle.id, tripType: 'CHAUFFEUR_ONE_WAY' })
      .catch((e: unknown) => e)) as ApiError;
    expect(rivalError).toBeInstanceOf(ApiError);
    expect(rivalError.status).toBe(409);

    // ---- partner assigns the driver; the driver runs the trip ----------------------------
    const assigned = await partner.partner.bookings.assignDriver(booking.id, driverRecord.id);
    expect(assigned.driver?.name).toBe('E2E Driver');
    expect(assigned.tourist?.mobile).toBeTruthy();

    const seenByTourist = await tourist.tourist.bookings.get(booking.id);
    expect(seenByTourist.driver?.name).toBe('E2E Driver');
    expect(seenByTourist.tourist).toBeNull();

    const trips = await driver.driver.trips();
    expect(trips.map((t: Booking) => t.id)).toContain(booking.id);
    expect((await driver.driver.start(booking.id)).status).toBe('IN_PROGRESS');

    // ---- the driver shares where the car is, and the partner and admin can watch ----------
    await driver.driver.reportLocation(booking.id, {
      latitude: 20.2444,
      longitude: 85.8178,
      accuracyMetres: 12,
      speedKph: 42,
    });

    const partnerView = await partner.partner.liveTrips(partnerId);
    const watched = partnerView.find((trip) => trip.bookingId === booking.id);
    expect(watched?.location?.latitude).toBeCloseTo(20.2444, 3);

    const adminView = await admin.admin.liveTrips();
    expect(adminView.map((trip) => trip.bookingId)).toContain(booking.id);

    // A traveller cannot follow their driver around.
    const touristPeek = (await tourist.admin.liveTrips().catch((e: unknown) => e)) as ApiError;
    expect(touristPeek).toBeInstanceOf(ApiError);

    expect((await driver.driver.complete(booking.id)).status).toBe('COMPLETED');

    // ---- review, settlement, reports -----------------------------------------------------
    const review = await tourist.tourist.bookings.review(booking.id, 5, 'Excellent');
    expect(review.rating).toBe(5);
    expect((await tourist.tourist.partnerRating(partnerId)).reviewCount).toBe(1);

    const wallet = await partner.partner.wallet.get(partnerId);
    expect(wallet.entries.length).toBeGreaterThan(0);

    const earnings = await partner.partner.reports.earnings(partnerId);
    expect(earnings.completedTrips).toBe(1);
    expect(earnings.grossFare).toBe(counter);

    const trips30 = await partner.partner.reports.trips(partnerId);
    expect(trips30.countsByStatus.COMPLETED).toBe(1);

    // ---- notifications & support ---------------------------------------------------------
    const notes = await tourist.notifications.list();
    expect(notes.map((n) => n.type)).toContain('BOOKING_CONFIRMED');
    expect((await tourist.notifications.unreadCount()).unread).toBeGreaterThan(0);
    await tourist.notifications.markAllRead();
    expect((await tourist.notifications.unreadCount()).unread).toBe(0);

    const ticket = await tourist.support.open({
      category: 'BOOKING_ISSUE',
      subject: 'E2E question',
      description: 'Where can I find my invoice?',
      bookingId: booking.id,
    });
    const answered = await admin.support.reply(ticket.ticket.id, 'It is in your bookings list.');
    expect(answered.ticket.status).toBe('IN_PROGRESS');
    expect((await tourist.support.get(ticket.ticket.id)).messages).toHaveLength(2);
    await admin.admin.support.resolve(ticket.ticket.id);

    // ---- admin sees it all ---------------------------------------------------------------
    const dashboardAfter = await admin.admin.dashboard();
    expect(dashboardAfter.bookings.total).toBeGreaterThan(dashboardBefore.bookings.total);

    const payments = await admin.admin.finance.payments();
    expect(payments.payments.map((p) => p.bookingId)).toContain(booking.id);
  });

  it('rejects the wrong people and bad input with typed errors', async () => {
    const stranger = newClient();

    const noToken = (await stranger.tourist.bookings.mine().catch((e: unknown) => e)) as ApiError;
    expect(noToken.status).toBe(401);

    await otpLogin(stranger, randomMobile());
    const forbidden = (await stranger.admin.dashboard().catch((e: unknown) => e)) as ApiError;
    expect(forbidden.status).toBe(403);
    expect(forbidden.code).toBe('FORBIDDEN');

    const badInput = (await newClient()
      .tourist.search({
        pickup: { description: 'A', latitude: 20, longitude: 85 },
        destination: { description: 'B', latitude: 19, longitude: 85 },
        startDate: todayInIndia(),
        endDate: todayInIndia(),
        passengerCount: 0,
      })
      .catch((e: unknown) => e)) as ApiError;
    expect(badInput.status).toBe(400);
  });
});
