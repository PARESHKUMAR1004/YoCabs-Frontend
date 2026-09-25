import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../api';
import { Async, Badge, Card, DataTable, PageHeader } from '../components/ui';
import { formatDateTime, formatMoney, humanize, shortId, toneOf } from '../format';

type View = 'payments' | 'refunds' | 'cancellations';

function Payments() {
  const query = useQuery({
    queryKey: ['finance', 'payments'],
    queryFn: () => api.admin.finance.payments(),
  });
  return (
    <Async query={query}>
      {(view) => (
        <>
          <div className="stats">
            <div className="stat">
              <span className="stat-value">{formatMoney(view.summary.collected)}</span>
              <span className="muted">Collected ({view.summary.paidPayments} payments)</span>
            </div>
            <div className="stat">
              <span className="stat-value">{formatMoney(view.summary.refunded)}</span>
              <span className="muted">Refunded</span>
            </div>
            <div className="stat">
              <span className="stat-value">{formatMoney(view.summary.netCollected)}</span>
              <span className="muted">Net</span>
            </div>
          </div>
          <DataTable
            rows={view.payments}
            rowKey={(payment) => payment.paymentId}
            columns={[
              { header: 'Payment', cell: (p) => shortId(p.paymentId) },
              { header: 'Booking', cell: (p) => shortId(p.bookingId) },
              { header: 'Amount', cell: (p) => formatMoney(p.amount), align: 'right' },
              { header: 'Refunded', cell: (p) => formatMoney(p.refundedAmount), align: 'right' },
              { header: 'Gateway', cell: (p) => p.gateway },
              {
                header: 'Status',
                cell: (p) => <Badge label={humanize(p.status)} tone={toneOf(p.status)} />,
              },
              { header: 'Date', cell: (p) => formatDateTime(p.createdAt) },
            ]}
          />
        </>
      )}
    </Async>
  );
}

function Refunds() {
  const query = useQuery({
    queryKey: ['finance', 'refunds'],
    queryFn: () => api.admin.finance.refunds(),
  });
  return (
    <Async query={query}>
      {(view) => (
        <>
          <Card>Total refunded: {formatMoney(view.totalRefunded)}</Card>
          <DataTable
            rows={view.refunds}
            rowKey={(refund) => refund.transactionId}
            columns={[
              { header: 'Booking', cell: (r) => shortId(r.bookingId) },
              { header: 'Amount', cell: (r) => formatMoney(r.amount), align: 'right' },
              {
                header: 'Cancelled by',
                cell: (r) => (r.cancelledBy ? humanize(r.cancelledBy) : '-'),
              },
              { header: 'Reason', cell: (r) => r.cancellationReason ?? '-' },
              { header: 'Refunded at', cell: (r) => formatDateTime(r.refundedAt) },
            ]}
          />
        </>
      )}
    </Async>
  );
}

function Cancellations() {
  const query = useQuery({
    queryKey: ['finance', 'cancellations'],
    queryFn: () => api.admin.finance.cancellations(),
  });
  return (
    <Async query={query}>
      {(view) => (
        <>
          <Card>
            Total refunded: {formatMoney(view.totalRefunded)} ·{' '}
            {Object.entries(view.countsByCancelledBy)
              .map(([who, count]) => `${humanize(who)}: ${count}`)
              .join(' · ')}
          </Card>
          <DataTable
            rows={view.cancellations}
            rowKey={(row) => row.bookingId}
            columns={[
              { header: 'Booking', cell: (c) => shortId(c.bookingId) },
              { header: 'Total', cell: (c) => formatMoney(c.totalAmount), align: 'right' },
              { header: 'Token', cell: (c) => formatMoney(c.tokenAmount), align: 'right' },
              { header: 'Refunded', cell: (c) => formatMoney(c.refunded), align: 'right' },
              {
                header: 'Cancelled by',
                cell: (c) => (c.cancelledBy ? humanize(c.cancelledBy) : '-'),
              },
              { header: 'Reason', cell: (c) => c.reason ?? '-' },
              { header: 'When', cell: (c) => formatDateTime(c.cancelledAt) },
            ]}
          />
        </>
      )}
    </Async>
  );
}

const VIEWS: Record<View, () => React.JSX.Element> = {
  payments: Payments,
  refunds: Refunds,
  cancellations: Cancellations,
};

export function FinancePage() {
  const [view, setView] = useState<View>('payments');
  const Current = VIEWS[view];

  return (
    <>
      <PageHeader title="Payments & refunds">
        <select value={view} onChange={(e) => setView(e.target.value as View)}>
          <option value="payments">Payments</option>
          <option value="refunds">Refunds</option>
          <option value="cancellations">Cancellations</option>
        </select>
      </PageHeader>
      <Current />
    </>
  );
}
