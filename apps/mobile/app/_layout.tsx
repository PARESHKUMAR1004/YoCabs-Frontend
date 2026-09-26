import { useEffect } from 'react';
import { Manrope_400Regular } from '@expo-google-fonts/manrope/400Regular';
import { Manrope_500Medium } from '@expo-google-fonts/manrope/500Medium';
import { Manrope_600SemiBold } from '@expo-google-fonts/manrope/600SemiBold';
import { Manrope_700Bold } from '@expo-google-fonts/manrope/700Bold';
import { Manrope_800ExtraBold } from '@expo-google-fonts/manrope/800ExtraBold';
import { Nunito_700Bold } from '@expo-google-fonts/nunito/700Bold';
import { Nunito_800ExtraBold } from '@expo-google-fonts/nunito/800ExtraBold';
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
import { DialogHost } from '@/shared/ui/DialogHost';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const status = useSessionStore((state) => state.status);

  // The app never waits on a font forever: if loading fails it falls back to the system font.
  const [fontsReady, fontError] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
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
        <DialogHost />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
