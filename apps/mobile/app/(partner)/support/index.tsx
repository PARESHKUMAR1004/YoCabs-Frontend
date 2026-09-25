import { router } from 'expo-router';
import { TicketListScreen } from '@/features/support/TicketListScreen';

export default function PartnerSupport() {
  return (
    <TicketListScreen
      onNew={() => router.push('/(partner)/support/new')}
      onOpen={(id) => router.push({ pathname: '/(partner)/support/[id]', params: { id } })}
    />
  );
}
