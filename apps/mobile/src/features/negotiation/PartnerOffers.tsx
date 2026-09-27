import { router } from 'expo-router';
import { usePartnerNegotiations } from '@/features/partner/hooks';
import { OffersInProgress } from './OffersInProgress';

/** Offers on the partner's cabs that are still open: the ones needing an answer come first. */
export function PartnerOffers() {
  const query = usePartnerNegotiations();

  return (
    <OffersInProgress
      negotiations={query.data ?? []}
      perspective="partner"
      onOpen={(negotiation) =>
        router.push({ pathname: '/(partner)/negotiation/[id]', params: { id: negotiation.id } })
      }
    />
  );
}
