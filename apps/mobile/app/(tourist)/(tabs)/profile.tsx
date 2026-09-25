import { ProfileScreen } from '@/features/profile/ProfileScreen';

export default function TouristProfile() {
  return <ProfileScreen editRoute="/(tourist)/profile-edit" supportRoute="/(tourist)/support" />;
}
