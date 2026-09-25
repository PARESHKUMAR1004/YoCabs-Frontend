import { FlatList, StyleSheet } from 'react-native';
import { spacing } from '@/config/brand';
import { useRating, useReviews } from '@/features/partner/hooks';
import { AppText, Card, EmptyState, QueryBoundary, RatingBadge } from '@/shared/ui';
import { formatDate } from '@/shared/utils/format';

export default function Reviews() {
  const reviews = useReviews();
  const rating = useRating();

  return (
    <QueryBoundary
      query={reviews}
      isEmpty={(items) => items.length === 0}
      empty={
        <EmptyState title="No reviews yet" message="Reviews from completed trips appear here." />
      }
    >
      {(items) => (
        <FlatList
          data={items}
          keyExtractor={(review) => review.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            rating.data ? (
              <RatingBadge rating={rating.data.average} count={rating.data.reviewCount} />
            ) : null
          }
          renderItem={({ item }) => (
            <Card>
              <RatingBadge rating={item.rating} />
              {item.comment ? <AppText>{item.comment}</AppText> : null}
              <AppText variant="small" color="textMuted">
                {formatDate(item.createdAt)}
              </AppText>
            </Card>
          )}
        />
      )}
    </QueryBoundary>
  );
}

const styles = StyleSheet.create({ list: { padding: spacing.lg } });
