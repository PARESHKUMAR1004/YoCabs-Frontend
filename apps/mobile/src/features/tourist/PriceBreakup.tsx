import type { PriceComponent } from '@yocabs/api-client';
import { AppText, Divider, KeyValue } from '@/shared/ui';
import { formatMoney } from '@/shared/utils/format';

/** The itemised fare exactly as the API calculated it: the app never invents price lines. */
export function PriceBreakup({
  components,
  total,
  currency,
  totalLabel = 'Total fare',
}: {
  components: PriceComponent[];
  total: number;
  currency: string;
  totalLabel?: string;
}) {
  return (
    <>
      {components.map((component) => (
        <KeyValue
          key={component.code}
          label={component.description}
          value={formatMoney(component.amount, currency)}
        />
      ))}
      <Divider />
      <KeyValue label={totalLabel} value={formatMoney(total, currency)} emphasise />
      <AppText variant="small" color="textMuted">
        All prices are inclusive of taxes shown above. No hidden charges.
      </AppText>
    </>
  );
}
