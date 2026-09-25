import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { partnerRegistrationSchema, type PartnerRegistrationForm } from '@/features/auth/schemas';
import { api } from '@/shared/api/client';
import { normalizeMobile } from '@/shared/forms/zod';
import { AppText, Button, FormTextField, Screen, Spacer } from '@/shared/ui';
import { showError } from '@/shared/utils/feedback';

export default function RegisterPartner() {
  const { control, handleSubmit } = useForm<PartnerRegistrationForm>({
    resolver: zodResolver(partnerRegistrationSchema),
    defaultValues: { ownerName: '', businessName: '', mobile: '' },
  });

  const register = useMutation({
    mutationFn: async (form: PartnerRegistrationForm) => {
      const mobile = normalizeMobile(form.mobile);
      await api.auth.registerPartner({
        mobile,
        ownerName: form.ownerName.trim(),
        businessName: form.businessName.trim(),
      });
      await api.auth.requestOtp(mobile);
      return mobile;
    },
    onSuccess: (mobile) => router.replace({ pathname: '/(auth)/verify', params: { mobile } }),
    onError: (error) => showError(error, 'Could not register your business'),
  });

  return (
    <Screen
      footer={
        <Button
          title="Register and continue"
          loading={register.isPending}
          onPress={handleSubmit((form) => register.mutate(form))}
        />
      }
    >
      <AppText variant="title">Grow with YoCabs</AppText>
      <AppText color="textMuted">
        Create your travel partner account. Our team verifies every partner before it goes live.
      </AppText>
      <Spacer size="xl" />
      <FormTextField
        control={control}
        name="businessName"
        label="Business name"
        autoCapitalize="words"
      />
      <FormTextField control={control} name="ownerName" label="Owner name" autoCapitalize="words" />
      <FormTextField
        control={control}
        name="mobile"
        label="Owner mobile number"
        keyboardType="phone-pad"
        maxLength={15}
        hint="You will sign in with this number."
      />
    </Screen>
  );
}
