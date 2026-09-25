import { router } from 'expo-router';
import { TicketListScreen } from '@/features/support/TicketListScreen';

export default function TouristSupport() {
  return (
    <TicketListScreen
      onNew={() => router.push('/(tourist)/support/new')}
      onOpen={(id) => router.push({ pathname: '/(tourist)/support/[id]', params: { id } })}
    />
  );
}
