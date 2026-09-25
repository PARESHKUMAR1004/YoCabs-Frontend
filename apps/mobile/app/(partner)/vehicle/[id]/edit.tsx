import { router, useLocalSearchParams } from 'expo-router';
import { useVehicle } from '@/features/partner/hooks';
import { VehicleForm } from '@/features/partner/VehicleForm';
import { QueryBoundary } from '@/shared/ui';

export default function EditVehicle() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useVehicle(id);

  return (
    <QueryBoundary query={query}>
      {(vehicle) => <VehicleForm vehicle={vehicle} onSaved={() => router.back()} />}
    </QueryBoundary>
  );
}
