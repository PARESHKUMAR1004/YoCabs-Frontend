import { router, type Href } from 'expo-router';
import { ProfileScreen } from '@/features/profile/ProfileScreen';
import { Button, Spacer } from '@/shared/ui';

const LINKS: { title: string; href: Href }[] = [
  { title: 'Price offers', href: '/(partner)/negotiations' },
  { title: 'Drivers', href: '/(partner)/drivers' },
  { title: 'Fleet map', href: '/(partner)/fleet-map' },
  { title: 'Wallet & payouts', href: '/(partner)/wallet' },
  { title: 'Reports', href: '/(partner)/reports' },
  { title: 'Reviews', href: '/(partner)/reviews' },
  { title: 'Staff', href: '/(partner)/staff' },
  { title: 'Business documents', href: '/(partner)/documents' },
];

export default function PartnerMore() {
  return (
    <ProfileScreen
      editRoute="/(partner)/profile-edit"
      supportRoute="/(partner)/support"
      extra={
        <>
          {LINKS.map((link) => (
            <Button
              key={link.title}
              title={link.title}
              variant="secondary"
              onPress={() => router.push(link.href)}
              style={{ marginBottom: 8 }}
            />
          ))}
          <Spacer size="sm" />
        </>
      }
    />
  );
}
