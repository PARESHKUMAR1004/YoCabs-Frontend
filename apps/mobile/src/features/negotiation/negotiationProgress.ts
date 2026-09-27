import type { Negotiation } from '@yocabs/api-client';
import { formatMoney } from '@/shared/utils/format';

export type Perspective = 'tourist' | 'partner';

export const isOpen = (negotiation: Negotiation): boolean =>
  negotiation.status === 'OFFER_SENT' || negotiation.status === 'COUNTER_SENT';

/** What happens next on an open negotiation, and whether it is waiting on this person. */
export function nextStep(
  negotiation: Negotiation,
  perspective: Perspective,
): { text: string; needsYou: boolean } {
  const counter = formatMoney(negotiation.counterAmount, negotiation.currency);
  const offer = formatMoney(negotiation.offeredAmount, negotiation.currency);

  if (perspective === 'tourist') {
    return negotiation.status === 'COUNTER_SENT'
      ? {
          text: `${negotiation.partnerName ?? 'The partner'} countered with ${counter}. Accept or decline.`,
          needsYou: true,
        }
      : {
          text: `Waiting for ${negotiation.partnerName ?? 'the partner'} to answer your ${offer} offer.`,
          needsYou: false,
        };
  }

  return negotiation.status === 'OFFER_SENT'
    ? { text: `Offer of ${offer}. Accept, decline or counter.`, needsYou: true }
    : { text: `You countered with ${counter}. Waiting for the traveller.`, needsYou: false };
}

/** Open ones first, and among them the ones waiting on this person, then newest first. */
export function sortForAttention(
  negotiations: Negotiation[],
  perspective: Perspective,
): Negotiation[] {
  const rank = (negotiation: Negotiation) =>
    !isOpen(negotiation) ? 2 : nextStep(negotiation, perspective).needsYou ? 0 : 1;

  return [...negotiations].sort(
    (a, b) => rank(a) - rank(b) || b.createdAt.localeCompare(a.createdAt),
  );
}
