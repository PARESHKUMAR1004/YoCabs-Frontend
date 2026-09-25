import { router, useLocalSearchParams } from 'expo-router';
import { NewTicketScreen } from '@/features/support/NewTicketScreen';

export default function NewDriverTicket() {
  const { bookingId, category } = useLocalSearchParams<{ bookingId?: string; category?: string }>();

  return (
    <NewTicketScreen
      bookingId={bookingId}
      defaultCategory={category === 'SAFETY' ? 'SAFETY' : 'DRIVER_ISSUE'}
      onCreated={(id) => router.replace({ pathname: '/(driver)/support/[id]', params: { id } })}
    />
  );
}
