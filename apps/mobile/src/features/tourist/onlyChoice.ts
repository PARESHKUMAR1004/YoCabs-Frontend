import type { SearchOption } from '@yocabs/api-client';
import { modelKey } from './carModel';

/**
 * What the tourist chose to book from Explore: every cab of one partner, one particular cab, or a
 * model such as a Dzire from whichever partners run it. Results narrow to it.
 */
export interface OnlyChoice {
  partnerId?: string;
  partnerName?: string;
  vehicleId?: string;
  vehicleLabel?: string;
  modelKey?: string;
  modelLabel?: string;
}

/** Does this result belong to what the tourist chose? The most specific choice wins. */
export function matchesOnly(option: SearchOption, only: OnlyChoice): boolean {
  if (only.vehicleId) return option.vehicleId === only.vehicleId;
  if (only.modelKey) return modelKey(option.model) === only.modelKey;
  if (only.partnerId) return option.travelPartnerId === only.partnerId;
  return true;
}

/** How to say it: "Toyota Innova · Mahadev Travels", "Dzire" or "Mahadev Travels". */
export function onlyHeadline(only: OnlyChoice): string {
  if (only.vehicleLabel) {
    return only.partnerName ? `${only.vehicleLabel} · ${only.partnerName}` : only.vehicleLabel;
  }
  return only.modelLabel ?? only.partnerName ?? 'your choice';
}
