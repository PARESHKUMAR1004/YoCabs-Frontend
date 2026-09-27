import { Linking, StyleSheet, View } from 'react-native';
import { spacing } from '@/config/brand';
import { AppText, Button, Card } from '@/shared/ui';
import { useDutyStatus } from './dutyStatus';

/**
 * Says whether the driver's location is being shared. When it is not, and a trip needs it, it says
 * why and offers the way to fix it: there is no way to carry on without location.
 */
export function DutyBanner() {
  const state = useDutyStatus((current) => current.state);
  const reason = useDutyStatus((current) => current.reason);
  const retry = useDutyStatus((current) => current.retry);

  if (state === 'off') return null;

  if (state === 'blocked') {
    return (
      <Card>
        <AppText variant="subheading" color="danger">
          Location is off
        </AppText>
        <AppText color="textMuted" style={styles.text}>
          {reason} Location has to be on for your trip: the traveller follows you on the map, and
          the trip cannot start without it.
        </AppText>
        <View style={styles.actions}>
          <Button title="Allow location" onPress={retry} testID="allow-location" />
          <Button
            title="Open phone settings"
            variant="ghost"
            onPress={() => void Linking.openSettings()}
          />
        </View>
      </Card>
    );
  }

  return (
    <Card>
      <AppText variant="subheading" color={state === 'on' ? 'success' : 'textMuted'}>
        {state === 'on' ? 'Sharing your location' : 'Turning on your location…'}
      </AppText>
      <AppText variant="small" color="textMuted">
        The traveller and your travel partner can see where you are. It stays on until you complete
        the trip.
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  text: { marginTop: spacing.xs, marginBottom: spacing.md },
  actions: { gap: spacing.xs },
});
