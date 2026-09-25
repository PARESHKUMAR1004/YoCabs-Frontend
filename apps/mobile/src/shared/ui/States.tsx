import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import type { UseQueryResult } from '@tanstack/react-query';
import { userMessage } from '@yocabs/api-client';
import { colors, spacing } from '@/config/brand';
import { Button } from './Button';
import { AppText } from './Text';

export function LoadingView({ label }: { label?: string }) {
  return (
    <View style={styles.center} accessibilityLabel={label ?? 'Loading'}>
      <ActivityIndicator size="large" color={colors.primary} />
      {label ? (
        <AppText color="textMuted" style={styles.gap}>
          {label}
        </AppText>
      ) : null}
    </View>
  );
}

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.center}>
      <AppText variant="heading" align="center">
        {title}
      </AppText>
      {message ? (
        <AppText color="textMuted" align="center" style={styles.gap}>
          {message}
        </AppText>
      ) : null}
      {action ? <View style={styles.gap}>{action}</View> : null}
    </View>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <AppText variant="heading" align="center">
        We couldn&apos;t load this
      </AppText>
      <AppText color="textMuted" align="center" style={styles.gap}>
        {userMessage(error)}
      </AppText>
      {onRetry ? (
        <View style={styles.gap}>
          <Button title="Try again" variant="secondary" onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}

interface BoundaryProps<T> {
  query: UseQueryResult<T>;
  children: (data: T) => ReactNode;
  /** Treat this data as empty (e.g. an empty list) and show `empty` instead. */
  isEmpty?: (data: T) => boolean;
  empty?: ReactNode;
}

/** Loading / error / empty / content: every network-backed screen uses this. */
export function QueryBoundary<T>({ query, children, isEmpty, empty }: BoundaryProps<T>) {
  if (query.isPending) return <LoadingView />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  if (isEmpty?.(query.data)) return <>{empty ?? <EmptyState title="Nothing here yet" />}</>;
  return <>{children(query.data)}</>;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  gap: { marginTop: spacing.md },
});
