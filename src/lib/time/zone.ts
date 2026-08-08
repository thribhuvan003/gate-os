/**
 * Time-of-day helpers that answer "what time is it *for this student*", not
 * "what time is it on the server". On Vercel the server clock is UTC, so
 * deriving the greeting or the day boundary from `new Date()` directly meant
 * an Indian user was told "A quiet night" at 9am and saw their focused-minutes
 * counter reset at 05:30 local.
 */

const PARTS: Intl.DateTimeFormatOptions = {
  hour12: false,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};

/** Milliseconds to add to a UTC instant to get wall-clock time in `timeZone`. */
function zoneOffsetMs(timeZone: string, at: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", { ...PARTS, timeZone }).formatToParts(at);
  const read = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value ?? "0");
  // Intl renders midnight as hour 24 in some locales; normalise it back to 0.
  const asIfUtc = Date.UTC(read("year"), read("month") - 1, read("day"), read("hour") % 24, read("minute"), read("second"));
  return asIfUtc - Math.floor(at.getTime() / 1000) * 1000;
}

/** Hour of day (0–23) in `timeZone`. Falls back to the server hour on a bad zone. */
export function hourIn(timeZone: string, at: Date = new Date()): number {
  try {
    return Math.floor((at.getTime() + zoneOffsetMs(timeZone, at)) / 3_600_000) % 24;
  } catch {
    return at.getUTCHours();
  }
}

/** The instant local midnight began in `timeZone`, as a real UTC Date. */
export function startOfDayIn(timeZone: string, at: Date = new Date()): Date {
  try {
    const offset = zoneOffsetMs(timeZone, at);
    const local = new Date(at.getTime() + offset);
    const midnight = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate());
    return new Date(midnight - offset);
  } catch {
    const fallback = new Date(at);
    fallback.setUTCHours(0, 0, 0, 0);
    return fallback;
  }
}

export function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "A quiet night";
}
