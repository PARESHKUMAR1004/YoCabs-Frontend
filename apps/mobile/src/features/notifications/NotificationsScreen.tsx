import { router } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import type { AppNotification } from '@yocabs/api-client';
import { colors, spacing } from '@/config/brand';
import { appRoleOf, useSessionStore } from '@/shared/auth/session.store';
import { AppText, Button, Card, EmptyState, QueryBoundary, Row } from '@/shared/ui';
import { formatDateTime } from '@/shared/utils/format';
import { useMarkAllRead, useMarkRead, useNotifications } from './hooks';
import { notificationRoute } from './routes';

/** One inbox for every role; only the destination of a tap differs. */
export function NotificationsScreen() {
  const query = useNotifications();
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const role = appRoleOf(useSessionStore((state) => state.user));

  function open(notification: AppNotification) {
    if (!notification.read) markRead.mutate(notification.id);
    const route = role ? notificationRoute(role, notification) : null;
    if (route) router.push(route as never);
  }

  return (
    <QueryBoundary
      query={query}
      isEmpty={(items) => items.length === 0}
      empty={
        <EmptyState
          title="No notifications"
          message="Updates about your trips and requests appear here."
        />
      }
    >
      {(items) => (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={query.isRefetching}
          onRefresh={() => void query.refetch()}
          ListHeaderComponent={
            items.some((item) => !item.read) ? (
              <Button title="Mark all as read" variant="ghost" onPress={() => markAll.mutate()} />
            ) : null
          }
          renderItem={({ item }) => (
            <Card onPress={() => open(item)} style={item.read ? undefined : styles.unread}>
              <Row>
                {!item.read ? <View style={styles.dot} /> : null}
                <AppText variant="subheading" style={styles.title}>
                  {item.title}
                </AppText>
              </Row>
              <AppText color="textMuted">{item.body}</AppText>
              <AppText variant="small" color="textMuted" style={styles.time}>
                {formatDateTime(item.createdAt)}
              </AppText>
            </Card>
          )}
        />
      )}
    </QueryBoundary>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg },
  unread: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
  },
  title: { flex: 1 },
  time: { marginTop: spacing.sm },
});
