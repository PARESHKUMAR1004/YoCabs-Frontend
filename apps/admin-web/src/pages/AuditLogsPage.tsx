import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { Async, DataTable, PageHeader } from '../components/ui';
import { formatDateTime, humanize, shortId } from '../format';

export function AuditLogsPage() {
  const query = useQuery({ queryKey: ['audit'], queryFn: () => api.admin.auditLogs(200) });

  return (
    <>
      <PageHeader title="Audit log" />
      <Async query={query}>
        {(logs) => (
          <DataTable
            rows={logs}
            rowKey={(log) => log.id}
            columns={[
              { header: 'When', cell: (l) => formatDateTime(l.createdAt) },
              { header: 'Who', cell: (l) => `${humanize(l.actorRole)} ${shortId(l.actorId)}` },
              { header: 'Action', cell: (l) => humanize(l.action) },
              {
                header: 'Target',
                cell: (l) =>
                  l.targetType
                    ? `${humanize(l.targetType)} ${l.targetId ? shortId(l.targetId) : ''}`
                    : '-',
              },
              { header: 'Details', cell: (l) => l.details ?? '' },
            ]}
          />
        )}
      </Async>
    </>
  );
}
