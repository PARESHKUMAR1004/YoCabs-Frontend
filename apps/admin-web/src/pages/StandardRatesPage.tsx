import { useQuery } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import type { VehicleCategory } from '@yocabs/api-client';
import { api } from '../api';
import { Card, DataTable, ErrorMessage, PageHeader } from '../components/ui';
import { useAction } from '../hooks';

const KEY = ['standard-rates'];

const CATEGORIES: VehicleCategory[] = ['MINI', 'SEDAN', 'SUV', 'MUV', 'LUXURY', 'TEMPO_TRAVELLER', 'BUS'];

export function StandardRatesPage() {
  const query = useQuery({ queryKey: KEY, queryFn: () => api.standardRates.list() });
  const [category, setCategory] = useState<VehicleCategory>('SEDAN');
  const [perKmRate, setPerKmRate] = useState('');

  const set = useAction(
    (input: { category: VehicleCategory; perKmRate: number }) =>
      api.admin.standardRates.set(input.category, input.perKmRate),
    [KEY],
  );

  function submit(event: FormEvent) {
    event.preventDefault();
    const amount = Number(perKmRate);
    if (!Number.isFinite(amount) || amount <= 0) return;

    set.mutate(
      { category, perKmRate: amount },
      { onSuccess: () => setPerKmRate('') },
    );
  }

  const rates = query.data ?? [];
  const byCategory = new Map(rates.map((rate) => [rate.category, rate]));

  return (
    <>
      <PageHeader title="Standard rates" />
      <Card title="What this is">
        <p className="muted">
          The per-kilometre fare YoCabs considers typical for each vehicle type. Travellers see it
          next to a partner&apos;s price on the app, so they can tell whether an offer is above or
          below what YoCabs quotes as standard. A vehicle type with no rate set here shows no
          comparison in the app.
        </p>
      </Card>

      <Card title="Set a rate">
        <form onSubmit={submit} className="inline-form">
          <select value={category} onChange={(e) => setCategory(e.target.value as VehicleCategory)}>
            {CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {option.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Rate per km (₹)"
            value={perKmRate}
            onChange={(e) => setPerKmRate(e.target.value)}
            required
          />
          <button className="primary" disabled={set.isPending}>
            Save
          </button>
        </form>
        {set.isError ? <ErrorMessage error={set.error} /> : null}
      </Card>

      {query.isError ? (
        <ErrorMessage error={query.error} />
      ) : (
        <DataTable
          rows={CATEGORIES}
          rowKey={(cat) => cat}
          columns={[
            { header: 'Vehicle type', cell: (cat) => cat.replaceAll('_', ' ') },
            {
              header: 'Standard rate',
              cell: (cat) => {
                const rate = byCategory.get(cat);
                return rate ? `₹${rate.perKmRate.toFixed(2)} / km` : 'Not set';
              },
            },
            {
              header: 'Last updated',
              cell: (cat) => {
                const rate = byCategory.get(cat);
                return rate ? new Date(rate.updatedAt).toLocaleString() : '-';
              },
            },
          ]}
        />
      )}
    </>
  );
}
