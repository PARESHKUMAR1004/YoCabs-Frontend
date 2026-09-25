import { Stack } from 'expo-router';
import { RoleGuard } from '@/shared/auth/RoleGuard';
import { stackScreenOptions } from '@/shared/ui/navigation';

export default function DriverLayout() {
  return (
    <RoleGuard role="driver">
      <Stack screenOptions={stackScreenOptions}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="trip/[id]" options={{ title: 'Trip' }} />
        <Stack.Screen name="profile-edit" options={{ title: 'Edit profile' }} />
        <Stack.Screen name="support/index" options={{ title: 'Help & support' }} />
        <Stack.Screen name="support/new" options={{ title: 'New request' }} />
        <Stack.Screen name="support/[id]" options={{ title: 'Support request' }} />
      </Stack>
    </RoleGuard>
  );
}
