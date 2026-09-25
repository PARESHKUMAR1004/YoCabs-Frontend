import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { useUnreadCount } from '@/features/notifications/hooks';
import { tabScreenOptions } from '@/shared/ui/navigation';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const icon =
  (name: IconName) =>
  ({ color, size }: { color: ColorValue; size: number }) => (
    <Ionicons name={name} color={color} size={size} />
  );

export default function PartnerTabs() {
  const unread = useUnreadCount();

  return (
    <Tabs screenOptions={tabScreenOptions}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Dashboard', tabBarIcon: icon('speedometer-outline') }}
      />
      <Tabs.Screen
        name="bookings"
        options={{ title: 'Bookings', tabBarIcon: icon('receipt-outline') }}
      />
      <Tabs.Screen name="fleet" options={{ title: 'Fleet', tabBarIcon: icon('car-outline') }} />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarBadge: unread.data && unread.data > 0 ? unread.data : undefined,
          tabBarIcon: icon('notifications-outline'),
        }}
      />
      <Tabs.Screen name="more" options={{ title: 'More', tabBarIcon: icon('menu-outline') }} />
    </Tabs>
  );
}
