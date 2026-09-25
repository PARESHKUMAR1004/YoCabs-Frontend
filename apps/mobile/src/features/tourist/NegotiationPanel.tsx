import { StyleSheet, View } from 'react-native';
import { spacing } from '@/config/brand';
import { useNegotiation, useRespondToCounter } from '@/features/tourist/hooks';
import type { Negotiation } from '@yocabs/api-client';
import { AppText, Badge, Button, Card, KeyValue, QueryBoundary } from '@/shared/ui';
import { showError } from '@/shared/utils/feedback';
import { formatDateTime, formatMoney } from '@/shared/utils/format';
import { negotiationStatusLabel, negotiationStatusTone } from '@/shared/utils/labels';

interface Props {
  negotiationId: string;
  /** The price is agreed (offer accepted or counter accepted): go and book at it. */
  onBookAgreed: (negotiation: Negotiation) => void;
  /** No deal: carry on at the listed price. */
  onBookListed: () => void;
}

/** The one-offer / one-counter negotiation, from the tourist's side. */
export function NegotiationPanel({ negotiationId, onBookAgreed, onBookListed }: Props) {
  const query = useNegotiation(negotiationId);
  const respond = useRespondToCounter(negotiationId);

  return (
    <QueryBoundary query={query}>
      {(n) => (
        <View>
          <Card>
            <Badge
              label={negotiationStatusLabel(n.status)}
              tone={negotiationStatusTone(n.status)}
            />
            <View style={styles.gap} />
            {n.partnerName ? <AppText variant="subheading">{n.partnerName}</AppText> : null}
            {n.vehicle ? (
              <AppText color="textMuted">
                {n.vehicle.make} {n.vehicle.model}
              </AppText>
            ) : null}
            <View style={styles.gap} />
            <KeyValue label="Listed price" value={formatMoney(n.listedAmount, n.currency)} />
            <KeyValue label="Your offer" value={formatMoney(n.offeredAmount, n.currency)} />
            {n.counterAmount !== null ? (
              <KeyValue
                label="Partner's counter offer"
                value={formatMoney(n.counterAmount, n.currency)}
                emphasise
              />
            ) : null}
            {n.agreedAmount !== null ? (
              <KeyValue
                label="Agreed price"
                value={formatMoney(n.agreedAmount, n.currency)}
                emphasise
              />
            ) : null}
            {n.status === 'OFFER_SENT' || n.status === 'COUNTER_SENT' ? (
              <AppText variant="small" color="textMuted">
                Answer by {formatDateTime(n.expiresAt)}
              </AppText>
            ) : null}
          </Card>

          {n.status === 'OFFER_SENT' ? (
            <AppText color="textMuted">
              The travel partner has been notified. This page updates when they reply.
            </AppText>
          ) : null}

          {n.status === 'COUNTER_SENT' ? (
            <View style={styles.actions}>
              <Button
                title={`Accept ${formatMoney(n.counterAmount, n.currency)}`}
                loading={respond.isPending}
                onPress={() => respond.mutate(true, { onError: (error) => showError(error) })}
                testID="accept-counter"
              />
              <Button
                title="Decline"
                variant="secondary"
                disabled={respond.isPending}
                onPress={() => respond.mutate(false, { onError: (error) => showError(error) })}
              />
            </View>
          ) : null}

          {n.agreedAmount !== null ? (
            <Button
              title={`Book at ${formatMoney(n.agreedAmount, n.currency)}`}
              onPress={() => onBookAgreed(n)}
              testID="book-agreed"
            />
          ) : null}

          {n.status === 'REJECTED' || n.status === 'COUNTER_REJECTED' || n.status === 'EXPIRED' ? (
            <View style={styles.actions}>
              <AppText color="textMuted">
                There is no agreed price. You can still book at the listed price of{' '}
                {formatMoney(n.listedAmount, n.currency)}.
              </AppText>
              <Button title="Book at listed price" onPress={onBookListed} />
            </View>
          ) : null}
        </View>
      )}
    </QueryBoundary>
  );
}

const styles = StyleSheet.create({
  gap: { height: spacing.sm },
  actions: { gap: spacing.md, marginTop: spacing.md },
});
