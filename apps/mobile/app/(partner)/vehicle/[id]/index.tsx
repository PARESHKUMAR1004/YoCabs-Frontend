import { router, useLocalSearchParams } from 'expo-router';
import { DocumentsSection } from '@/features/documents/DocumentsSection';
import { useChangeVehicleStatus, useVehicle } from '@/features/partner/hooks';
import {
  AppText,
  Badge,
  Button,
  Card,
  KeyValue,
  QueryBoundary,
  Screen,
  SectionHeader,
  Spacer,
} from '@/shared/ui';
import { confirmAction, showError } from '@/shared/utils/feedback';
import { humanize } from '@/shared/utils/format';
import { categoryLabel, vehicleStatusTone } from '@/shared/utils/labels';

export default function VehicleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useVehicle(id);
  const change = useChangeVehicleStatus(id);

  const run = (action: 'make-available' | 'make-unavailable' | 'maintenance' | 'deactivate') =>
    change.mutate(action, { onError: (error) => showError(error, 'Could not change the status') });

  const deactivate = async () => {
    if (
      await confirmAction(
        'Deactivate this vehicle?',
        'It will stop appearing in searches.',
        'Deactivate',
        true,
      )
    ) {
      run('deactivate');
    }
  };

  return (
    <QueryBoundary query={query}>
      {(vehicle) => (
        <Screen refreshing={query.isRefetching} onRefresh={() => void query.refetch()}>
          <AppText variant="title">
            {vehicle.make} {vehicle.model}
          </AppText>
          <Spacer size="sm" />
          <Badge label={humanize(vehicle.status)} tone={vehicleStatusTone(vehicle.status)} />
          <Spacer />
          <Card>
            <KeyValue label="Registration" value={vehicle.registrationNumber} />
            <KeyValue label="Category" value={categoryLabel(vehicle.category)} />
            <KeyValue label="Seats" value={`${vehicle.passengerCapacity}`} />
          </Card>

          <Button
            title="Set prices"
            onPress={() =>
              router.push({ pathname: '/(partner)/vehicle/[id]/pricing', params: { id } })
            }
          />
          <Spacer size="sm" />
          <Button
            title="Where this vehicle works"
            variant="secondary"
            onPress={() =>
              router.push({ pathname: '/(partner)/vehicle/[id]/service-areas', params: { id } })
            }
          />
          <Spacer size="sm" />
          <Button
            title="Features & facilities"
            variant="secondary"
            onPress={() =>
              router.push({ pathname: '/(partner)/vehicle/[id]/details', params: { id } })
            }
          />
          <Spacer size="sm" />
          <Button
            title="Edit vehicle"
            variant="secondary"
            onPress={() =>
              router.push({ pathname: '/(partner)/vehicle/[id]/edit', params: { id } })
            }
          />

          <SectionHeader title="Availability" />
          {vehicle.status === 'AVAILABLE' ? (
            <>
              <Button
                title="Mark unavailable"
                variant="secondary"
                loading={change.isPending}
                onPress={() => run('make-unavailable')}
              />
              <Spacer size="sm" />
              <Button
                title="Send for maintenance"
                variant="secondary"
                onPress={() => run('maintenance')}
              />
            </>
          ) : vehicle.status !== 'INACTIVE' ? (
            <Button
              title="Make available"
              loading={change.isPending}
              onPress={() => run('make-available')}
            />
          ) : null}
          {vehicle.status !== 'INACTIVE' ? (
            <>
              <Spacer size="sm" />
              <Button title="Deactivate" variant="danger" onPress={() => void deactivate()} />
            </>
          ) : null}

          <SectionHeader title="Documents" />
          <DocumentsSection
            ownerType="VEHICLE"
            ownerId={vehicle.id}
            requiredTypes={['RC_BOOK', 'INSURANCE', 'PUC', 'FITNESS', 'PERMIT']}
          />
        </Screen>
      )}
    </QueryBoundary>
  );
}
