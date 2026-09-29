/**
 * How a cab's price compares with the admin-defined YoCabs standard fare for its vehicle type, so
 * a traveller can judge a partner's price against a benchmark rather than only against each other.
 */
export interface StandardComparison {
  tone: 'success' | 'warning' | 'neutral';
  label: string;
}

/** Below the threshold the prices are treated as matching rather than a false "1% above/below". */
const MATCH_THRESHOLD = 0.01;

export function compareToStandard(
  totalAmount: number,
  standardAmount: number | null,
): StandardComparison | null {
  if (standardAmount === null || standardAmount <= 0) return null;

  const diff = (totalAmount - standardAmount) / standardAmount;

  if (Math.abs(diff) < MATCH_THRESHOLD) {
    return { tone: 'neutral', label: 'Matches YoCabs standard fare' };
  }

  const percent = Math.round(Math.abs(diff) * 100);

  return diff < 0
    ? { tone: 'success', label: `${percent}% below YoCabs standard fare` }
    : { tone: 'warning', label: `${percent}% above YoCabs standard fare` };
}
