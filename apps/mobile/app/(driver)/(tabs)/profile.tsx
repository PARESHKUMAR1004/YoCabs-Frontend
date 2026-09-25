import { router } from 'expo-router';
import { ProfileScreen } from '@/features/profile/ProfileScreen';
import { Button } from '@/shared/ui';

export default function DriverProfile() {
  return (
    <ProfileScreen
      editRoute="/(driver)/profile-edit"
      supportRoute="/(driver)/support"
      extra={
        <Button
          title="Report a safety issue"
          variant="danger"
          onPress={() =>
            router.push({ pathname: '/(driver)/support/new', params: { category: 'SAFETY' } })
          }
        />
      }
    />
  );
}
