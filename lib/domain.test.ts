import { describe, expect, it } from "vitest";
import { coverageGaps, hasConflict } from "./domain";

describe("hasConflict", () => {
  it("flags overlap for the same person", () => {
    expect(
      hasConflict({ personId: "a", start: 10, end: 20 }, [{ personId: "a", start: 15, end: 25 }]),
    ).toBe(true);
    expect(
      hasConflict({ personId: "a", start: 10, end: 20 }, [{ personId: "b", start: 15, end: 25 }]),
    ).toBe(false);
  });
});

describe("coverageGaps", () => {
  it("reports an empty hour", () => {
    const start = Date.parse("2026-08-30T08:00:00Z");
    expect(coverageGaps([], 1, start, 2)).toEqual([0, 1]);
  });
});
