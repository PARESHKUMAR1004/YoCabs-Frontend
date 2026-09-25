import { useQuery } from '@tanstack/react-query';
import type { Payout } from '@yocabs/api-client';
import { useState } from 'react';
import { api } from '../api';
import { Async, Badge, DataTable, ErrorMessage, PageHeader } from '../components/ui';
import { formatDateTime, formatMoney, humanize, shortId, toneOf } from '../format';
import { useAction } from '../hooks';

const KEY = ['payouts'];

export function PayoutsPage() {
  const [status, setStatus] = useState<Payout['status']>('REQUESTED');
  const query = useQuery({
    queryKey: [...KEY, status],
    queryFn: () => api.admin.payouts.list(status),
  });
  const pay = useAction(
    ({ id, bankReference }: { id: string; bankReference: string }) =>
      api.admin.payouts.pay(id, bankReference),
    [KEY, ['dashboard']],
  );
  const reject = useAction(
    ({ id, note }: { id: string; note: string }) => api.admin.payouts.reject(id, note),
    [KEY, ['dashboard']],
  );

  const onPay = (payout: Payout) => {
    const bankReference = window.prompt(
      `Bank transfer reference for ${formatMoney(payout.amount)}?`,
    );
    if (bankReference?.trim()) pay.mutate({ id: payout.id, bankReference: bankReference.trim() });
  };
  const onReject = (payout: Payout) => {
    const note = window.prompt('Reason for rejecting this payout?');
    if (note?.trim()) reject.mutate({ id: payout.id, note: note.trim() });
  };

  return (
    <>
      <PageHeader title="Payouts">
        <select value={status} onChange={(e) => setStatus(e.target.value as Payout['status'])}>
          <option value="REQUESTED">Requested</option>
          <option value="PAID">Paid</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </PageHeader>
      {pay.isError ? <ErrorMessage error={pay.error} /> : null}
      {reject.isError ? <ErrorMessage error={reject.error} /> : null}
      <Async query={query}>
        {(payouts) => (
          <DataTable
            rows={payouts}
            rowKey={(payout) => payout.id}
            empty="No payouts with this status."
            columns={[
              { header: 'Partner', cell: (p) => shortId(p.travelPartnerId) },
              { header: 'Amount', cell: (p) => formatMoney(p.amount), align: 'right' },
              { header: 'Requested', cell: (p) => formatDateTime(p.createdAt) },
              {
                header: 'Status',
                cell: (p) => <Badge label={humanize(p.status)} tone={toneOf(p.status)} />,
              },
              { header: 'Reference', cell: (p) => p.bankReference ?? p.note ?? '-' },
              {
                header: '',
                align: 'right',
                cell: (p) =>
                  p.status === 'REQUESTED' ? (
                    <>
                      <button className="primary" onClick={() => onPay(p)}>
                        Mark paid
                      </button>
                      <button onClick={() => onReject(p)}>Reject</button>
                    </>
                  ) : null,
              },
            ]}
          />
        )}
      </Async>
    </>
  );
}
