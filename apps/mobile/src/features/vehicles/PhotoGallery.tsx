import { useState } from 'react';
import { FlatList, Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import { radius, spacing } from '@/config/brand';
import { colors } from '@/config/brand';
import { AppText } from '@/shared/ui';
import { api } from '@/shared/api/client';

/** Swipeable photos of a vehicle, full width, with a "2 / 5" counter. */
export function PhotoGallery({ paths }: { paths: string[] }) {
  const { width: screen } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  if (paths.length === 0) return null;

  // The screen has 16pt of padding each side.
  const width = screen - spacing.lg * 2;

  return (
    <View style={styles.wrapper}>
      <FlatList
        data={paths}
        keyExtractor={(path) => path}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={width}
        decelerationRate="fast"
        onMomentumScrollEnd={(event) =>
          setIndex(Math.round(event.nativeEvent.contentOffset.x / width))
        }
        renderItem={({ item }) => (
          <Image
            source={{ uri: api.assetUrl(item) }}
            style={{ width, height: 230, borderRadius: radius.lg, backgroundColor: colors.surface }}
            resizeMode="cover"
          />
        )}
      />
      {paths.length > 1 ? (
        <View style={styles.counter}>
          <AppText variant="caption" color="textOnPrimary">
            {index + 1} / {paths.length}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.lg },
  counter: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(11,18,32,0.7)',
  },
});
