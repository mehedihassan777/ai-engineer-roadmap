/**
 * Local calendar dates as 'YYYY-MM-DD' strings.
 *
 * The app never stores or compares UTC timestamps for "today" or streaks - a session logged at 23:50 local time
 * must count for that day. Day arithmetic goes through UTC midnight of the *calendar* date, which has no DST gaps.
 */

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 86_400_000;

const pad = (value: number) => String(value).padStart(2, "0");

/** Formats a Date using its local year, month and day. */
export function toDateString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayString(now: Date = new Date()): string {
  return toDateString(now);
}

function parse(value: string): { year: number; month: number; day: number } | null {
  const match = DATE_PATTERN.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const check = new Date(Date.UTC(year, month - 1, day));
  const valid = check.getUTCFullYear() === year && check.getUTCMonth() === month - 1 && check.getUTCDate() === day;
  return valid ? { year, month, day } : null;
}

export function isValidDateString(value: unknown): value is string {
  return typeof value === "string" && parse(value) !== null;
}

/** Days since the Unix epoch for a calendar date. Throws on an invalid date string. */
function toDayNumber(value: string): number {
  const parts = parse(value);
  if (!parts) throw new Error(`Invalid date "${value}" (expected YYYY-MM-DD)`);
  return Date.UTC(parts.year, parts.month - 1, parts.day) / MS_PER_DAY;
}

/** Whole calendar days from `earlier` to `later` (negative when `later` is before `earlier`). */
export function diffInDays(later: string, earlier: string): number {
  return toDayNumber(later) - toDayNumber(earlier);
}

export function addDays(value: string, days: number): string {
  const date = new Date((toDayNumber(value) + days) * MS_PER_DAY);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "6 Oct 2026" - locale-independent so server and client always render the same text. */
export function formatDate(value: string): string {
  const parts = parse(value);
  if (!parts) return value;
  return `${parts.day} ${MONTHS[parts.month - 1]} ${parts.year}`;
}

/** "6 Oct 2026, 14:05" in the viewer's local time, for an ISO timestamp. */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${formatDate(toDateString(date))}, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** "6 Oct" - for compact week ranges. */
export function formatDayMonth(value: string): string {
  const parts = parse(value);
  if (!parts) return value;
  return `${parts.day} ${MONTHS[parts.month - 1]}`;
}
