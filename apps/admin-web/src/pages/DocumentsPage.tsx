import { useQuery } from '@tanstack/react-query';
import type { DocumentRecord } from '@yocabs/api-client';
import { api } from '../api';
import { Async, Badge, DataTable, ErrorMessage, PageHeader } from '../components/ui';
import { formatDateTime, humanize, shortId, toneOf } from '../format';
import { useAction } from '../hooks';

const KEY = ['documents'];

/** Downloads through the authenticated API (documents are private) and opens the file in a new tab. */
async function openDocument(document: DocumentRecord): Promise<void> {
  const blob = await api.documents.content(document.id);
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function DocumentsPage() {
  const query = useQuery({ queryKey: KEY, queryFn: () => api.admin.documents.queue('PENDING') });
  const approve = useAction((id: string) => api.admin.documents.approve(id), [KEY, ['dashboard']]);
  const reject = useAction(
    ({ id, reason }: { id: string; reason: string }) => api.admin.documents.reject(id, reason),
    [KEY, ['dashboard']],
  );
  const open = useAction(openDocument, []);

  const onReject = (document: DocumentRecord) => {
    const reason = window.prompt('Reason for rejecting this document?');
    if (reason?.trim()) reject.mutate({ id: document.id, reason: reason.trim() });
  };

  const failure = [approve, reject, open].find((action) => action.isError)?.error;

  return (
    <>
      <PageHeader title="Document review" />
      {failure ? <ErrorMessage error={failure} /> : null}
      <Async query={query}>
        {(documents) => (
          <DataTable
            rows={documents}
            rowKey={(document) => document.id}
            empty="No documents waiting for review."
            columns={[
              { header: 'Owner', cell: (d) => `${humanize(d.ownerType)} ${shortId(d.ownerId)}` },
              { header: 'Document', cell: (d) => humanize(d.documentType) },
              { header: 'File', cell: (d) => d.filename },
              { header: 'Uploaded', cell: (d) => formatDateTime(d.createdAt) },
              {
                header: 'Status',
                cell: (d) => <Badge label={humanize(d.status)} tone={toneOf(d.status)} />,
              },
              {
                header: '',
                align: 'right',
                cell: (d) => (
                  <>
                    <button onClick={() => open.mutate(d)}>View</button>
                    <button className="primary" onClick={() => approve.mutate(d.id)}>
                      Approve
                    </button>
                    <button onClick={() => onReject(d)}>Reject</button>
                  </>
                ),
              },
            ]}
          />
        )}
      </Async>
    </>
  );
}
