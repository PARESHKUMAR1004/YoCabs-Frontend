import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { loginSchema, type LoginForm } from '@/features/auth/schemas';
import { api } from '@/shared/api/client';
import { normalizeMobile } from '@/shared/forms/zod';
import { Button, FormTextField, Heading, Screen } from '@/shared/ui';
import { showError } from '@/shared/utils/feedback';

export default function Login() {
  const { control, handleSubmit } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { mobile: '' },
  });

  const requestOtp = useMutation({
    mutationFn: (mobile: string) => api.auth.requestOtp(normalizeMobile(mobile)),
    onSuccess: (_result, mobile) =>
      router.push({ pathname: '/(auth)/verify', params: { mobile: normalizeMobile(mobile) } }),
    onError: (error) => showError(error, 'Could not send the code'),
  });

  return (
    <Screen
      footer={
        <Button
          title="Send code"
          loading={requestOtp.isPending}
          onPress={handleSubmit(({ mobile }) => requestOtp.mutate(mobile))}
          testID="send-code"
        />
      }
    >
      <Heading
        eyebrow="Sign in"
        title="Welcome back"
        subtitle="Enter your mobile number. We will text you a 6-digit code."
      />
      <FormTextField
        control={control}
        name="mobile"
        label="Mobile number"
        placeholder="98765 43210"
        keyboardType="phone-pad"
        autoComplete="tel"
        maxLength={15}
        testID="mobile-input"
      />
    </Screen>
  );
}
