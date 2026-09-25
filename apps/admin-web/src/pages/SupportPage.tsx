import { useQuery } from '@tanstack/react-query';
import type { TicketStatus, TicketSummary } from '@yocabs/api-client';
import { useState } from 'react';
import { api } from '../api';
import { Async, Badge, Card, DataTable, ErrorMessage, PageHeader } from '../components/ui';
import { formatDateTime, humanize, shortId, toneOf } from '../format';
import { useAction } from '../hooks';

const STATUSES: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const KEY = ['support'];

function TicketThread({ id, onBack }: { id: string; onBack: () => void }) {
  const query = useQuery({
    queryKey: [...KEY, id],
    queryFn: () => api.support.get(id),
    refetchInterval: 15_000,
  });
  const [reply, setReply] = useState('');
  const send = useAction((body: string) => api.support.reply(id, body), [[...KEY, id]]);
  const assign = useAction(() => api.admin.support.assign(id), [KEY, [...KEY, id]]);
  const resolve = useAction(
    () => api.admin.support.resolve(id),
    [KEY, [...KEY, id], ['dashboard']],
  );
  const close = useAction(() => api.admin.support.close(id), [KEY, [...KEY, id], ['dashboard']]);
  const failure = [send, assign, resolve, close].find((action) => action.isError)?.error;

  return (
    <>
      <PageHeader title="Support ticket">
        <button onClick={onBack}>Back to queue</button>
      </PageHeader>
      <Async query={query}>
        {({ ticket, messages }) => (
          <>
            <Card title={ticket.subject}>
              <p>
                <Badge label={humanize(ticket.status)} tone={toneOf(ticket.status)} />{' '}
                {humanize(ticket.category)} · {humanize(ticket.creatorRole)} · booking{' '}
                {ticket.bookingId ? shortId(ticket.bookingId) : 'none'}
              </p>
              <div className="actions">
                <button onClick={() => assign.mutate(undefined)}>Assign to me</button>
                <button onClick={() => resolve.mutate(undefined)}>Resolve</button>
                <button onClick={() => close.mutate(undefined)}>Close</button>
              </div>
            </Card>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`bubble ${message.authorRole.includes('ADMIN') ? 'staff' : ''}`}
              >
                <span className="muted">
                  {humanize(message.authorRole)} · {formatDateTime(message.createdAt)}
                </span>
                <p>{message.body}</p>
              </div>
            ))}
            {failure ? <ErrorMessage error={failure} /> : null}
            {ticket.status !== 'CLOSED' ? (
              <form
                className="inline-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  send.mutate(reply.trim(), { onSuccess: () => setReply('') });
                }}
              >
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Write a reply"
                  required
                />
                <button className="primary" disabled={send.isPending}>
                  Send
                </button>
              </form>
            ) : null}
          </>
        )}
      </Async>
    </>
  );
}

export function SupportPage() {
  const [status, setStatus] = useState<TicketStatus | undefined>('OPEN');
  const [openId, setOpenId] = useState<string | null>(null);
  const query = useQuery({
    queryKey: [...KEY, 'queue', status],
    queryFn: () => api.admin.support.queue(status),
  });

  if (openId) return <TicketThread id={openId} onBack={() => setOpenId(null)} />;

  return (
    <>
      <PageHeader title="Support">
        <select
          value={status ?? ''}
          onChange={(e) => setStatus((e.target.value || undefined) as TicketStatus | undefined)}
        >
          <option value="">All</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {humanize(s)}
            </option>
          ))}
        </select>
      </PageHeader>
      <Async query={query}>
        {(tickets) => (
          <DataTable<TicketSummary>
            rows={tickets}
            rowKey={(ticket) => ticket.id}
            empty="No tickets."
            columns={[
              { header: 'Subject', cell: (t) => t.subject },
              { header: 'Category', cell: (t) => humanize(t.category) },
              { header: 'From', cell: (t) => humanize(t.creatorRole) },
              {
                header: 'Status',
                cell: (t) => <Badge label={humanize(t.status)} tone={toneOf(t.status)} />,
              },
              { header: 'Updated', cell: (t) => formatDateTime(t.updatedAt) },
              {
                header: '',
                align: 'right',
                cell: (t) => <button onClick={() => setOpenId(t.id)}>Open</button>,
              },
            ]}
          />
        )}
      </Async>
    </>
  );
}
