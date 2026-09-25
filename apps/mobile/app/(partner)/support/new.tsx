import { router, useLocalSearchParams } from 'expo-router';
import { NewTicketScreen } from '@/features/support/NewTicketScreen';

export default function NewPartnerTicket() {
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();

  return (
    <NewTicketScreen
      bookingId={bookingId}
      onCreated={(id) => router.replace({ pathname: '/(partner)/support/[id]', params: { id } })}
    />
  );
}
