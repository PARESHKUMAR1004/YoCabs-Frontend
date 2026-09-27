import * as Notifications from 'expo-notifications';

/**
 * While the app is open a notification would normally stay silent. These are things that need
 * attention, so it is shown as a banner and sounds like it would with the app closed.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
