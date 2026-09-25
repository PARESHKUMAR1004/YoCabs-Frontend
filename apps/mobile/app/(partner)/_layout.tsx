import { Stack } from 'expo-router';
import { RoleGuard } from '@/shared/auth/RoleGuard';
import { stackScreenOptions } from '@/shared/ui/navigation';

export default function PartnerLayout() {
  return (
    <RoleGuard role="partner">
      <Stack screenOptions={stackScreenOptions}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="booking/[id]" options={{ title: 'Booking' }} />
        <Stack.Screen name="negotiations" options={{ title: 'Price offers' }} />
        <Stack.Screen name="negotiation/[id]" options={{ title: 'Price offer' }} />
        <Stack.Screen name="vehicle/new" options={{ title: 'Add vehicle' }} />
        <Stack.Screen name="vehicle/[id]/index" options={{ title: 'Vehicle' }} />
        <Stack.Screen name="vehicle/[id]/edit" options={{ title: 'Edit vehicle' }} />
        <Stack.Screen name="vehicle/[id]/details" options={{ title: 'Features & facilities' }} />
        <Stack.Screen name="vehicle/[id]/pricing" options={{ title: 'Pricing' }} />
        <Stack.Screen
          name="vehicle/[id]/service-areas"
          options={{ title: 'Where this vehicle works' }}
        />
        <Stack.Screen name="drivers" options={{ title: 'Drivers' }} />
        <Stack.Screen name="fleet-map" options={{ title: 'Fleet map' }} />
        <Stack.Screen name="staff" options={{ title: 'Staff' }} />
        <Stack.Screen name="wallet" options={{ title: 'Wallet & payouts' }} />
        <Stack.Screen name="reports" options={{ title: 'Reports' }} />
        <Stack.Screen name="reviews" options={{ title: 'Reviews' }} />
        <Stack.Screen name="documents" options={{ title: 'Documents' }} />
        <Stack.Screen name="profile-edit" options={{ title: 'Edit profile' }} />
        <Stack.Screen name="support/index" options={{ title: 'Help & support' }} />
        <Stack.Screen name="support/new" options={{ title: 'New request' }} />
        <Stack.Screen name="support/[id]" options={{ title: 'Support request' }} />
      </Stack>
    </RoleGuard>
  );
}
