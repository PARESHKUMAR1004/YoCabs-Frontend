import { router } from 'expo-router';
import { FlatList, StyleSheet } from 'react-native';
import { spacing } from '@/config/brand';
import { usePartnerNegotiations } from '@/features/partner/hooks';
import { AppText, Badge, Card, EmptyState, QueryBoundary, Row } from '@/shared/ui';
import { formatDate, formatMoney } from '@/shared/utils/format';
import { negotiationStatusLabel, negotiationStatusTone } from '@/shared/utils/labels';

export default function Negotiations() {
  const query = usePartnerNegotiations();

  return (
    <QueryBoundary
      query={query}
      isEmpty={(items) => items.length === 0}
      empty={
        <EmptyState
          title="No price offers yet"
          message="Travellers can offer a lower price on any of your vehicles."
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
          renderItem={({ item }) => (
            <Card
              onPress={() =>
                router.push({ pathname: '/(partner)/negotiation/[id]', params: { id: item.id } })
              }
            >
              <Row style={styles.row}>
                <AppText variant="subheading" style={styles.flex}>
                  {item.trip ? `${item.trip.pickup} → ${item.trip.destination}` : 'Trip'}
                </AppText>
                <Badge
                  label={negotiationStatusLabel(item.status)}
                  tone={negotiationStatusTone(item.status)}
                />
              </Row>
              <AppText color="textMuted">
                {item.trip ? formatDate(item.trip.startDate) : ''} · {item.vehicle?.make}{' '}
                {item.vehicle?.model}
              </AppText>
              <AppText>
                Offer {formatMoney(item.offeredAmount, item.currency)} on{' '}
                {formatMoney(item.listedAmount, item.currency)}
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
  row: { justifyContent: 'space-between', gap: spacing.sm },
  flex: { flex: 1 },
});
