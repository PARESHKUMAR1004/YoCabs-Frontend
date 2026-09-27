import { usePushNotifications } from './usePushNotifications';
import './handler';

/** Mounted once at the root: it has no screen, it just keeps notifications working. */
export function PushBridge() {
  usePushNotifications();
  return null;
}
