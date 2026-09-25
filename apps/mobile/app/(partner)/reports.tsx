import { useState } from 'react';
import { useReport, type ReportName } from '@/features/partner/hooks';
import { AppText, Card, ChoiceChips, KeyValue, QueryBoundary, Screen, Spacer } from '@/shared/ui';
import { formatDate, formatMoney, humanize } from '@/shared/utils/format';

const REPORTS: { value: ReportName; label: string }[] = [
  { value: 'earnings', label: 'Earnings' },
  { value: 'trips', label: 'Trips' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'drivers', label: 'Drivers' },
  { value: 'cancellations', label: 'Cancellations' },
];

function Earnings() {
  const query = useReport('earnings');
  return (
    <QueryBoundary query={query}>
      {(report) => (
        <>
          <AppText color="textMuted">
            {formatDate(report.range.from)} – {formatDate(report.range.to)}
          </AppText>
          <Card>
            <KeyValue label="Completed trips" value={`${report.completedTrips}`} />
            <KeyValue label="Gross fare" value={formatMoney(report.grossFare)} />
            <KeyValue label="Commission" value={formatMoney(report.commission)} />
            <KeyValue label="Your earnings" value={formatMoney(report.partnerEarnings)} emphasise />
            <KeyValue
              label="Tokens collected by YoCabs"
              value={formatMoney(report.tokenCollectedByYoCabs)}
            />
          </Card>
          {report.months.map((month) => (
            <Card key={month.month}>
              <AppText variant="subheading">{month.month}</AppText>
              <KeyValue
                label={`${month.completedTrips} trips`}
                value={formatMoney(month.grossFare - month.commission)}
              />
            </Card>
          ))}
        </>
      )}
    </QueryBoundary>
  );
}

function Trips() {
  const query = useReport('trips');
  return (
    <QueryBoundary query={query}>
      {(report) => (
        <>
          <Card>
            {Object.entries(report.countsByStatus).map(([status, count]) => (
              <KeyValue key={status} label={humanize(status)} value={`${count}`} />
            ))}
          </Card>
          {report.trips.map((trip) => (
            <Card key={trip.bookingId}>
              <AppText variant="subheading">
                {trip.pickup} → {trip.destination}
              </AppText>
              <AppText color="textMuted">
                {formatDate(trip.startDate)} · {trip.vehicle} · {humanize(trip.status)}
              </AppText>
              <AppText>{formatMoney(trip.totalAmount)}</AppText>
            </Card>
          ))}
        </>
      )}
    </QueryBoundary>
  );
}

function Vehicles() {
  const query = useReport('vehicles');
  return (
    <QueryBoundary query={query}>
      {(rows) => (
        <>
          {rows.map((row) => (
            <Card key={row.vehicleId}>
              <AppText variant="subheading">
                {row.makeModel} · {row.registrationNumber}
              </AppText>
              <KeyValue
                label="Completed / cancelled"
                value={`${row.completedTrips} / ${row.cancelledTrips}`}
              />
              <KeyValue label="Revenue" value={formatMoney(row.revenue)} />
              <KeyValue label="Days on road" value={`${row.daysOnRoad}`} />
            </Card>
          ))}
        </>
      )}
    </QueryBoundary>
  );
}

function Drivers() {
  const query = useReport('drivers');
  return (
    <QueryBoundary query={query}>
      {(rows) => (
        <>
          {rows.map((row) => (
            <Card key={row.driverId}>
              <AppText variant="subheading">{row.name}</AppText>
              <KeyValue label="Completed trips" value={`${row.completedTrips}`} />
              <KeyValue
                label="Rating"
                value={
                  row.reviewCount
                    ? `${row.averageRating.toFixed(1)} (${row.reviewCount})`
                    : 'No reviews'
                }
              />
            </Card>
          ))}
        </>
      )}
    </QueryBoundary>
  );
}

function Cancellations() {
  const query = useReport('cancellations');
  return (
    <QueryBoundary query={query}>
      {(report) => (
        <>
          <Card>
            <KeyValue label="Total refunded" value={formatMoney(report.totalRefunded)} emphasise />
            {Object.entries(report.countsByCancelledBy).map(([who, count]) => (
              <KeyValue
                key={who}
                label={`Cancelled by ${humanize(who).toLowerCase()}`}
                value={`${count}`}
              />
            ))}
          </Card>
          {report.cancellations.map((row) => (
            <Card key={row.bookingId}>
              <AppText variant="subheading">
                {row.pickup} → {row.destination}
              </AppText>
              <AppText color="textMuted">
                {formatDate(row.startDate)} · {row.reason ?? 'No reason given'}
              </AppText>
            </Card>
          ))}
        </>
      )}
    </QueryBoundary>
  );
}

const VIEWS: Record<ReportName, () => React.JSX.Element> = {
  earnings: Earnings,
  trips: Trips,
  vehicles: Vehicles,
  drivers: Drivers,
  cancellations: Cancellations,
};

export default function Reports() {
  const [name, setName] = useState<ReportName>('earnings');
  const View = VIEWS[name];

  return (
    <Screen>
      <ChoiceChips options={REPORTS} value={name} onChange={(value) => value && setName(value)} />
      <Spacer />
      <View />
    </Screen>
  );
}
