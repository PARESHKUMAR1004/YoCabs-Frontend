import { usePartnerId } from '@/features/partner/hooks';
import { DocumentsSection } from '@/features/documents/DocumentsSection';
import { AppText, Screen, Spacer } from '@/shared/ui';

export default function PartnerDocuments() {
  const partnerId = usePartnerId();

  return (
    <Screen>
      <AppText color="textMuted">YoCabs reviews these before your vehicles go live.</AppText>
      <Spacer />
      <DocumentsSection
        ownerType="PARTNER"
        ownerId={partnerId}
        requiredTypes={['GST_CERTIFICATE', 'TRADE_LICENSE', 'AADHAAR']}
      />
    </Screen>
  );
}
