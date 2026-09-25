import { useMutation } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { NegotiationPanel } from '@/features/tourist/NegotiationPanel';
import { api } from '@/shared/api/client';
import { Screen } from '@/shared/ui';
import { showError } from '@/shared/utils/feedback';
import type { Negotiation } from '@yocabs/api-client';

/** Opened from a notification: books straight from the negotiation, without the search flow. */
export default function NegotiationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [busy, setBusy] = useState(false);

  const book = useMutation({
    // Stable key per negotiation: a repeated tap can never book twice.
    mutationFn: (negotiation: Negotiation) =>
      api.tourist.bookings.create(
        {
          tripRequestId: negotiation.tripRequestId,
          vehicleId: negotiation.vehicleId,
          tripType: negotiation.tripType,
          negotiationId: negotiation.agreedAmount !== null ? negotiation.id : undefined,
        },
        `negotiation-${negotiation.id}`,
      ),
    onSuccess: (booking) =>
      router.replace({ pathname: '/(tourist)/payment', params: { bookingId: booking.id } }),
    onError: (error) => showError(error, 'Could not create the booking'),
    onSettled: () => setBusy(false),
  });

  return (
    <Screen>
      <NegotiationPanel
        negotiationId={id}
        onBookAgreed={(negotiation) => {
          if (!busy) {
            setBusy(true);
            book.mutate(negotiation);
          }
        }}
        onBookListed={() => router.replace('/(tourist)/(tabs)')}
      />
    </Screen>
  );
}
