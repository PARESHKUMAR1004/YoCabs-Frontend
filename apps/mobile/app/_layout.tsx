import { useEffect } from 'react';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { PlayfairDisplay_600SemiBold } from '@expo-google-fonts/playfair-display/600SemiBold';
import { PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display/700Bold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { bootstrapSession } from '@/shared/auth/session';
import { useSessionStore } from '@/shared/auth/session.store';
import { queryClient } from '@/shared/query/queryClient';
import { useAppUpdates } from '@/shared/updates/useAppUpdates';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const status = useSessionStore((state) => state.status);

  // The app never waits on a font forever: if loading fails it falls back to the system font.
  const [fontsReady, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
  });
  const typographyReady = fontsReady || fontError !== null;

  useAppUpdates();

  useEffect(() => {
    void bootstrapSession();
  }, []);

  useEffect(() => {
    if (status !== 'loading' && typographyReady) void SplashScreen.hideAsync();
  }, [status, typographyReady]);

  if (!typographyReady) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
