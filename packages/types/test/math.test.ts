import { describe, expect, it } from "vitest";
import {
  civilFromDays,
  daysFromCivil,
  parseIsoDate,
  weekdayMonday0,
} from "../_paint/date.js";
import { boxStats, quantile } from "../_paint/stats.js";

describe("quantile (type 7)", () => {
  it("matches numpy.percentile defaults", () => {
    const s = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(quantile(s, 0.25)).toBeCloseTo(3.25, 10);
    expect(quantile(s, 0.5)).toBeCloseTo(5.5, 10);
    expect(quantile(s, 0.75)).toBeCloseTo(7.75, 10);
    expect(quantile([7], 0.25)).toBe(7);
    expect(quantile([2, 4], 0.5)).toBe(3);
  });
});

describe("boxStats", () => {
  it("puts whiskers on the furthest points inside 1.5 × IQR", () => {
    const box = boxStats([12, 15, 14, 13, 16, 15, 14, 40, 2])!;
    expect(box.q1).toBe(13);
    expect(box.median).toBe(14);
    expect(box.q3).toBe(15);
    expect(box.whiskerLo).toBe(12);
    expect(box.whiskerHi).toBe(16);
    expect(box.outliers).toEqual([2, 40]);
    expect(box.n).toBe(9);
  });

  it("returns null for no finite values", () => {
    expect(boxStats([])).toBeNull();
    expect(boxStats([Number.NaN])).toBeNull();
  });
});

describe("calendar math", () => {
  it("parses only real ISO dates", () => {
    expect(parseIsoDate("2026-10-06")).toEqual({ year: 2026, month: 10, day: 6 });
    expect(parseIsoDate("2024-02-29")).not.toBeNull();
    expect(parseIsoDate("2026-02-29")).toBeNull();
    expect(parseIsoDate("2100-02-29")).toBeNull();
    expect(parseIsoDate("2000-02-29")).not.toBeNull();
    expect(parseIsoDate("2026-13-01")).toBeNull();
    expect(parseIsoDate("2026-4-1")).toBeNull();
    expect(parseIsoDate("04/01/2026")).toBeNull();
  });

  it("counts days from 1970-01-01 and back", () => {
    expect(daysFromCivil({ year: 1970, month: 1, day: 1 })).toBe(0);
    expect(daysFromCivil({ year: 1969, month: 12, day: 31 })).toBe(-1);
    expect(daysFromCivil({ year: 2000, month: 3, day: 1 })).toBe(11017);
    for (const days of [-1000, -1, 0, 59, 11016, 11017, 20000, 47541]) {
      expect(daysFromCivil(civilFromDays(days))).toBe(days);
    }
  });

  it("knows the weekday, Monday first", () => {
    const day = (s: string) => daysFromCivil(parseIsoDate(s)!);
    expect(weekdayMonday0(day("1970-01-01"))).toBe(3);
    expect(weekdayMonday0(day("2026-10-05"))).toBe(0);
    expect(weekdayMonday0(day("2026-10-11"))).toBe(6);
    expect(weekdayMonday0(day("1969-12-29"))).toBe(0);
    expect(weekdayMonday0(day("2100-01-01"))).toBe(4);
  });
});
