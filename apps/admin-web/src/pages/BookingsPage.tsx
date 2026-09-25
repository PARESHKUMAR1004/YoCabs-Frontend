import { useQuery } from '@tanstack/react-query';
import type { BookingStatus } from '@yocabs/api-client';
import { useState } from 'react';
import { api } from '../api';
import { Async, Badge, DataTable, PageHeader } from '../components/ui';
import { formatDate, formatMoney, humanize, shortId, toneOf } from '../format';

const STATUSES: BookingStatus[] = [
  'PENDING_PAYMENT',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'EXPIRED',
];

export function BookingsPage() {
  const [status, setStatus] = useState<BookingStatus | undefined>();
  const query = useQuery({
    queryKey: ['bookings', status],
    queryFn: () => api.admin.bookings(status, 100),
  });

  return (
    <>
      <PageHeader title="Bookings">
        <select
          value={status ?? ''}
          onChange={(e) => setStatus((e.target.value || undefined) as BookingStatus | undefined)}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {humanize(s)}
            </option>
          ))}
        </select>
      </PageHeader>
      <Async query={query}>
        {(bookings) => (
          <DataTable
            rows={bookings}
            rowKey={(booking) => booking.id}
            columns={[
              { header: 'Booking', cell: (b) => shortId(b.id) },
              { header: 'Trip', cell: (b) => `${b.pickup} → ${b.destination}` },
              {
                header: 'Dates',
                cell: (b) => `${formatDate(b.startDate)} – ${formatDate(b.endDate)}`,
              },
              { header: 'Traveller', cell: (b) => b.tourist?.name ?? b.tourist?.mobile ?? '-' },
              { header: 'Partner', cell: (b) => b.partnerName ?? '-' },
              { header: 'Total', cell: (b) => formatMoney(b.totalAmount), align: 'right' },
              {
                header: 'Commission',
                cell: (b) => formatMoney(b.commissionAmount),
                align: 'right',
              },
              {
                header: 'Status',
                cell: (b) => <Badge label={humanize(b.status)} tone={toneOf(b.status)} />,
              },
            ]}
          />
        )}
      </Async>
    </>
  );
}
