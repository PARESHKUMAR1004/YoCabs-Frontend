import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { colors } from '@/config/brand';
import { CHANNELS } from './channelMap';

/**
 * Creates the Android notification channels, each with its own sound. A channel's sound cannot be
 * changed once it exists, so a different sound means a new channel id, not an edit here.
 */
export async function ensureChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Promise.all(
    CHANNELS.map((channel) =>
      Notifications.setNotificationChannelAsync(channel.id, {
        name: channel.name,
        description: channel.description,
        importance: Notifications.AndroidImportance.HIGH,
        sound: channel.sound,
        vibrationPattern: channel.vibration,
        enableVibrate: true,
        lightColor: colors.primary,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      }),
    ),
  );
}
