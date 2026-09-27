import { router, useLocalSearchParams } from 'expo-router';
import { useDriverTrip, useTripAction } from '@/features/driver/hooks';
import { DutyBanner } from '@/features/driver/DutyBanner';
import { useDutyStatus } from '@/features/driver/dutyStatus';
import { TripCodeEntry } from '@/features/trip/TripCodeEntry';
import {
  AppText,
  Badge,
  Button,
  CallButton,
  Card,
  KeyValue,
  QueryBoundary,
  Screen,
  SectionHeader,
  Spacer,
} from '@/shared/ui';
import { confirmAction, showError, showInfo } from '@/shared/utils/feedback';
import { formatDateRange } from '@/shared/utils/format';
import { bookingStatusLabel, bookingStatusTone, tripTypeLabel } from '@/shared/utils/labels';

export default function DriverTrip() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useDriverTrip(id);
  const action = useTripAction(id);
  const dutyState = useDutyStatus((state) => state.state);

  const start = (code: string) => {
    // A trip cannot start with location off: the traveller follows the driver from here.
    if (dutyState !== 'on') {
      showInfo(
        'Turn on your location first',
        'Location has to be on before the trip can start. Allow it above, then try again.',
      );
      return;
    }

    action.mutate(
      { action: 'start', code },
      { onError: (error) => showError(error, 'That did not work') },
    );
  };

  const complete = async () => {
    const arrived = await confirmAction(
      'Complete this trip?',
      'Confirm that you have reached the destination. The traveller will then be asked to pay the balance.',
      'Yes, complete',
    );
    if (!arrived) return;

    action.mutate(
      { action: 'complete' },
      { onError: (error) => showError(error, 'That did not work') },
    );
  };

  return (
    <QueryBoundary query={query}>
      {(trip) => (
        <Screen refreshing={query.isRefetching} onRefresh={() => void query.refetch()}>
          <AppText variant="title">
            {trip.pickup} → {trip.destination}
          </AppText>
          <AppText color="textMuted">{formatDateRange(trip.startDate, trip.endDate)}</AppText>
          <Spacer size="sm" />
          <Badge label={bookingStatusLabel(trip.status)} tone={bookingStatusTone(trip.status)} />

          {trip.status === 'CONFIRMED' || trip.status === 'IN_PROGRESS' ? (
            <>
              <Spacer size="sm" />
              <DutyBanner />
            </>
          ) : null}

          <SectionHeader title="Trip" />
          <Card>
            <KeyValue label="Type" value={tripTypeLabel(trip.tripType)} />
            {trip.vehicle ? (
              <KeyValue
                label="Vehicle"
                value={`${trip.vehicle.make} ${trip.vehicle.model} · ${trip.vehicle.registrationNumber}`}
              />
            ) : null}
          </Card>

          {trip.tourist ? (
            <>
              <SectionHeader title="Traveller" />
              <Card>
                <AppText variant="subheading">{trip.tourist.name ?? 'Traveller'}</AppText>
                <CallButton title="Call traveller" mobile={trip.tourist.mobile} />
              </Card>
            </>
          ) : null}

          {trip.status === 'CONFIRMED' ? (
            <TripCodeEntry
              heading="Start the trip"
              hint="Ask the traveller for the start code shown in their YoCabs app."
              buttonTitle="Start trip"
              loading={action.isPending}
              onSubmit={(code) => start(code)}
            />
          ) : null}
          {trip.status === 'IN_PROGRESS' ? (
            <Button
              title="I have reached the destination"
              loading={action.isPending}
              onPress={() => void complete()}
              testID="complete-trip"
            />
          ) : null}
          <Spacer size="sm" />
          <Button
            title="Report a problem"
            variant="ghost"
            onPress={() =>
              router.push({ pathname: '/(driver)/support/new', params: { bookingId: trip.id } })
            }
          />
        </Screen>
      )}
    </QueryBoundary>
  );
}
