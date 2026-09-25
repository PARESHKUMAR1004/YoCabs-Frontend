import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { usePartnerNegotiation, useRespondToOffer } from '@/features/partner/hooks';
import {
  AppText,
  Badge,
  Button,
  Card,
  KeyValue,
  QueryBoundary,
  Screen,
  Spacer,
  TextField,
} from '@/shared/ui';
import { showError } from '@/shared/utils/feedback';
import { formatDateRange, formatMoney } from '@/shared/utils/format';
import { negotiationStatusLabel, negotiationStatusTone } from '@/shared/utils/labels';

export default function PartnerNegotiation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = usePartnerNegotiation(id);
  const respond = useRespondToOffer(id);
  const [counter, setCounter] = useState('');

  const send = (decision: 'ACCEPT' | 'REJECT' | 'COUNTER', counterAmount?: number) =>
    respond.mutate(
      { decision, counterAmount },
      { onError: (error) => showError(error, 'Could not send your answer') },
    );

  return (
    <QueryBoundary query={query}>
      {(negotiation) => {
        const counterAmount = Number(counter);
        const validCounter =
          Number.isFinite(counterAmount) &&
          counterAmount > negotiation.offeredAmount &&
          counterAmount <= negotiation.listedAmount;

        return (
          <Screen refreshing={query.isRefetching} onRefresh={() => void query.refetch()}>
            <AppText variant="title">
              {negotiation.trip
                ? `${negotiation.trip.pickup} → ${negotiation.trip.destination}`
                : 'Price offer'}
            </AppText>
            {negotiation.trip ? (
              <AppText color="textMuted">
                {formatDateRange(negotiation.trip.startDate, negotiation.trip.endDate)} ·{' '}
                {negotiation.trip.passengerCount} passengers
              </AppText>
            ) : null}
            <Spacer size="sm" />
            <Badge
              label={negotiationStatusLabel(negotiation.status)}
              tone={negotiationStatusTone(negotiation.status)}
            />
            <Spacer />

            <Card>
              <KeyValue
                label="Your listed price"
                value={formatMoney(negotiation.listedAmount, negotiation.currency)}
              />
              <KeyValue
                label="Traveller offers"
                value={formatMoney(negotiation.offeredAmount, negotiation.currency)}
                emphasise
              />
              {negotiation.counterAmount !== null ? (
                <KeyValue
                  label="Your counter"
                  value={formatMoney(negotiation.counterAmount, negotiation.currency)}
                />
              ) : null}
              {negotiation.agreedAmount !== null ? (
                <KeyValue
                  label="Agreed price"
                  value={formatMoney(negotiation.agreedAmount, negotiation.currency)}
                  emphasise
                />
              ) : null}
            </Card>

            {negotiation.status === 'OFFER_SENT' ? (
              <>
                <Button
                  title="Accept offer"
                  loading={respond.isPending}
                  onPress={() => send('ACCEPT')}
                />
                <Spacer size="sm" />
                <TextField
                  label="Or counter with your price (INR)"
                  value={counter}
                  onChangeText={setCounter}
                  keyboardType="decimal-pad"
                  hint="Must be above the offer and no more than your listed price. You can counter once."
                />
                <Button
                  title="Send counter offer"
                  variant="secondary"
                  disabled={!validCounter}
                  onPress={() => send('COUNTER', counterAmount)}
                />
                <Spacer size="sm" />
                <Button title="Decline" variant="danger" onPress={() => send('REJECT')} />
              </>
            ) : null}
          </Screen>
        );
      }}
    </QueryBoundary>
  );
}
