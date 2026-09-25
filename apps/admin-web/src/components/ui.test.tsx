import { render, screen } from '@testing-library/react';
import { DataTable } from './ui';

describe('DataTable', () => {
  const columns = [
    { header: 'Name', cell: (row: { name: string }) => row.name },
    { header: 'Action', cell: () => <button>Go</button> },
  ];

  it('renders a row per item', () => {
    render(
      <DataTable
        rows={[{ name: 'Alpha' }, { name: 'Beta' }]}
        columns={columns}
        rowKey={(row) => row.name}
      />,
    );

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Go' })).toHaveLength(2);
  });

  it('shows the empty message instead of an empty table', () => {
    render(
      <DataTable
        rows={[]}
        columns={columns}
        rowKey={(row: { name: string }) => row.name}
        empty="Nothing waiting."
      />,
    );

    expect(screen.getByText('Nothing waiting.')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
