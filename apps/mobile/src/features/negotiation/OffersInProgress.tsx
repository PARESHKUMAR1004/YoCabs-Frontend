import type { Negotiation } from '@yocabs/api-client';
import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/config/brand';
import { AppText, Badge, Card, Row } from '@/shared/ui';
import { formatDate, formatMoney } from '@/shared/utils/format';
import { negotiationStatusLabel, negotiationStatusTone } from '@/shared/utils/labels';
import { isOpen, nextStep, sortForAttention, type Perspective } from './negotiationProgress';

/**
 * Price offers still being talked through, most urgent first, each saying what happens next and
 * whether it is waiting on you. Renders nothing when there are none, so it can sit on any screen.
 */
export function OffersInProgress({
  negotiations,
  perspective,
  onOpen,
  title = 'Offers in progress',
}: {
  negotiations: Negotiation[];
  perspective: Perspective;
  onOpen: (negotiation: Negotiation) => void;
  title?: string;
}) {
  const open = sortForAttention(negotiations.filter(isOpen), perspective);

  if (open.length === 0) return null;

  const needingYou = open.filter(
    (negotiation) => nextStep(negotiation, perspective).needsYou,
  ).length;

  return (
    <View style={styles.section}>
      <Row style={styles.heading}>
        <AppText variant="heading" style={styles.flex}>
          {title}
        </AppText>
        {needingYou > 0 ? (
          <View style={styles.pill}>
            <AppText variant="caption" color="textOnPrimary">
              {needingYou} need{needingYou === 1 ? 's' : ''} you
            </AppText>
          </View>
        ) : null}
      </Row>

      {open.map((negotiation) => {
        const step = nextStep(negotiation, perspective);

        return (
          <Card
            key={negotiation.id}
            onPress={() => onOpen(negotiation)}
            style={step.needsYou ? styles.needsYou : undefined}
          >
            <Row style={styles.top}>
              <AppText variant="subheading" style={styles.flex} numberOfLines={1}>
                {negotiation.trip
                  ? `${negotiation.trip.pickup} → ${negotiation.trip.destination}`
                  : 'Price offer'}
              </AppText>
              <Badge
                label={negotiationStatusLabel(negotiation.status)}
                tone={negotiationStatusTone(negotiation.status)}
              />
            </Row>
            <AppText variant="small" color="textMuted">
              {negotiation.trip ? `${formatDate(negotiation.trip.startDate)} · ` : ''}
              {negotiation.vehicle
                ? `${negotiation.vehicle.make} ${negotiation.vehicle.model}`
                : ''}
            </AppText>
            <AppText style={styles.prices}>
              Listed {formatMoney(negotiation.listedAmount, negotiation.currency)} · Offer{' '}
              {formatMoney(negotiation.offeredAmount, negotiation.currency)}
              {negotiation.counterAmount !== null
                ? ` · Counter ${formatMoney(negotiation.counterAmount, negotiation.currency)}`
                : ''}
            </AppText>
            <AppText
              variant="caption"
              color={step.needsYou ? 'primaryDark' : 'textMuted'}
              style={styles.step}
            >
              {step.text}
            </AppText>
          </Card>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  section: { marginBottom: spacing.md },
  heading: { marginBottom: spacing.sm, gap: spacing.sm },
  pill: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
  },
  needsYou: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  top: { gap: spacing.sm, marginBottom: spacing.xs },
  prices: { marginTop: spacing.sm },
  step: { marginTop: spacing.xs },
});
