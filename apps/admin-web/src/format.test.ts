import { formatMoney, humanize, shortId, toneOf } from './format';

describe('format', () => {
  it('formats rupees with Indian grouping', () => {
    expect(formatMoney(123456)).toContain('1,23,456');
    expect(formatMoney(null)).toContain('0');
  });

  it('humanizes API codes', () => {
    expect(humanize('PENDING_APPROVAL')).toBe('Pending approval');
  });

  it('shortens ids for tables', () => {
    expect(shortId('12345678-aaaa-bbbb-cccc-1234567890ab')).toBe('12345678');
  });

  it('colours statuses consistently and falls back to neutral', () => {
    expect(toneOf('ACTIVE')).toBe('success');
    expect(toneOf('SUSPENDED')).toBe('danger');
    expect(toneOf('SOMETHING_NEW')).toBe('neutral');
  });
});
