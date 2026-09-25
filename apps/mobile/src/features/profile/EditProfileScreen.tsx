import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Button, FormTextField, QueryBoundary, Screen } from '@/shared/ui';
import { showError } from '@/shared/utils/feedback';
import { useProfile, useUpdateProfile } from './hooks';
import { profileSchema, type ProfileForm, type ProfileValues } from './schemas';

function EditForm({ defaults }: { defaults: ProfileForm }) {
  const update = useUpdateProfile();
  const { control, handleSubmit } = useForm<ProfileForm, unknown, ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaults,
  });

  const onSave = handleSubmit((values) =>
    update.mutate(
      { displayName: values.displayName, email: values.email || undefined },
      {
        onSuccess: () => router.back(),
        onError: (error) => showError(error, 'Could not save your profile'),
      },
    ),
  );

  return (
    <Screen
      footer={
        <Button
          title="Save"
          loading={update.isPending}
          onPress={() => void onSave()}
          testID="save-profile"
        />
      }
    >
      <FormTextField
        control={control}
        name="displayName"
        label="Full name"
        autoCapitalize="words"
      />
      <FormTextField
        control={control}
        name="email"
        label="Email (optional)"
        keyboardType="email-address"
        autoCapitalize="none"
      />
    </Screen>
  );
}

export function EditProfileScreen() {
  const query = useProfile();

  return (
    <QueryBoundary query={query}>
      {(profile) => (
        <EditForm
          defaults={{ displayName: profile.displayName ?? '', email: profile.email ?? '' }}
        />
      )}
    </QueryBoundary>
  );
}
