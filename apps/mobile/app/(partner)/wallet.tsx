import { useState } from 'react';
import { usePayouts, useRequestPayout, useWallet } from '@/features/partner/hooks';
import {
  AppText,
  Badge,
  Button,
  Card,
  KeyValue,
  QueryBoundary,
  Screen,
  SectionHeader,
  TextField,
} from '@/shared/ui';
import { showError, showInfo } from '@/shared/utils/feedback';
import { formatDateTime, formatMoney, humanize } from '@/shared/utils/format';

const PAYOUT_TONES = { REQUESTED: 'warning', PAID: 'success', REJECTED: 'danger' } as const;

export default function Wallet() {
  const wallet = useWallet();
  const payouts = usePayouts();
  const request = useRequestPayout();
  const [amount, setAmount] = useState('');

  const value = Number(amount);
  const available = wallet.data?.availableForPayout ?? 0;
  const valid = Number.isFinite(value) && value > 0 && value <= available;

  const onRequest = () =>
    request.mutate(value, {
      onSuccess: () => {
        setAmount('');
        showInfo('Payout requested', 'YoCabs will transfer it to your bank account.');
      },
      onError: (error) => showError(error, 'Could not request the payout'),
    });

  return (
    <QueryBoundary query={wallet}>
      {(data) => (
        <Screen refreshing={wallet.isRefetching} onRefresh={() => void wallet.refetch()}>
          <Card>
            <KeyValue label="Wallet balance" value={formatMoney(data.balance)} emphasise />
            <KeyValue label="Pending payouts" value={formatMoney(data.pendingPayouts)} />
            <KeyValue
              label="Available to withdraw"
              value={formatMoney(data.availableForPayout)}
              emphasise
            />
          </Card>

          <TextField
            label="Withdraw amount (INR)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
          <Button
            title="Request payout"
            disabled={!valid}
            loading={request.isPending}
            onPress={onRequest}
          />

          {payouts.data?.length ? (
            <>
              <SectionHeader title="Payout requests" />
              {payouts.data.map((payout) => (
                <Card key={payout.id}>
                  <KeyValue
                    label={formatDateTime(payout.createdAt)}
                    value={
                      <Badge label={humanize(payout.status)} tone={PAYOUT_TONES[payout.status]} />
                    }
                  />
                  <AppText variant="subheading">{formatMoney(payout.amount)}</AppText>
                  {payout.bankReference ? (
                    <AppText variant="small" color="textMuted">
                      Ref {payout.bankReference}
                    </AppText>
                  ) : null}
                  {payout.note ? (
                    <AppText variant="small" color="textMuted">
                      {payout.note}
                    </AppText>
                  ) : null}
                </Card>
              ))}
            </>
          ) : null}

          <SectionHeader title="Transactions" />
          {data.entries.length === 0 ? (
            <AppText color="textMuted">No transactions yet.</AppText>
          ) : null}
          {data.entries.map((entry) => (
            <KeyValue
              key={entry.id}
              label={`${entry.description} · ${formatDateTime(entry.createdAt)}`}
              value={`${entry.type === 'CREDIT' ? '+' : '-'}${formatMoney(entry.amount)}`}
            />
          ))}
        </Screen>
      )}
    </QueryBoundary>
  );
}
