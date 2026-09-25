import { DEFAULT_PASSENGERS, initialDraft, toSearchRequest, validateDraft } from './searchDraft';

const place = (id: string) => ({ id, name: id, latitude: 20, longitude: 85 });

describe('searchDraft', () => {
  const today = '2026-09-25';
  const ready = {
    ...initialDraft(new Date(`${today}T10:00:00`)),
    pickup: place('a'),
    destination: place('b'),
  };

  it('starts as a single-day trip today', () => {
    expect(ready.startDate).toBe(ready.endDate);
  });

  it('is ready with just a pickup and a destination', () => {
    expect(validateDraft(ready, today)).toBeNull();
  });

  it('needs a destination and rejects the same place twice', () => {
    expect(validateDraft({ ...ready, destination: null }, today)).toMatch(/where you want to go/);
    expect(validateDraft({ ...ready, destination: place('a') }, today)).toMatch(
      /cannot be the same/,
    );
  });

  it('does not ask the tourist for passengers but still sends the API one', () => {
    expect(toSearchRequest(ready).passengerCount).toBe(DEFAULT_PASSENGERS);
  });
});
