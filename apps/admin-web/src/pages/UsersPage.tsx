import { useQuery } from '@tanstack/react-query';
import type { Role } from '@yocabs/api-client';
import { useState } from 'react';
import { api } from '../api';
import { Async, Badge, DataTable, ErrorMessage, PageHeader } from '../components/ui';
import { formatDate, humanize, toneOf } from '../format';
import { useAction } from '../hooks';

const ROLES: Role[] = ['TOURIST', 'PARTNER_OWNER', 'PARTNER_STAFF', 'DRIVER', 'ADMIN'];

export function UsersPage() {
  const [role, setRole] = useState<Role>('TOURIST');
  const query = useQuery({ queryKey: ['users', role], queryFn: () => api.admin.users.list(role) });
  const block = useAction((id: string) => api.admin.users.block(id), [['users']]);
  const unblock = useAction((id: string) => api.admin.users.unblock(id), [['users']]);

  return (
    <>
      <PageHeader title="Users">
        <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {humanize(r)}
            </option>
          ))}
        </select>
      </PageHeader>
      {block.isError ? <ErrorMessage error={block.error} /> : null}
      {unblock.isError ? <ErrorMessage error={unblock.error} /> : null}
      <Async query={query}>
        {(users) => (
          <DataTable
            rows={users}
            rowKey={(user) => user.id}
            columns={[
              { header: 'Name', cell: (u) => u.displayName ?? '-' },
              { header: 'Mobile', cell: (u) => u.mobile ?? '-' },
              { header: 'Email', cell: (u) => u.email ?? '-' },
              { header: 'Joined', cell: (u) => formatDate(u.createdAt) },
              {
                header: 'Status',
                cell: (u) => <Badge label={humanize(u.status)} tone={toneOf(u.status)} />,
              },
              {
                header: '',
                align: 'right',
                cell: (u) =>
                  u.status === 'ACTIVE' ? (
                    <button onClick={() => block.mutate(u.id)}>Block</button>
                  ) : (
                    <button onClick={() => unblock.mutate(u.id)}>Unblock</button>
                  ),
              },
            ]}
          />
        )}
      </Async>
    </>
  );
}
