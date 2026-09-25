import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { Async, Card, DataTable, PageHeader } from '../components/ui';
import { formatDateTime, shortId } from '../format';

/**
 * Every trip on the road. Positions come from the driver's app and only exist while a trip runs,
 * so a trip with no position simply has a driver who has not started sharing yet.
 */
export function LiveTripsPage() {
  const query = useQuery({
    queryKey: ['live-trips'],
    queryFn: () => api.admin.liveTrips(),
    refetchInterval: 20_000,
  });

  return (
    <>
      <PageHeader title="Live trips" />
      <Async query={query}>
        {(trips) => {
          const sharing = trips.filter((trip) => trip.location !== null);

          return (
            <>
              <div className="stats">
                <div className="stat">
                  <span className="stat-value">{trips.length}</span>
                  <span className="muted">Trips in progress</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{sharing.length}</span>
                  <span className="muted">Sharing a position</span>
                </div>
              </div>

              {trips.length === 0 ? (
                <Card>No trips are running right now.</Card>
              ) : (
                <DataTable
                  rows={trips}
                  rowKey={(trip) => trip.bookingId}
                  columns={[
                    { header: 'Booking', cell: (t) => shortId(t.bookingId) },
                    { header: 'Trip', cell: (t) => `${t.pickup} → ${t.destination}` },
                    { header: 'Partner', cell: (t) => shortId(t.travelPartnerId) },
                    {
                      header: 'Position',
                      cell: (t) =>
                        t.location
                          ? `${t.location.latitude.toFixed(4)}, ${t.location.longitude.toFixed(4)}`
                          : 'Not shared',
                    },
                    {
                      header: 'Speed',
                      align: 'right',
                      cell: (t) =>
                        t.location?.speedKph === null || t.location?.speedKph === undefined
                          ? '-'
                          : `${Math.round(t.location.speedKph)} km/h`,
                    },
                    {
                      header: 'Updated',
                      cell: (t) => (t.location ? formatDateTime(t.location.recordedAt) : '-'),
                    },
                    {
                      header: '',
                      align: 'right',
                      cell: (t) =>
                        t.location ? (
                          <a
                            href={`https://www.google.com/maps?q=${t.location.latitude},${t.location.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open map
                          </a>
                        ) : null,
                    },
                  ]}
                />
              )}
            </>
          );
        }}
      </Async>
    </>
  );
}
