import type { Negotiation } from '@yocabs/api-client';
import { isOpen, nextStep, sortForAttention } from './negotiationProgress';

const negotiation = (id: string, status: Negotiation['status'], createdAt: string): Negotiation =>
  ({
    id,
    status,
    createdAt,
    currency: 'INR',
    partnerName: 'Mahadev',
    offeredAmount: 4000,
    counterAmount: 4200,
  }) as Negotiation;

describe('isOpen', () => {
  it('is true only while somebody still has to answer', () => {
    expect(isOpen(negotiation('a', 'OFFER_SENT', ''))).toBe(true);
    expect(isOpen(negotiation('a', 'COUNTER_SENT', ''))).toBe(true);
    for (const status of [
      'ACCEPTED',
      'REJECTED',
      'COUNTER_ACCEPTED',
      'COUNTER_REJECTED',
      'EXPIRED',
    ] as const) {
      expect(isOpen(negotiation('a', status, ''))).toBe(false);
    }
  });
});

describe('nextStep', () => {
  it('tells the tourist to wait for an offer and to answer a counter', () => {
    expect(nextStep(negotiation('a', 'OFFER_SENT', ''), 'tourist')).toMatchObject({
      needsYou: false,
    });
    const counter = nextStep(negotiation('a', 'COUNTER_SENT', ''), 'tourist');
    expect(counter.needsYou).toBe(true);
    expect(counter.text).toContain('4,200');
  });

  it('tells the partner to answer an offer and to wait after countering', () => {
    expect(nextStep(negotiation('a', 'OFFER_SENT', ''), 'partner').needsYou).toBe(true);
    expect(nextStep(negotiation('a', 'COUNTER_SENT', ''), 'partner').needsYou).toBe(false);
  });
});

describe('sortForAttention', () => {
  const list = [
    negotiation('done', 'ACCEPTED', '2026-09-27T10:00:00Z'),
    negotiation('waiting', 'OFFER_SENT', '2026-09-27T09:00:00Z'),
    negotiation('your-move', 'COUNTER_SENT', '2026-09-27T08:00:00Z'),
    negotiation('older-move', 'COUNTER_SENT', '2026-09-27T07:00:00Z'),
  ];

  it('puts what waits on the tourist first, then what they are waiting on, then finished ones', () => {
    expect(sortForAttention(list, 'tourist').map((n) => n.id)).toEqual([
      'your-move',
      'older-move',
      'waiting',
      'done',
    ]);
  });

  it('sees the same list differently as the partner', () => {
    expect(sortForAttention(list, 'partner').map((n) => n.id)).toEqual([
      'waiting',
      'your-move',
      'older-move',
      'done',
    ]);
  });
});
