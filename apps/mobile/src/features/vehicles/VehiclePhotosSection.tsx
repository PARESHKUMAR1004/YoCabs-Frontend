import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/config/brand';
import {
  useAddVehiclePhotos,
  useRemoveVehiclePhoto,
  useVehicleProfile,
} from '@/features/partner/hooks';
import { AppText, LoadingView } from '@/shared/ui';
import { confirmAction, showError, showInfo } from '@/shared/utils/feedback';
import { vehiclePhotoUrl } from './photoUrl';

const SIZE = 116;

/**
 * The photos travellers see when they compare cabs. Photos go live as soon as they are added;
 * YoCabs may take one down, in which case it shows here as removed.
 */
export function VehiclePhotosSection({ vehicleId }: { vehicleId: string }) {
  const profile = useVehicleProfile(vehicleId);
  const add = useAddVehiclePhotos(vehicleId);
  const remove = useRemoveVehiclePhoto(vehicleId);

  if (profile.isPending) return <LoadingView />;

  const photos = profile.data?.photos ?? [];

  const onAdd = () =>
    add.mutate(undefined, {
      onSuccess: (count) => {
        if (count > 0) showInfo('Photos added', 'Travellers can see them now.');
      },
      onError: (error) => showError(error, 'Could not add the photos'),
    });

  const onRemove = async (documentId: string) => {
    const sure = await confirmAction(
      'Remove this photo?',
      'Travellers will no longer see it.',
      'Remove',
      true,
    );
    if (sure)
      remove.mutate(documentId, { onError: (error) => showError(error, 'Could not remove it') });
  };

  return (
    <View>
      <AppText color="textMuted" style={styles.hint}>
        Clear photos of the outside and inside win bookings. Add as many as you like.
      </AppText>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add photos"
          onPress={onAdd}
          disabled={add.isPending}
          style={[styles.tile, styles.add]}
        >
          <Ionicons
            name={add.isPending ? 'cloud-upload' : 'add'}
            size={28}
            color={colors.primaryDark}
          />
          <AppText variant="caption" color="primaryDark">
            {add.isPending ? 'Uploading…' : 'Add photos'}
          </AppText>
        </Pressable>

        {photos.map((photo) => (
          <View key={photo.documentId} style={styles.tile}>
            {photo.status === 'APPROVED' ? (
              <Image
                source={{ uri: vehiclePhotoUrl(vehicleId, photo.documentId) }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.image, styles.taken]}>
                <Ionicons name="eye-off-outline" size={22} color={colors.textMuted} />
                <AppText variant="small" color="textMuted" align="center">
                  {photo.rejectionReason ?? 'Not shown to travellers'}
                </AppText>
              </View>
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Remove photo"
              hitSlop={6}
              onPress={() => void onRemove(photo.documentId)}
              style={styles.remove}
            >
              <Ionicons name="close" size={16} color={colors.textOnPrimary} />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hint: { marginBottom: spacing.md },
  row: { gap: spacing.md, paddingVertical: spacing.xs },
  tile: { width: SIZE, height: SIZE, borderRadius: radius.md },
  add: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  image: { width: SIZE, height: SIZE, borderRadius: radius.md, backgroundColor: colors.surface },
  taken: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  remove: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(11,18,32,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
