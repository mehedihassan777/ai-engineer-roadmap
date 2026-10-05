/** "6.75 h", "1.5 h", "15 h" - never more than two decimals. */
export function formatHours(hours: number): string {
  return `${Number(hours.toFixed(2))} h`;
}

/** Whole-number percentage, e.g. 41.6 -> "42%". */
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function plural(count: number, one: string, many: string = `${one}s`): string {
  return count === 1 ? one : many;
}
