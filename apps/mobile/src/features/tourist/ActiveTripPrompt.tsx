import { useCallback, useEffect, useState } from 'react';
import { router } from 'expo-router';
import { AppState, Modal, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '@/config/brand';
import { AppText, Button, CallButton, Card } from '@/shared/ui';
import { toIsoDate } from '@/shared/utils/format';
import { useMyBookings } from './hooks';
import { findOngoingTrip } from './ongoingTrip';
import { TripCodeCard } from './TripCodeCard';

const REFRESH_WHILE_OPEN_MS = 15_000;

/**
 * Brings the ongoing trip to the front when the app opens or returns from the background, so the
 * traveller can see their driver and read out the trip code without hunting for it.
 */
export function ActiveTripPrompt() {
  const bookings = useMyBookings();
  const refetch = bookings.refetch;
  const [open, setOpen] = useState(true);

  const ongoing = findOngoingTrip(bookings.data ?? [], toIsoDate(new Date()));

  // Coming back to the app: get the latest state, then show the trip again.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      void refetch().then(() => setOpen(true));
    });
    return () => subscription.remove();
  }, [refetch]);

  // The code changes when the trip starts, so keep it fresh while the card is showing.
  useEffect(() => {
    if (!ongoing || !open) return;
    const timer = setInterval(() => void refetch(), REFRESH_WHILE_OPEN_MS);
    return () => clearInterval(timer);
  }, [ongoing, open, refetch]);

  const close = useCallback(() => setOpen(false), []);

  if (!ongoing || !open) return null;

  const started = ongoing.status === 'IN_PROGRESS';

  return (
    <Modal animationType="slide" transparent onRequestClose={close}>
      <View style={styles.backdrop}>
        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          <ScrollView contentContainerStyle={styles.content}>
            <AppText variant="heading" color="primaryDark">
              {started ? 'Your trip is on' : 'Your driver is ready'}
            </AppText>
            <AppText variant="title" style={styles.route}>
              {ongoing.pickup} → {ongoing.destination}
            </AppText>

            {ongoing.driver ? (
              <Card>
                <AppText variant="small" color="textMuted">
                  Your driver
                </AppText>
                <AppText variant="subheading">{ongoing.driver.name ?? 'Driver'}</AppText>
                {ongoing.vehicle ? (
                  <AppText color="textMuted">
                    {ongoing.vehicle.make} {ongoing.vehicle.model} ·{' '}
                    {ongoing.vehicle.registrationNumber}
                  </AppText>
                ) : null}
                <CallButton title="Call driver" mobile={ongoing.driver.mobile} />
              </Card>
            ) : null}

            {ongoing.tripCode ? <TripCodeCard code={ongoing.tripCode} started={started} /> : null}

            <View style={styles.actions}>
              <Button
                title="View trip"
                onPress={() => {
                  close();
                  router.push({ pathname: '/(tourist)/booking/[id]', params: { id: ongoing.id } });
                }}
              />
              <Button title="Close" variant="ghost" onPress={close} />
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
  sheet: {
    maxHeight: '85%',
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  content: { padding: spacing.lg, gap: spacing.md },
  route: { marginBottom: spacing.xs },
  actions: { marginTop: spacing.sm },
});
