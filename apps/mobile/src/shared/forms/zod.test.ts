import { mobileField, normalizeMobile, positiveNumber, wholeNumberInRange } from './zod';

describe('mobileField', () => {
  it.each(['9876543210', '+919876543210', '91 9876543210', '98765-43210'.replace('-', '')])(
    'accepts %s',
    (value) => {
      expect(mobileField.safeParse(value).success).toBe(true);
    },
  );

  it.each(['12345', '5876543210', '98765432101', 'abcdefghij', ''])('rejects %s', (value) => {
    expect(mobileField.safeParse(value).success).toBe(false);
  });
});

describe('normalizeMobile', () => {
  it('produces the +91 form the API expects', () => {
    expect(normalizeMobile('98765 43210')).toBe('+919876543210');
    expect(normalizeMobile('+91 98765 43210')).toBe('+919876543210');
    expect(normalizeMobile('919876543210')).toBe('+919876543210');
  });
});

describe('positiveNumber', () => {
  const schema = positiveNumber('Amount');

  it('converts text to a number', () => {
    expect(schema.parse(' 1800.50 ')).toBe(1800.5);
  });

  it.each(['', '0', '-5', 'abc'])('rejects %s', (value) => {
    expect(schema.safeParse(value).success).toBe(false);
  });
});

describe('wholeNumberInRange', () => {
  const schema = wholeNumberInRange('Seats', 1, 60);

  it('accepts values inside the range', () => {
    expect(schema.parse('4')).toBe(4);
  });

  it.each(['0', '61', '2.5', 'x', ''])('rejects %s', (value) => {
    expect(schema.safeParse(value).success).toBe(false);
  });
});
