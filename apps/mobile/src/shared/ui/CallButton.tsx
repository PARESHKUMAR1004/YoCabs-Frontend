import { Linking } from 'react-native';
import { showInfo } from '@/shared/utils/feedback';
import { Button } from './Button';

/** Opens the phone dialler. Trips are coordinated by phone, so this appears on most detail screens. */
export function CallButton({
  title,
  mobile,
}: {
  title: string;
  mobile: string | null | undefined;
}) {
  if (!mobile) return null;

  return (
    <Button
      title={title}
      variant="secondary"
      onPress={() =>
        Linking.openURL(`tel:${mobile}`).catch(() =>
          showInfo('Cannot place the call', `Please dial ${mobile}.`),
        )
      }
    />
  );
}
