// The API sends and stores money as whole minor units (fils for AED) so sums never drift.
// These helpers are the only place the client converts to and from that representation.

const MINOR_UNITS_PER_MAJOR = 100;

/** Matches what a money input accepts: digits with up to two decimals. */
export const MONEY_INPUT_PATTERN = /^\d{1,9}(\.\d{1,2})?$/;

/** "1999.5" -> 199950. Expects a string that already matches MONEY_INPUT_PATTERN. */
export function toMinorUnits(value: string): number {
  return Math.round(Number(value) * MINOR_UNITS_PER_MAJOR);
}

/** 199950 -> "1999.50", for pre-filling a form input. */
export function toMoneyInput(minorUnits: number): string {
  return (minorUnits / MINOR_UNITS_PER_MAJOR).toFixed(2);
}

/** 199950 -> "1,999.50", for display. */
export function formatMoney(minorUnits: number): string {
  return (minorUnits / MINOR_UNITS_PER_MAJOR).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
