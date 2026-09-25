import { offerSchema } from './schemas';

describe('offerSchema', () => {
  const schema = offerSchema(2500);

  it('accepts an offer below the listed price', () => {
    expect(schema.parse({ amount: '2000' }).amount).toBe(2000);
  });

  it('rejects an offer at or above the listed price, naming the price', () => {
    const result = schema.safeParse({ amount: '2500' });
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error?.issues)).toContain('₹2,500');
  });

  it.each(['', '0', '-10', 'cheap'])('rejects %s', (amount) => {
    expect(schema.safeParse({ amount }).success).toBe(false);
  });
});
