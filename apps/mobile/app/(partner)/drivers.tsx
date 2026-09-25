import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { FlatList, StyleSheet } from 'react-native';
import { spacing } from '@/config/brand';
import { useCreateDriver, useDrivers, useSetDriverActive } from '@/features/partner/hooks';
import { driverSchema, type DriverForm, type DriverValues } from '@/features/partner/schemas';
import { AppText, Badge, Button, Card, FormTextField, QueryBoundary, Row } from '@/shared/ui';
import { normalizeMobile } from '@/shared/forms/zod';
import { showError } from '@/shared/utils/feedback';
import { formatMobile } from '@/shared/utils/format';

function AddDriver({ onDone }: { onDone: () => void }) {
  const create = useCreateDriver();
  const { control, handleSubmit } = useForm<DriverForm, unknown, DriverValues>({
    resolver: zodResolver(driverSchema),
    defaultValues: { name: '', mobile: '', licenseNumber: '' },
  });

  const onSave = handleSubmit((values) =>
    create.mutate(
      { ...values, mobile: normalizeMobile(values.mobile) },
      { onSuccess: onDone, onError: (error) => showError(error, 'Could not add the driver') },
    ),
  );

  return (
    <Card>
      <FormTextField control={control} name="name" label="Driver name" autoCapitalize="words" />
      <FormTextField
        control={control}
        name="mobile"
        label="Mobile number"
        keyboardType="phone-pad"
        hint="The driver signs in with this number."
      />
      <FormTextField
        control={control}
        name="licenseNumber"
        label="Driving licence number"
        autoCapitalize="characters"
      />
      <Button title="Add driver" loading={create.isPending} onPress={() => void onSave()} />
    </Card>
  );
}

export default function Drivers() {
  const query = useDrivers();
  const setActive = useSetDriverActive();
  const [adding, setAdding] = useState(false);

  return (
    <QueryBoundary query={query}>
      {(drivers) => (
        <FlatList
          data={drivers}
          keyExtractor={(driver) => driver.id}
          contentContainerStyle={styles.list}
          refreshing={query.isRefetching}
          onRefresh={() => void query.refetch()}
          ListHeaderComponent={
            adding ? (
              <AddDriver onDone={() => setAdding(false)} />
            ) : (
              <Button
                title="Add driver"
                variant="secondary"
                onPress={() => setAdding(true)}
                style={styles.header}
              />
            )
          }
          ListEmptyComponent={
            <AppText color="textMuted">No drivers yet. Add one to assign trips.</AppText>
          }
          renderItem={({ item }) => (
            <Card>
              <Row style={styles.row}>
                <AppText variant="subheading" style={styles.flex}>
                  {item.name}
                </AppText>
                <Badge
                  label={item.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                  tone={item.status === 'ACTIVE' ? 'success' : 'neutral'}
                />
              </Row>
              <AppText color="textMuted">
                {formatMobile(item.mobile)} · {item.licenseNumber}
              </AppText>
              <Button
                title={item.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                variant="ghost"
                onPress={() =>
                  setActive.mutate(
                    { driverId: item.id, active: item.status !== 'ACTIVE' },
                    { onError: (error) => showError(error) },
                  )
                }
              />
            </Card>
          )}
        />
      )}
    </QueryBoundary>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg },
  header: { marginBottom: spacing.md },
  row: { justifyContent: 'space-between', gap: spacing.sm },
  flex: { flex: 1 },
});
