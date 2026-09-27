import { router } from 'expo-router';
import { useMyNegotiations } from '@/features/tourist/hooks';
import { OffersInProgress } from './OffersInProgress';

/** The tourist's offers that are still open, wherever this is placed. */
export function TouristOffers() {
  const query = useMyNegotiations();

  return (
    <OffersInProgress
      negotiations={query.data ?? []}
      perspective="tourist"
      onOpen={(negotiation) =>
        router.push({ pathname: '/(tourist)/negotiation/[id]', params: { id: negotiation.id } })
      }
    />
  );
}
