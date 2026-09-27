import { useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import type { AppNotification } from '@yocabs/api-client';
import { api } from '@/shared/api/client';
import { onBeforeSignOut } from '@/shared/auth/session';
import { appRoleOf, useSessionStore } from '@/shared/auth/session.store';
import { keys } from '@/shared/query/keys';
import { notificationRoute } from '../routes';
import { channelForType } from './channelMap';
import { registerForPush } from './registerPush';

const CHECK_EVERY_MS = 15_000;

/** What a notification carries so the app knows where a tap should go. */
interface Payload {
  type?: string;
  referenceType?: string | null;
  referenceId?: string | null;
}

/**
 * Keeps the person's phone informed: registers it for push, refreshes the app when something
 * arrives, opens the right screen when one is tapped, and, until push is available on this build,
 * rings the same alerts itself while the app is open.
 */
export function usePushNotifications(): void {
  const user = useSessionStore((state) => state.user);
  const role = appRoleOf(user);
  const userId = user?.userId ?? null;
  const queryClient = useQueryClient();

  const [pushWorks, setPushWorks] = useState(false);
  const token = useRef<string | null>(null);

  // -- register this phone once per signed-in user, and forget it on sign-out
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    registerForPush()
      .then((registered) => {
        token.current = registered;
        if (!cancelled) setPushWorks(registered !== null);
      })
      .catch(() => {
        if (!cancelled) setPushWorks(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(
    () =>
      onBeforeSignOut(async () => {
        if (token.current) await api.notifications.unregisterDevice(token.current);
        token.current = null;
      }),
    [],
  );

  // -- something arrived while the app is open: refresh what it may have changed
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(() => {
      void queryClient.invalidateQueries({ queryKey: keys.notifications.all });
      void queryClient.invalidateQueries({ queryKey: ['tourist'] });
      void queryClient.invalidateQueries({ queryKey: ['partner'] });
      void queryClient.invalidateQueries({ queryKey: ['driver'] });
    });
    return () => subscription.remove();
  }, [queryClient]);

  // -- a notification was tapped, with the app open, in the background, or closed
  const tapped = Notifications.useLastNotificationResponse();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!tapped || !role) return;

    const id = `${tapped.notification.request.identifier}:${tapped.actionIdentifier}`;
    if (handled.current === id) return;
    handled.current = id;

    const data = tapped.notification.request.content.data as Payload;
    const target = notificationRoute(role, {
      referenceType: data.referenceType ?? null,
      referenceId: data.referenceId ?? null,
    } as AppNotification);

    if (target) router.push(target as never);
  }, [tapped, role]);

  // -- no push on this build: ring the alerts ourselves while the app is open
  useEffect(() => {
    if (!userId || pushWorks) return;

    let seen: Set<string> | null = null;
    let checking = false;

    const check = async () => {
      if (checking || AppState.currentState !== 'active') return;
      checking = true;

      try {
        const unread = await api.notifications.list({ unreadOnly: true, limit: 20 });

        // The first look only learns what is already there: old news must not ring at start-up.
        if (seen === null) {
          seen = new Set(unread.map((item) => item.id));
          return;
        }

        const fresh = unread.filter((item) => !seen?.has(item.id)).reverse();

        for (const item of fresh) {
          seen.add(item.id);
          await Notifications.scheduleNotificationAsync({
            content: {
              title: item.title,
              body: item.body,
              data: {
                type: item.type,
                referenceType: item.referenceType,
                referenceId: item.referenceId,
              } satisfies Payload,
            },
            trigger: { channelId: channelForType(item.type) },
          });
        }

        if (fresh.length > 0) {
          void queryClient.invalidateQueries({ queryKey: keys.notifications.all });
        }
      } catch {
        // Offline or signed out mid-check: try again on the next round.
      } finally {
        checking = false;
      }
    };

    void check();
    const timer = setInterval(() => void check(), CHECK_EVERY_MS);
    return () => clearInterval(timer);
  }, [userId, pushWorks, queryClient]);
}
