import { useQuery } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { api } from '../api';
import { Async, Badge, Card, DataTable, ErrorMessage, PageHeader } from '../components/ui';
import { useAction } from '../hooks';

const KEY = ['facilities'];

export function FacilitiesPage() {
  const query = useQuery({ queryKey: KEY, queryFn: () => api.admin.facilities.list() });
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const create = useAction(
    (input: { code: string; name: string }) => api.admin.facilities.create(input.code, input.name),
    [KEY],
  );
  const toggle = useAction(
    ({ code, active }: { code: string; active: boolean }) =>
      api.admin.facilities.setActive(code, active),
    [KEY],
  );

  function submit(event: FormEvent) {
    event.preventDefault();
    create.mutate(
      { code: code.trim().toUpperCase().replaceAll(' ', '_'), name: name.trim() },
      {
        onSuccess: () => {
          setCode('');
          setName('');
        },
      },
    );
  }

  return (
    <>
      <PageHeader title="Facilities" />
      <Card title="Add a facility">
        <form onSubmit={submit} className="inline-form">
          <input
            placeholder="Code (e.g. WIFI)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <input
            placeholder="Display name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button className="primary" disabled={create.isPending}>
            Add
          </button>
        </form>
        {create.isError ? <ErrorMessage error={create.error} /> : null}
      </Card>
      {toggle.isError ? <ErrorMessage error={toggle.error} /> : null}
      <Async query={query}>
        {(facilities) => (
          <DataTable
            rows={facilities}
            rowKey={(facility) => facility.code}
            columns={[
              { header: 'Code', cell: (f) => f.code },
              { header: 'Name', cell: (f) => f.name },
              {
                header: 'Status',
                cell: (f) => (
                  <Badge
                    label={f.active ? 'Active' : 'Hidden'}
                    tone={f.active ? 'success' : 'neutral'}
                  />
                ),
              },
              {
                header: '',
                align: 'right',
                cell: (f) => (
                  <button onClick={() => toggle.mutate({ code: f.code, active: !f.active })}>
                    {f.active ? 'Hide' : 'Show'}
                  </button>
                ),
              },
            ]}
          />
        )}
      </Async>
    </>
  );
}
