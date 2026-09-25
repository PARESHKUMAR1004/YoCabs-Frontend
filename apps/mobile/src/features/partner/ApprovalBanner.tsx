import type { PartnerStatus } from '@yocabs/api-client';
import { AppText, Card } from '@/shared/ui';
import { usePartner } from './hooks';

const MESSAGES: Partial<
  Record<PartnerStatus, { title: string; body: string; tone: 'warning' | 'danger' }>
> = {
  PENDING_APPROVAL: {
    title: 'Waiting for approval',
    body: 'Upload your business documents and add your fleet. Vehicles appear to travellers once YoCabs approves your account.',
    tone: 'warning',
  },
  SUSPENDED: {
    title: 'Account suspended',
    body: 'Your vehicles are hidden from travellers. Contact support to resolve this.',
    tone: 'danger',
  },
  INACTIVE: {
    title: 'Account inactive',
    body: 'Your account is no longer active. Contact support if this is a mistake.',
    tone: 'danger',
  },
};

/** Explains why nothing is bookable yet; renders nothing for an active partner. */
export function ApprovalBanner() {
  const { data } = usePartner();
  const message = data ? MESSAGES[data.status] : undefined;
  if (!message) return null;

  return (
    <Card>
      <AppText variant="subheading" color={message.tone}>
        {message.title}
      </AppText>
      <AppText color="textMuted">{message.body}</AppText>
    </Card>
  );
}
