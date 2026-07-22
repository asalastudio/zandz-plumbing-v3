/**
 * Pacific-time helpers.
 *
 * Vercel runs functions in UTC, so any day/week/month math done with the
 * server-local Date methods (setHours, getDay, new Date(y, m, d)) buckets at
 * UTC midnight, not Pacific. For a California business that shifts "today",
 * "this week", and "this month" by the UTC offset and lands jobs on the wrong
 * dispatch day. These helpers anchor all boundaries to America/Los_Angeles
 * without a date library.
 */

export const PACIFIC_TZ = "America/Los_Angeles";

/** Offset (ms) that the Pacific wall clock is ahead of UTC at a given instant. Negative. */
function offsetMs(instant: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: PACIFIC_TZ,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const m: Record<string, number> = {};
  for (const p of dtf.formatToParts(instant)) {
    if (p.type !== "literal") m[p.type] = Number(p.value);
  }
  const asUTC = Date.UTC(m.year, m.month - 1, m.day, m.hour % 24, m.minute, m.second);
  return asUTC - instant.getTime();
}

/** The Pacific calendar Y/M/D for an instant (defaults to now). */
export function pacificYmd(instant: Date = new Date()): {
  year: number;
  month: number;
  day: number;
} {
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone: PACIFIC_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const m: Record<string, string> = {};
  for (const p of dtf.formatToParts(instant)) {
    if (p.type !== "literal") m[p.type] = p.value;
  }
  return { year: Number(m.year), month: Number(m.month), day: Number(m.day) };
}

/** Day of week (0=Sunday..6=Saturday) in Pacific for an instant. */
export function pacificWeekday(instant: Date = new Date()): number {
  const wd = new Intl.DateTimeFormat("en-US", {
    timeZone: PACIFIC_TZ,
    weekday: "short",
  }).format(instant);
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return map[wd] ?? 0;
}

/** Hour of day (0-23) on the Pacific wall clock for an instant. */
export function pacificHour(instant: Date = new Date()): number {
  const h = new Intl.DateTimeFormat("en-US", {
    timeZone: PACIFIC_TZ,
    hour12: false,
    hour: "2-digit",
  }).format(instant);
  return Number(h) % 24;
}

/**
 * The UTC instant of a given Pacific wall-clock time.
 *
 * Don't build these by adding hours onto pacificMidnight — on the two DST
 * transition days a day is 23 or 25 hours long, so midnight + 11h lands at
 * 10am or noon rather than 11am.
 */
export function pacificWallClock(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0
): Date {
  const guessUTC = Date.UTC(year, month - 1, day, hour, minute, 0);
  // Two passes converge even across DST boundaries.
  let result = guessUTC - offsetMs(new Date(guessUTC));
  result = guessUTC - offsetMs(new Date(result));
  return new Date(result);
}

/** The UTC instant of Pacific wall-clock midnight for a given Y/M/D. */
export function pacificMidnight(year: number, month: number, day: number): Date {
  return pacificWallClock(year, month, day, 0, 0);
}

/** Start of the Pacific day containing `instant`. */
export function startOfPacificDay(instant: Date = new Date()): Date {
  const { year, month, day } = pacificYmd(instant);
  return pacificMidnight(year, month, day);
}

/** End of the Pacific day containing `instant` (23:59:59.999). */
export function endOfPacificDay(instant: Date = new Date()): Date {
  const start = startOfPacificDay(instant);
  // Add ~25h then snap to that day's midnight to be DST-safe, minus 1ms.
  const nextDay = startOfPacificDay(new Date(start.getTime() + 25 * 60 * 60 * 1000));
  return new Date(nextDay.getTime() - 1);
}

/** Start of the Pacific week (Sunday) containing `instant`. */
export function startOfPacificWeek(instant: Date = new Date()): Date {
  const { year, month, day } = pacificYmd(instant);
  const dow = pacificWeekday(instant);
  // Do the calendar subtraction on a UTC date (no DST), then map to Pacific midnight.
  const cal = new Date(Date.UTC(year, month - 1, day));
  cal.setUTCDate(cal.getUTCDate() - dow);
  return pacificMidnight(cal.getUTCFullYear(), cal.getUTCMonth() + 1, cal.getUTCDate());
}

/** Start of the Pacific month containing `instant`. */
export function startOfPacificMonth(instant: Date = new Date()): Date {
  const { year, month } = pacificYmd(instant);
  return pacificMidnight(year, month, 1);
}

/** Pacific midnight N months before the Pacific date of `instant` (same day-of-month). */
export function pacificMonthsAgo(months: number, instant: Date = new Date()): Date {
  const { year, month, day } = pacificYmd(instant);
  const cal = new Date(Date.UTC(year, month - 1 - months, day));
  return pacificMidnight(cal.getUTCFullYear(), cal.getUTCMonth() + 1, cal.getUTCDate());
}

// ──────────────────────────────────────────────────────────────────────────
// Business hours
//
// Z and Z staff the office Mon-Fri 7:00am-5:00pm Pacific, and advertise 24/7
// emergency service on top of that. The distinction matters for escalation:
// an emergency call should chase someone at 3am, a routine drain quote should
// not.
// ──────────────────────────────────────────────────────────────────────────

export const BUSINESS_OPEN_HOUR = 7;
export const BUSINESS_CLOSE_HOUR = 17;

/** Is `instant` inside staffed office hours (Mon-Fri 7am-5pm Pacific)? */
export function isBusinessHours(instant: Date = new Date()): boolean {
  const weekday = pacificWeekday(instant);
  if (weekday === 0 || weekday === 6) return false;
  const hour = pacificHour(instant);
  return hour >= BUSINESS_OPEN_HOUR && hour < BUSINESS_CLOSE_HOUR;
}

/** Pacific 7:00am on the calendar day containing `instant`. */
export function businessOpeningFor(instant: Date = new Date()): Date {
  const { year, month, day } = pacificYmd(instant);
  return pacificWallClock(year, month, day, BUSINESS_OPEN_HOUR);
}

/** Parse a "YYYY-MM-DD" string as a Pacific date → its midnight instant. Null if malformed. */
export function pacificDayFromIsoDate(s: string | undefined | null): Date | null {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d || m < 1 || m > 12 || d < 1 || d > 31) return null;
  return pacificMidnight(y, m, d);
}
