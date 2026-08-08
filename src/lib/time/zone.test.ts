import { describe, expect, it } from "vitest";

import { greetingForHour, hourIn, startOfDayIn } from "./zone";

// 2026-08-08T03:30:00Z is 09:00 on 2026-08-08 in Asia/Kolkata (UTC+5:30).
const MORNING_IN_INDIA = new Date("2026-08-08T03:30:00.000Z");

describe("hourIn", () => {
  it("reports the student's local hour, not the server's UTC hour", () => {
    expect(MORNING_IN_INDIA.getUTCHours()).toBe(3);
    expect(hourIn("Asia/Kolkata", MORNING_IN_INDIA)).toBe(9);
  });

  it("handles a half-hour offset zone and a whole-hour one", () => {
    expect(hourIn("Asia/Kolkata", new Date("2026-08-08T18:45:00.000Z"))).toBe(0);
    expect(hourIn("UTC", MORNING_IN_INDIA)).toBe(3);
  });

  it("falls back to the UTC hour rather than throwing on a bad zone", () => {
    expect(hourIn("Not/AZone", MORNING_IN_INDIA)).toBe(3);
  });
});

describe("startOfDayIn", () => {
  it("returns the instant local midnight began, not UTC midnight", () => {
    // Local midnight in Kolkata on 2026-08-08 is 2026-08-07T18:30:00Z.
    expect(startOfDayIn("Asia/Kolkata", MORNING_IN_INDIA).toISOString()).toBe("2026-08-07T18:30:00.000Z");
  });

  it("matches UTC midnight when the zone is UTC", () => {
    expect(startOfDayIn("UTC", MORNING_IN_INDIA).toISOString()).toBe("2026-08-08T00:00:00.000Z");
  });

  it("puts an early-morning IST instant after the day boundary", () => {
    // 06:00 IST — previously counted as "yesterday" because UTC was still 00:30.
    const at = new Date("2026-08-08T00:30:00.000Z");
    expect(startOfDayIn("Asia/Kolkata", at).getTime()).toBeLessThan(at.getTime());
  });
});

describe("greetingForHour", () => {
  it("maps the day into four bands", () => {
    expect(greetingForHour(9)).toBe("Good morning");
    expect(greetingForHour(14)).toBe("Good afternoon");
    expect(greetingForHour(19)).toBe("Good evening");
    expect(greetingForHour(23)).toBe("A quiet night");
  });
});
