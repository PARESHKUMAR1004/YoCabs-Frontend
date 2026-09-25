import { router, useLocalSearchParams } from 'expo-router';
import { useDriverTrip, useTripAction } from '@/features/driver/hooks';
import { useTripSharing } from '@/features/driver/useTripSharing';
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
import { showError } from '@/shared/utils/feedback';
import { formatDateRange } from '@/shared/utils/format';
import { bookingStatusLabel, bookingStatusTone, tripTypeLabel } from '@/shared/utils/labels';

export default function DriverTrip() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useDriverTrip(id);
  const action = useTripAction(id);
  const sharing = useTripSharing(id);

  const run = async (name: 'start' | 'complete', code: string) => {
    // Location sharing lasts exactly as long as the trip: it starts here and stops on completion.
    if (name === 'start' && !(await sharing.begin())) {
      return;
    }

    action.mutate(
      { action: name, code },
      {
        onSuccess: () => {
          if (name === 'complete') void sharing.end();
        },
        onError: (error) => {
          // A wrong code means the trip did not start, so stop tracking the driver again.
          if (name === 'start') void sharing.end();
          showError(error, 'That did not work');
        },
      },
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

          {sharing.sharing ? (
            <>
              <Spacer size="sm" />
              <Card>
                <AppText variant="subheading" color="success">
                  Sharing your location
                </AppText>
                <AppText variant="small" color="textMuted">
                  Your travel partner can see where you are. This stops when you complete the trip.
                </AppText>
              </Card>
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
              onSubmit={(code) => void run('start', code)}
            />
          ) : null}
          {trip.status === 'IN_PROGRESS' ? (
            <TripCodeEntry
              heading="Complete the trip"
              hint="At the destination, ask the traveller for the completion code shown in their app."
              buttonTitle="Complete trip"
              loading={action.isPending}
              onSubmit={(code) => void run('complete', code)}
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
