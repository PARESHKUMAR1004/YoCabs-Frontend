import { useQuery } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { api } from '../api';
import { Async, Badge, Card, DataTable, ErrorMessage, PageHeader } from '../components/ui';
import { formatDate, humanize, toneOf } from '../format';
import { useAction } from '../hooks';

const KEY = ['admins'];

/** Super admins only (the route is not even mounted for anyone else). */
export function AdminsPage() {
  const query = useQuery({ queryKey: KEY, queryFn: () => api.admin.users.list('ADMIN') });
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const create = useAction(
    (input: { email: string; password: string; displayName: string }) =>
      api.admin.users.createAdmin(input),
    [KEY],
  );

  function submit(event: FormEvent) {
    event.preventDefault();
    create.mutate(
      { displayName: displayName.trim(), email: email.trim(), password },
      {
        onSuccess: () => {
          setDisplayName('');
          setEmail('');
          setPassword('');
        },
      },
    );
  }

  return (
    <>
      <PageHeader title="Administrators" />
      <Card title="Add an administrator">
        <form onSubmit={submit} className="inline-form">
          <input
            placeholder="Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Initial password (min 10 characters)"
            minLength={10}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="primary" disabled={create.isPending}>
            Create
          </button>
        </form>
        {create.isError ? <ErrorMessage error={create.error} /> : null}
      </Card>
      <Async query={query}>
        {(admins) => (
          <DataTable
            rows={admins}
            rowKey={(admin) => admin.id}
            columns={[
              { header: 'Name', cell: (a) => a.displayName ?? '-' },
              { header: 'Email', cell: (a) => a.email ?? '-' },
              { header: 'Since', cell: (a) => formatDate(a.createdAt) },
              {
                header: 'Status',
                cell: (a) => <Badge label={humanize(a.status)} tone={toneOf(a.status)} />,
              },
            ]}
          />
        )}
      </Async>
    </>
  );
}
