import { AppText, KeyValue } from '@/shared/ui';
import { formatMoney } from '@/shared/utils/format';

/** What the tourist pays for the trip: one all-inclusive figure, never the parts it is made of. */
export function FareTotal({
  total,
  currency,
  label = 'Total fare',
}: {
  total: number;
  currency: string;
  label?: string;
}) {
  return (
    <>
      <KeyValue label={label} value={formatMoney(total, currency)} emphasise />
      <AppText variant="small" color="textMuted">
        All-inclusive. No hidden charges.
      </AppText>
    </>
  );
}
