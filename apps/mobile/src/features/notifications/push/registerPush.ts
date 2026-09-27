import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { api } from '@/shared/api/client';
import { ensureChannels } from './channels';

/**
 * Asks permission, gets this phone's push address and gives it to the API. Returns the address, or
 * null when it cannot be had: permission refused, or the build has no Firebase set up yet. Never
 * throws for those, because the app works fine without push.
 */
export async function registerForPush(): Promise<string | null> {
  await ensureChannels();

  let permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) return null;

  const projectId = (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)
    ?.eas?.projectId;

  try {
    const token = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    await api.notifications.registerDevice(token.data, Platform.OS);
    return token.data;
  } catch (error) {
    // Most often: this build has no google-services.json, so Android cannot issue a push token.
    console.warn('Push notifications are not available on this build:', error);
    return null;
  }
}
