import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import {
  useBookingAction,
  useDrivers,
  usePartnerBooking,
  useTripLocation,
} from '@/features/partner/hooks';
import { MapCanvas } from '@/shared/maps';
import {
  AppText,
  Badge,
  Button,
  CallButton,
  Card,
  ChoiceChips,
  KeyValue,
  QueryBoundary,
  Screen,
  SectionHeader,
  Spacer,
} from '@/shared/ui';
import { TripCodeEntry } from '@/features/trip/TripCodeEntry';
import { confirmAction, showError } from '@/shared/utils/feedback';
import { formatDateRange, formatDateTime, formatMoney } from '@/shared/utils/format';
import { bookingStatusLabel, bookingStatusTone, tripTypeLabel } from '@/shared/utils/labels';

export default function PartnerBookingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = usePartnerBooking(id);
  const drivers = useDrivers();
  const action = useBookingAction(id);
  const [driverId, setDriverId] = useState<string>();
  const live = useTripLocation(id, query.data?.status === 'IN_PROGRESS');

  const run = (name: 'assignDriver' | 'start' | 'complete' | 'cancel', value?: string) =>
    action.mutate(
      { action: name, value },
      { onError: (error) => showError(error, 'That did not work') },
    );

  const onCancel = async () => {
    if (
      await confirmAction(
        'Cancel this booking?',
        'The traveller will be refunded per the cancellation policy.',
        'Cancel booking',
        true,
      )
    ) {
      run('cancel', 'Cancelled by travel partner');
    }
  };

  return (
    <QueryBoundary query={query}>
      {(booking) => {
        const activeDrivers = (drivers.data ?? []).filter((driver) => driver.status === 'ACTIVE');
        const chosen = driverId ?? booking.driverId ?? undefined;

        return (
          <Screen refreshing={query.isRefetching} onRefresh={() => void query.refetch()}>
            <AppText variant="title">
              {booking.pickup} → {booking.destination}
            </AppText>
            <AppText color="textMuted">
              {formatDateRange(booking.startDate, booking.endDate)}
            </AppText>
            <Spacer size="sm" />
            <Badge
              label={bookingStatusLabel(booking.status)}
              tone={bookingStatusTone(booking.status)}
            />

            <SectionHeader title="Trip" />
            <Card>
              <KeyValue label="Type" value={tripTypeLabel(booking.tripType)} />
              {booking.vehicle ? (
                <KeyValue
                  label="Vehicle"
                  value={`${booking.vehicle.make} ${booking.vehicle.model}`}
                />
              ) : null}
              <KeyValue label="Fare" value={formatMoney(booking.totalAmount, booking.currency)} />
              <KeyValue
                label="Token paid to YoCabs"
                value={formatMoney(booking.tokenAmount, booking.currency)}
              />
              <KeyValue
                label="Collect from traveller"
                value={formatMoney(booking.totalAmount - booking.tokenAmount, booking.currency)}
                emphasise
              />
              <KeyValue
                label="YoCabs commission"
                value={formatMoney(booking.commissionAmount, booking.currency)}
              />
            </Card>

            {booking.status === 'IN_PROGRESS' ? (
              <>
                <SectionHeader title="Where the car is" />
                {live.data ? (
                  <>
                    <MapCanvas
                      markers={[
                        {
                          id: 'car',
                          kind: 'pickup',
                          label: 'Vehicle',
                          latitude: live.data.latitude,
                          longitude: live.data.longitude,
                        },
                      ]}
                      height={220}
                      testID="live-trip-map"
                    />
                    <AppText variant="small" color="textMuted">
                      Updated {formatDateTime(live.data.recordedAt)}
                    </AppText>
                  </>
                ) : (
                  <AppText color="textMuted">
                    Waiting for the driver to share their location. It appears here once they do.
                  </AppText>
                )}
              </>
            ) : null}

            {booking.tourist ? (
              <>
                <SectionHeader title="Traveller" />
                <Card>
                  <AppText variant="subheading">{booking.tourist.name ?? 'Traveller'}</AppText>
                  <CallButton title="Call traveller" mobile={booking.tourist.mobile} />
                </Card>
              </>
            ) : null}

            {booking.status === 'CONFIRMED' ? (
              <>
                <SectionHeader title="Driver" />
                <Card>
                  {booking.driver ? <AppText>Assigned: {booking.driver.name}</AppText> : null}
                  {activeDrivers.length === 0 ? (
                    <AppText color="textMuted">Add a driver in More → Drivers first.</AppText>
                  ) : (
                    <ChoiceChips
                      horizontal={false}
                      options={activeDrivers.map((driver) => ({
                        value: driver.id,
                        label: driver.name,
                      }))}
                      value={chosen}
                      onChange={setDriverId}
                    />
                  )}
                  <Button
                    title={booking.driver ? 'Change driver' : 'Assign driver'}
                    variant="secondary"
                    disabled={!driverId || driverId === booking.driverId}
                    loading={action.isPending}
                    onPress={() => run('assignDriver', driverId)}
                  />
                </Card>
              </>
            ) : null}

            {booking.status === 'CONFIRMED' ? (
              <TripCodeEntry
                heading="Start the trip"
                hint="The traveller reads this out from their app once they are in the cab."
                buttonTitle="Start trip"
                loading={action.isPending}
                disabled={!booking.driverId}
                onSubmit={(code) => run('start', code)}
              />
            ) : null}
            {booking.status === 'IN_PROGRESS' ? (
              <TripCodeEntry
                heading="Complete the trip"
                hint="The traveller reads this out from their app at the destination."
                buttonTitle="Complete trip"
                loading={action.isPending}
                onSubmit={(code) => run('complete', code)}
              />
            ) : null}
            {booking.status === 'CONFIRMED' ? (
              <>
                <Spacer size="sm" />
                <Button title="Cancel booking" variant="danger" onPress={() => void onCancel()} />
              </>
            ) : null}
          </Screen>
        );
      }}
    </QueryBoundary>
  );
}
