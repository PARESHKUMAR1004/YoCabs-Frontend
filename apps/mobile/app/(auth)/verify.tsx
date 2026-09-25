import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm } from 'react-hook-form';
import { otpSchema, type OtpForm } from '@/features/auth/schemas';
import { api } from '@/shared/api/client';
import { signOut } from '@/shared/auth/session';
import { appRoleOf, homeRouteFor, useSessionStore } from '@/shared/auth/session.store';
import { env } from '@/config/env';
import { useCountdown } from '@/shared/hooks/useCountdown';
import { AppText, Button, FormTextField, Heading, Screen, Spacer } from '@/shared/ui';
import { formatMobile } from '@/shared/utils/format';
import { showError, showInfo } from '@/shared/utils/feedback';

const RESEND_SECONDS = 30;

export default function Verify() {
  const { mobile = '' } = useLocalSearchParams<{ mobile: string }>();
  const signIn = useSessionStore((state) => state.signIn);
  const { remaining, restart, done } = useCountdown(RESEND_SECONDS);

  const { control, handleSubmit } = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '' },
  });

  const verify = useMutation({
    mutationFn: (code: string) => api.auth.verifyOtp(mobile, code),
    onSuccess: async (user) => {
      if (appRoleOf(user) === 'admin') {
        await signOut();
        showInfo(
          'Use the admin console',
          'Administrator accounts sign in on the YoCabs admin website.',
        );
        router.replace('/(auth)/welcome');
        return;
      }
      signIn(user);
      router.replace(homeRouteFor(user) as never);
    },
    onError: (error) => showError(error, 'That code did not work'),
  });

  const resend = useMutation({
    mutationFn: () => api.auth.requestOtp(mobile),
    onSuccess: () => restart(),
    onError: (error) => showError(error, 'Could not resend the code'),
  });

  return (
    <Screen
      footer={
        <Button
          title="Verify"
          loading={verify.isPending}
          onPress={handleSubmit(({ code }) => verify.mutate(code))}
          testID="verify"
        />
      }
    >
      <Heading
        eyebrow="Verify"
        title="Enter the code"
        subtitle={`We sent a 6-digit code to ${formatMobile(mobile)}.`}
      />
      <FormTextField
        control={control}
        name="code"
        label="One-time code"
        placeholder="123456"
        keyboardType="number-pad"
        maxLength={6}
        autoComplete="one-time-code"
        testID="otp-input"
      />
      {env.sandboxPayments ? (
        <AppText variant="small" color="textMuted">
          Development build: the code is printed in the API server log.
        </AppText>
      ) : null}
      <Spacer />
      <Button
        title={done ? 'Resend code' : `Resend code in ${remaining}s`}
        variant="ghost"
        disabled={!done}
        loading={resend.isPending}
        onPress={() => resend.mutate()}
      />
    </Screen>
  );
}
