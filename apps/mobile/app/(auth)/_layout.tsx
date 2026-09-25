import { Stack } from 'expo-router';
import { stackScreenOptions } from '@/shared/ui/navigation';

export default function AuthLayout() {
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: 'Sign in' }} />
      <Stack.Screen name="verify" options={{ title: 'Verify your number' }} />
      <Stack.Screen name="register-partner" options={{ title: 'Register your business' }} />
    </Stack>
  );
}
