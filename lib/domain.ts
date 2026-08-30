export type Interval = { personId: string; start: number; end: number };

export function overlaps(a: Interval, b: Interval): boolean {
  return a.personId === b.personId && a.start < b.end && b.start < a.end;
}

export function hasConflict(candidate: Interval, existing: Interval[]): boolean {
  return existing.some((row) => overlaps(candidate, row));
}

export function coverageGaps(
  shifts: { start: number; end: number }[],
  floor: number,
  rangeStart: number,
  hours: number,
): number[] {
  const gaps: number[] = [];
  for (let hour = 0; hour < hours; hour += 1) {
    const t = rangeStart + hour * 3_600_000;
    const tEnd = t + 3_600_000;
    const count = shifts.filter((shift) => shift.start < tEnd && t < shift.end).length;
    if (count < floor) gaps.push(hour);
  }
  return gaps;
}
