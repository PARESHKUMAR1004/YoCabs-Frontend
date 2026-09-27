import { router } from 'expo-router';
import { PartnerOffers } from '@/features/negotiation/PartnerOffers';
import { ApprovalBanner } from '@/features/partner/ApprovalBanner';
import { usePartner, usePartnerNegotiations, useReport } from '@/features/partner/hooks';
import { AppText, Button, Card, KeyValue, LoadingView, Screen, SectionHeader } from '@/shared/ui';
import { formatMoney } from '@/shared/utils/format';

export default function PartnerDashboard() {
  const partner = usePartner();
  const earnings = useReport('earnings');
  const offers = usePartnerNegotiations();

  const refresh = () => {
    void partner.refetch();
    void earnings.refetch();
    void offers.refetch();
  };

  if (partner.isPending) return <LoadingView />;

  const report = earnings.data;

  return (
    <Screen refreshing={partner.isRefetching} onRefresh={refresh}>
      <AppText variant="title">{partner.data?.name ?? 'Dashboard'}</AppText>
      <ApprovalBanner />

      <PartnerOffers />

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
