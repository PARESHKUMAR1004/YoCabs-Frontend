import { FlatList, StyleSheet } from 'react-native';
import { spacing } from '@/config/brand';
import { AppText, Badge, Button, Card, EmptyState, QueryBoundary, Row } from '@/shared/ui';
import { formatDateTime } from '@/shared/utils/format';
import { useMyTickets } from './hooks';
import { ticketStatusLabel, ticketStatusTone } from './labels';

interface Props {
  onOpen: (ticketId: string) => void;
  onNew: () => void;
}

export function TicketListScreen({ onOpen, onNew }: Props) {
  const query = useMyTickets();

  return (
    <QueryBoundary
      query={query}
      isEmpty={(tickets) => tickets.length === 0}
      empty={
        <EmptyState
          title="No support requests"
          message="If something goes wrong with a trip or a payment, tell us and we will help."
          action={<Button title="Contact support" onPress={onNew} />}
        />
      }
    >
      {(tickets) => (
        <FlatList
          data={tickets}
          keyExtractor={(ticket) => ticket.id}
          contentContainerStyle={styles.list}
          refreshing={query.isRefetching}
          onRefresh={() => void query.refetch()}
          ListHeaderComponent={
            <Button title="New request" variant="secondary" onPress={onNew} style={styles.header} />
          }
          renderItem={({ item }) => (
            <Card onPress={() => onOpen(item.id)}>
              <Row style={styles.row}>
                <AppText variant="subheading" style={styles.subject}>
                  {item.subject}
                </AppText>
                <Badge
                  label={ticketStatusLabel(item.status)}
                  tone={ticketStatusTone(item.status)}
                />
              </Row>
              <AppText variant="small" color="textMuted">
                Updated {formatDateTime(item.updatedAt)}
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
  header: { marginBottom: spacing.md },
  row: { justifyContent: 'space-between', gap: spacing.sm },
  subject: { flex: 1 },
});
