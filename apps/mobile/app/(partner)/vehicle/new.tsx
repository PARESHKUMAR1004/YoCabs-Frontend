import { router } from 'expo-router';
import { VehicleForm } from '@/features/partner/VehicleForm';

export default function NewVehicle() {
  return (
    <VehicleForm
      onSaved={(vehicle) =>
        router.replace({ pathname: '/(partner)/vehicle/[id]', params: { id: vehicle.id } })
      }
    />
  );
}
