import { router } from 'expo-router';
import type { OnlyChoice } from '@/features/tourist/onlyChoice';
import { useSearchStore } from '@/features/tourist/searchStore';

/**
 * Starts a booking from something picked in Explore. With a destination already chosen it goes
 * straight to the prices; otherwise it goes to the front page to ask where the tourist is going.
 */
export function useBookFromExplore() {
  const destination = useSearchStore((state) => state.destination);
  const setOnly = useSearchStore((state) => state.setOnly);

  return (choice: OnlyChoice) => {
    setOnly(choice);
    if (destination) router.push('/(tourist)/results');
    else router.navigate('/(tourist)/(tabs)');
  };
}
