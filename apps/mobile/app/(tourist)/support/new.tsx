import { router, useLocalSearchParams } from 'expo-router';
import { NewTicketScreen } from '@/features/support/NewTicketScreen';

export default function NewTouristTicket() {
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();

  return (
    <NewTicketScreen
      bookingId={bookingId}
      onCreated={(id) => router.replace({ pathname: '/(tourist)/support/[id]', params: { id } })}
    />
  );
}
