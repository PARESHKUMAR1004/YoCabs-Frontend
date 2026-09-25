import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { Async, Card, PageHeader } from '../components/ui';
import { formatDateTime, formatMoney, humanize } from '../format';

function Stat({ label, value, to }: { label: string; value: string | number; to?: string }) {
  const body = (
    <>
      <span className="stat-value">{value}</span>
      <span className="muted">{label}</span>
    </>
  );
  return to ? (
    <Link to={to} className="stat">
      {body}
    </Link>
  ) : (
    <div className="stat">{body}</div>
  );
}

export function DashboardPage() {
  const query = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.admin.dashboard(),
    refetchInterval: 60_000,
  });

  return (
    <>
      <PageHeader title="Dashboard" />
      <Async query={query}>
        {(d) => (
          <>
            <div className="stats">
              <Stat label="Documents to review" value={d.pendingDocuments} to="/documents" />
              <Stat label="Payout requests" value={d.pendingPayouts} to="/payouts" />
              <Stat label="Open support tickets" value={d.openSupportTickets} to="/support" />
              <Stat
                label="Partners awaiting approval"
                value={d.partnersByStatus.PENDING_APPROVAL ?? 0}
                to="/partners"
              />
            </div>
            <div className="grid">
              <Card title="Bookings">
                <p className="big">{d.bookings.total}</p>
                <p>Gross value {formatMoney(d.bookings.grossValue)}</p>
                <p>Commission {formatMoney(d.bookings.commission)}</p>
                <ul className="plain">
                  {Object.entries(d.bookings.byStatus).map(([status, count]) => (
                    <li key={status}>
                      {humanize(status)}: {count}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card title="Marketplace">
                <ul className="plain">
                  <li>Tourists: {d.tourists}</li>
                  <li>
                    Vehicles: {d.vehicles} ({d.availableVehicles} available)
                  </li>
                  <li>Active drivers: {d.activeDrivers}</li>
                  {Object.entries(d.partnersByStatus).map(([status, count]) => (
                    <li key={status}>
                      Partners {humanize(status).toLowerCase()}: {count}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
            <p className="muted">Updated {formatDateTime(d.generatedAt)}</p>
          </>
        )}
      </Async>
    </>
  );
}
