import type { UseQueryResult } from '@tanstack/react-query';
import { userMessage } from '@yocabs/api-client';
import type { ReactNode } from 'react';

export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  return <span className={`badge ${tone}`}>{label}</span>;
}

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="page-header">
      <h2>{title}</h2>
      <div className="actions">{children}</div>
    </header>
  );
}

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="card">
      {title ? <h3>{title}</h3> : null}
      {children}
    </section>
  );
}

export function ErrorMessage({ error }: { error: unknown }) {
  return (
    <p role="alert" className="error">
      {userMessage(error)}
    </p>
  );
}

/** Loading / error / content for any query, so pages never render half-loaded data. */
export function Async<T>({
  query,
  children,
}: {
  query: UseQueryResult<T>;
  children: (data: T) => ReactNode;
}) {
  if (query.isPending) return <p className="muted">Loading…</p>;
  if (query.isError) {
    return (
      <div>
        <ErrorMessage error={query.error} />
        <button type="button" onClick={() => void query.refetch()}>
          Try again
        </button>
      </div>
    );
  }
  return <>{children(query.data)}</>;
}

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  align?: 'right';
}

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  empty = 'Nothing to show.',
}: {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  empty?: string;
}) {
  if (rows.length === 0) return <p className="muted">{empty}</p>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.header} className={column.align}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column) => (
                <td key={column.header} className={column.align}>
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
