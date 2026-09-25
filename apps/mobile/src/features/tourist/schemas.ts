import { z } from 'zod';
import { positiveNumber } from '@/shared/forms/zod';
import { formatMoney } from '@/shared/utils/format';

/** An offer must be a positive amount below the listed price. */
export function offerSchema(listedAmount: number, currency = 'INR') {
  return z.object({
    amount: positiveNumber('Your offer').refine(
      (value) => value < listedAmount,
      `Your offer must be lower than the listed price of ${formatMoney(listedAmount, currency)}`,
    ),
  });
}
