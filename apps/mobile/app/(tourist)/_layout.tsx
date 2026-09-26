import { Stack } from 'expo-router';
import { ActiveTripPrompt } from '@/features/tourist/ActiveTripPrompt';
import { RoleGuard } from '@/shared/auth/RoleGuard';
import { stackScreenOptions } from '@/shared/ui/navigation';

export default function TouristLayout() {
  return (
    <RoleGuard role="tourist">
      <Stack screenOptions={stackScreenOptions}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="location-picker"
          options={{ title: 'Choose a place', presentation: 'modal' }}
        />
        <Stack.Screen name="partner/[id]" options={{ title: 'Travel partner' }} />
        <Stack.Screen name="results" options={{ title: 'Available cabs' }} />
        <Stack.Screen name="option" options={{ title: 'Vehicle details' }} />
        <Stack.Screen name="negotiate" options={{ title: 'Ask for a better price' }} />
        <Stack.Screen name="negotiation/[id]" options={{ title: 'Your offer' }} />
        <Stack.Screen name="checkout" options={{ title: 'Review your booking' }} />
        <Stack.Screen
          name="payment"
          options={{ title: 'Confirm with token', headerBackVisible: false }}
        />
        <Stack.Screen name="booking/[id]" options={{ title: 'Booking' }} />
        <Stack.Screen name="review/[id]" options={{ title: 'Rate your trip' }} />
        <Stack.Screen name="profile-edit" options={{ title: 'Edit profile' }} />
        <Stack.Screen name="support/index" options={{ title: 'Help & support' }} />
        <Stack.Screen name="support/new" options={{ title: 'New request' }} />
        <Stack.Screen name="support/[id]" options={{ title: 'Support request' }} />
      </Stack>
      <ActiveTripPrompt />
    </RoleGuard>
  );
}
