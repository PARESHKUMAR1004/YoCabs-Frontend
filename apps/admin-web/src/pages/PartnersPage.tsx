import { useQuery } from '@tanstack/react-query';
import type { AdminPartner, PartnerStatus } from '@yocabs/api-client';
import { useState, type FormEvent } from 'react';
import { api } from '../api';
import { Async, Badge, Card, DataTable, ErrorMessage, PageHeader } from '../components/ui';
import { formatDate, humanize, toneOf } from '../format';
import { useAction } from '../hooks';

const KEY = ['partners'];
const STATUSES: PartnerStatus[] = ['PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED', 'INACTIVE'];

function CreatePartner() {
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [mobile, setMobile] = useState('');

  const create = useAction(async () => {
    const id = await api.admin.partners.create(name.trim());
    await api.admin.partners.createOwner(id, { name: ownerName.trim(), mobile: mobile.trim() });
    await api.admin.partners.activate(id);
  }, [KEY]);

  function submit(event: FormEvent) {
    event.preventDefault();
    create.mutate(undefined, {
      onSuccess: () => {
        setName('');
        setOwnerName('');
        setMobile('');
      },
    });
  }

  return (
    <Card title="Onboard a travel partner">
      <form onSubmit={submit} className="inline-form">
        <input
          placeholder="Business name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          placeholder="Owner name"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          required
        />
        <input
          placeholder="Owner mobile (10 digits)"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          required
        />
        <button className="primary" disabled={create.isPending}>
          Create & activate
        </button>
      </form>
      {create.isError ? <ErrorMessage error={create.error} /> : null}
    </Card>
  );
}

export function PartnersPage() {
  const [status, setStatus] = useState<PartnerStatus | undefined>('PENDING_APPROVAL');
  const query = useQuery({
    queryKey: [...KEY, status],
    queryFn: () => api.admin.partners.list(status),
  });

  const activate = useAction((id: string) => api.admin.partners.activate(id), [KEY]);
  const suspend = useAction(
    (id: string) => api.admin.partners.suspend(id, 'Suspended by administrator'),
    [KEY],
  );
  const reinstate = useAction((id: string) => api.admin.partners.reinstate(id), [KEY]);
  const deactivate = useAction((id: string) => api.admin.partners.deactivate(id), [KEY]);
  const failure = [activate, suspend, reinstate, deactivate].find(
    (action) => action.isError,
  )?.error;

  const actions = (partner: AdminPartner) => {
    switch (partner.status) {
      case 'PENDING_APPROVAL':
        return <button onClick={() => activate.mutate(partner.id)}>Approve</button>;
      case 'ACTIVE':
        return (
          <>
            <button onClick={() => suspend.mutate(partner.id)}>Suspend</button>
            <button onClick={() => deactivate.mutate(partner.id)}>Deactivate</button>
          </>
        );
      case 'SUSPENDED':
        return <button onClick={() => reinstate.mutate(partner.id)}>Reinstate</button>;
      default:
        return null;
    }
  };

  return (
    <>
      <PageHeader title="Travel partners">
        <select
          value={status ?? ''}
          onChange={(e) => setStatus((e.target.value || undefined) as PartnerStatus | undefined)}
        >
          <option value="">All</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {humanize(s)}
            </option>
          ))}
        </select>
      </PageHeader>
      <CreatePartner />
      {failure ? <ErrorMessage error={failure} /> : null}
      <Async query={query}>
        {(partners) => (
          <DataTable
            rows={partners}
            rowKey={(partner) => partner.id}
            empty="No partners with this status."
            columns={[
              { header: 'Name', cell: (p) => p.name },
              {
                header: 'Status',
                cell: (p) => <Badge label={humanize(p.status)} tone={toneOf(p.status)} />,
              },
              { header: 'Registered', cell: (p) => formatDate(p.createdAt) },
              { header: '', cell: actions, align: 'right' },
            ]}
          />
        )}
      </Async>
    </>
  );
}
