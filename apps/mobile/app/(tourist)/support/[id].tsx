import { useLocalSearchParams } from 'expo-router';
import { TicketChatScreen } from '@/features/support/TicketChatScreen';

export default function TouristTicket() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <TicketChatScreen ticketId={id} />;
}
