import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { usePricing } from '@/features/partner/hooks';
import { PricingEditor } from '@/features/partner/PricingEditor';
import { AppText, ChoiceChips, QueryBoundary, Screen, Spacer } from '@/shared/ui';
import { TRIP_TYPE_OPTIONS } from '@/shared/utils/labels';
import type { TripType } from '@yocabs/api-client';

export default function VehiclePricing() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = usePricing(id);
  const [tripType, setTripType] = useState<TripType>('CHAUFFEUR_ONE_WAY');

  return (
    <QueryBoundary query={query}>
      {(configs) => (
        <Screen>
          <AppText color="textMuted">
            Set a price for each kind of trip this vehicle does. Travellers only see trip types you
            switch on.
          </AppText>
          <Spacer size="sm" />
          <ChoiceChips
            options={TRIP_TYPE_OPTIONS}
            value={tripType}
            onChange={(value) => value && setTripType(value)}
          />
          <Spacer />
          {/* Keyed so switching trip type or saving resets the form to the stored values. */}
          <PricingEditor
            key={`${tripType}-${configs.find((c) => c.tripType === tripType)?.updatedAt ?? 'new'}`}
            vehicleId={id}
            tripType={tripType}
            existing={configs.find((config) => config.tripType === tripType)}
          />
        </Screen>
      )}
    </QueryBoundary>
  );
}
