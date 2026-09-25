import {
  addDays,
  formatDate,
  formatDateRange,
  formatDuration,
  formatMoney,
  humanize,
} from './format';

describe('formatMoney', () => {
  it('uses the rupee symbol and Indian grouping', () => {
    expect(formatMoney(1800)).toBe('₹1,800');
    expect(formatMoney(123456)).toBe('₹1,23,456');
  });

  it('shows paise only when present', () => {
    expect(formatMoney(99.5)).toBe('₹99.50');
  });

  it('handles missing amounts and other currencies', () => {
    expect(formatMoney(null)).toBe('-');
    expect(formatMoney(undefined)).toBe('-');
    expect(formatMoney(10, 'USD')).toBe('USD 10');
  });
});

describe('dates', () => {
  it('formats ISO dates without depending on the device locale', () => {
    expect(formatDate('2026-09-19')).toBe('19 Sep 2026');
    expect(formatDate(null)).toBe('-');
  });

  it('collapses a single-day range', () => {
    expect(formatDateRange('2026-09-19', '2026-09-19')).toBe('19 Sep 2026');
    expect(formatDateRange('2026-09-19', '2026-09-21')).toBe('19 Sep 2026 - 21 Sep 2026');
  });

  it('adds days across month ends', () => {
    expect(addDays('2026-09-29', 3)).toBe('2026-10-02');
  });
});

describe('formatDuration', () => {
  it('reads naturally', () => {
    expect(formatDuration(45)).toBe('45 min');
    expect(formatDuration(120)).toBe('2 h');
    expect(formatDuration(135)).toBe('2 h 15 min');
  });
});

describe('humanize', () => {
  it('turns API codes into words', () => {
    expect(humanize('PENDING_PAYMENT')).toBe('Pending Payment');
  });
});
