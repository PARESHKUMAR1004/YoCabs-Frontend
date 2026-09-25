import type { DocumentOwnerType, DocumentType } from '@yocabs/api-client';
import { AppText, Badge, Button, Card, LoadingView, Row } from '@/shared/ui';
import { showError } from '@/shared/utils/feedback';
import { formatDate, humanize } from '@/shared/utils/format';
import { useDocuments, useUploadDocument } from './hooks';

const TONES = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger' } as const;

interface Props {
  ownerType: DocumentOwnerType;
  ownerId: string;
  /** What this owner is expected to upload. */
  requiredTypes: DocumentType[];
}

/** Checklist of required documents with their review status and an upload button for each. */
export function DocumentsSection({ ownerType, ownerId, requiredTypes }: Props) {
  const query = useDocuments(ownerType, ownerId);
  const upload = useUploadDocument(ownerType, ownerId);

  if (query.isPending) return <LoadingView />;

  const documents = query.data ?? [];

  return (
    <>
      {requiredTypes.map((type) => {
        const latest = documents.filter((doc) => doc.documentType === type).at(-1);

        return (
          <Card key={type}>
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="subheading">{humanize(type)}</AppText>
              {latest ? (
                <Badge label={humanize(latest.status)} tone={TONES[latest.status]} />
              ) : null}
            </Row>
            {latest?.status === 'REJECTED' && latest.rejectionReason ? (
              <AppText color="danger">Rejected: {latest.rejectionReason}</AppText>
            ) : null}
            {latest ? (
              <AppText variant="small" color="textMuted">
                {latest.filename} · uploaded {formatDate(latest.createdAt)}
              </AppText>
            ) : null}
            <Button
              title={latest ? 'Upload a new file' : 'Upload'}
              variant="secondary"
              loading={upload.isPending && upload.variables?.documentType === type}
              onPress={() =>
                upload.mutate(
                  { documentType: type },
                  { onError: (error) => showError(error, 'Upload failed') },
                )
              }
            />
          </Card>
        );
      })}
    </>
  );
}
