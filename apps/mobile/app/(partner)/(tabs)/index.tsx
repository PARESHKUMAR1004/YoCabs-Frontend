import { router } from 'expo-router';
import { ApprovalBanner } from '@/features/partner/ApprovalBanner';
import { usePartner, usePartnerNegotiations, useReport } from '@/features/partner/hooks';
import { AppText, Button, Card, KeyValue, LoadingView, Screen, SectionHeader } from '@/shared/ui';
import { formatMoney } from '@/shared/utils/format';

export default function PartnerDashboard() {
  const partner = usePartner();
  const earnings = useReport('earnings');
  const offers = usePartnerNegotiations('OFFER_SENT');

  const refresh = () => {
    void partner.refetch();
    void earnings.refetch();
    void offers.refetch();
  };

  if (partner.isPending) return <LoadingView />;

  const report = earnings.data;
  const pendingOffers = offers.data?.length ?? 0;

  return (
    <Screen refreshing={partner.isRefetching} onRefresh={refresh}>
      <AppText variant="title">{partner.data?.name ?? 'Dashboard'}</AppText>
      <ApprovalBanner />

      {pendingOffers > 0 ? (
        <Card onPress={() => router.push('/(partner)/negotiations')}>
          <AppText variant="subheading" color="info">
            {pendingOffers} price offer{pendingOffers === 1 ? '' : 's'} waiting for your answer
          </AppText>
          <AppText color="textMuted">Tap to review.</AppText>
        </Card>
      ) : null}

      <SectionHeader title="Earnings" />
      <Card>
        <KeyValue label="Completed trips" value={`${report?.completedTrips ?? 0}`} />
        <KeyValue label="Upcoming trips" value={`${report?.upcomingTrips ?? 0}`} />
        <KeyValue label="Gross fare" value={formatMoney(report?.grossFare)} />
        <KeyValue label="YoCabs commission" value={formatMoney(report?.commission)} />
        <KeyValue label="Your earnings" value={formatMoney(report?.partnerEarnings)} emphasise />
        <KeyValue label="Wallet balance" value={formatMoney(report?.walletBalance)} emphasise />
      </Card>

      <Button
        title="Wallet & payouts"
        variant="secondary"
        onPress={() => router.push('/(partner)/wallet')}
      />
    </Screen>
  );
}
