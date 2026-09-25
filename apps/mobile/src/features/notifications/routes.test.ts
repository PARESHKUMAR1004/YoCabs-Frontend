import type { AppNotification } from '@yocabs/api-client';
import { notificationRoute } from './routes';

const note = (referenceType: string | null, referenceId: string | null) =>
  ({ referenceType, referenceId }) as AppNotification;

describe('notificationRoute', () => {
  it('opens a booking in the right area for each role', () => {
    expect(notificationRoute('tourist', note('BOOKING', 'b1'))).toBe('/(tourist)/booking/b1');
    expect(notificationRoute('partner', note('BOOKING', 'b1'))).toBe('/(partner)/booking/b1');
    expect(notificationRoute('driver', note('BOOKING', 'b1'))).toBe('/(driver)/trip/b1');
  });

  it('opens negotiations for tourists and partners only', () => {
    expect(notificationRoute('tourist', note('NEGOTIATION', 'n1'))).toBe(
      '/(tourist)/negotiation/n1',
    );
    expect(notificationRoute('partner', note('NEGOTIATION', 'n1'))).toBe(
      '/(partner)/negotiation/n1',
    );
    expect(notificationRoute('driver', note('NEGOTIATION', 'n1'))).toBeNull();
  });

  it('returns null when there is nothing to open', () => {
    expect(notificationRoute('tourist', note(null, null))).toBeNull();
    expect(notificationRoute('tourist', note('UNKNOWN', 'x'))).toBeNull();
  });
});
