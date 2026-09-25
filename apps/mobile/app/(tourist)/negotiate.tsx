import { useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { NegotiationPanel } from '@/features/tourist/NegotiationPanel';
import { useBookingFlow } from '@/features/tourist/bookingFlow';
import { useStartNegotiation } from '@/features/tourist/hooks';
import { offerSchema } from '@/features/tourist/schemas';
import { AppText, Button, EmptyState, FormTextField, Screen, Spacer } from '@/shared/ui';
import { showError } from '@/shared/utils/feedback';
import { formatMoney } from '@/shared/utils/format';

export default function Negotiate() {
  const option = useBookingFlow((state) => state.option);
  const negotiation = useBookingFlow((state) => state.negotiation);
  const setNegotiation = useBookingFlow((state) => state.setNegotiation);
  const start = useStartNegotiation();

  const schema = useMemo(
    () => offerSchema(option?.price.totalAmount ?? 0, option?.price.currency),
    [option?.price.totalAmount, option?.price.currency],
  );
  const { control, handleSubmit } = useForm<{ amount: string }, unknown, { amount: number }>({
    resolver: zodResolver(schema),
    defaultValues: { amount: '' },
  });

  if (!option) {
    return (
      <EmptyState
        title="Choose a vehicle first"
        action={<Button title="Back" onPress={() => router.back()} />}
      />
    );
  }

  const sameOption =
    negotiation?.vehicleId === option.vehicleId && negotiation.tripType === option.tripType;

  if (negotiation && sameOption) {
    return (
      <Screen>
        <NegotiationPanel
          negotiationId={negotiation.id}
          onBookAgreed={() => router.push('/(tourist)/checkout')}
          onBookListed={() => {
            setNegotiation(null);
            router.push('/(tourist)/checkout');
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <Button
          title="Send offer"
          loading={start.isPending}
          onPress={handleSubmit(({ amount }) =>
            start.mutate(amount, {
              onError: (error) => showError(error, 'Could not send your offer'),
            }),
          )}
          testID="send-offer"
        />
      }
    >
      <AppText variant="title">Ask for a better price</AppText>
      <AppText color="textMuted">
        {option.travelPartnerName} lists this trip at{' '}
        {formatMoney(option.price.totalAmount, option.price.currency)}.
      </AppText>
      <Spacer size="lg" />
      <FormTextField
        control={control}
        name="amount"
        label="Your offer (INR)"
        keyboardType="decimal-pad"
        placeholder="e.g. 1800"
        testID="offer-input"
      />
      <AppText variant="small" color="textMuted">
        How it works: you make one offer. The partner can accept, decline, or send one counter
        offer, which you can accept or decline. Offers expire if nobody answers.
      </AppText>
    </Screen>
  );
}
