import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { FlatList, StyleSheet } from 'react-native';
import { spacing } from '@/config/brand';
import { useAddStaff, useRemoveStaff, useStaff } from '@/features/partner/hooks';
import { staffSchema, type StaffForm } from '@/features/partner/schemas';
import { AppText, Button, Card, FormTextField, QueryBoundary, Row } from '@/shared/ui';
import { normalizeMobile } from '@/shared/forms/zod';
import { confirmAction, showError } from '@/shared/utils/feedback';
import { formatMobile } from '@/shared/utils/format';

function AddStaff({ onDone }: { onDone: () => void }) {
  const add = useAddStaff();
  const { control, handleSubmit } = useForm<StaffForm, unknown, { name: string; mobile: string }>({
    resolver: zodResolver(staffSchema),
    defaultValues: { name: '', mobile: '' },
  });

  const onSave = handleSubmit((values) =>
    add.mutate(
      { name: values.name, mobile: normalizeMobile(values.mobile) },
      { onSuccess: onDone, onError: (error) => showError(error, 'Could not add the staff member') },
    ),
  );

  return (
    <Card>
      <FormTextField control={control} name="name" label="Name" autoCapitalize="words" />
      <FormTextField
        control={control}
        name="mobile"
        label="Mobile number"
        keyboardType="phone-pad"
      />
      <Button title="Add staff member" loading={add.isPending} onPress={() => void onSave()} />
    </Card>
  );
}

export default function Staff() {
  const query = useStaff();
  const remove = useRemoveStaff();
  const [adding, setAdding] = useState(false);

  const onRemove = async (id: string, name: string | null) => {
    if (
      await confirmAction(
        'Remove staff member?',
        `${name ?? 'This person'} will lose access.`,
        'Remove',
        true,
      )
    ) {
      remove.mutate(id, { onError: (error) => showError(error) });
    }
  };

  return (
    <QueryBoundary query={query}>
      {(staff) => (
        <FlatList
          data={staff}
          keyExtractor={(member) => member.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            adding ? (
              <AddStaff onDone={() => setAdding(false)} />
            ) : (
              <Button
                title="Add staff member"
                variant="secondary"
                onPress={() => setAdding(true)}
                style={styles.header}
              />
            )
          }
          ListEmptyComponent={
            <AppText color="textMuted">Staff can manage bookings and fleet for you.</AppText>
          }
          renderItem={({ item }) => (
            <Card>
              <Row style={styles.row}>
                <AppText variant="subheading">{item.name ?? 'Staff member'}</AppText>
                <Button
                  title="Remove"
                  variant="ghost"
                  onPress={() => void onRemove(item.id, item.name)}
                />
              </Row>
              <AppText color="textMuted">{formatMobile(item.mobile)}</AppText>
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
  row: { justifyContent: 'space-between' },
});
