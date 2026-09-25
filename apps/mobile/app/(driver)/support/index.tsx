import { router } from 'expo-router';
import { TicketListScreen } from '@/features/support/TicketListScreen';

export default function DriverSupport() {
  return (
    <TicketListScreen
      onNew={() => router.push('/(driver)/support/new')}
      onOpen={(id) => router.push({ pathname: '/(driver)/support/[id]', params: { id } })}
    />
  );
}
