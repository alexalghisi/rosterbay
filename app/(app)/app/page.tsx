import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { coverageGaps } from "@/lib/domain";
import { addShiftAction } from "@/features/work/actions";
import { Button } from "@/components/ui/button";

export default async function RosterPage() {
  const user = await requireUser();
  const db = await getDb();
  const people = await db.query<{ id: string; name: string }>(
    "select id, name from people where organization_id = $1",
    [user.organizationId],
  );
  const shifts = await db.query<{ id: string; person_id: string; starts_at: Date; ends_at: Date; name: string }>(
    `select s.id, s.person_id, s.starts_at, s.ends_at, p.name
       from shifts s join people p on p.id = s.person_id
      where s.organization_id = $1 order by s.starts_at`,
    [user.organizationId],
  );
  const rangeStart = Date.parse("2026-08-30T08:00:00Z");
  const gaps = coverageGaps(
    shifts.rows.map((row) => ({ start: new Date(row.starts_at).getTime(), end: new Date(row.ends_at).getTime() })),
    1,
    rangeStart,
    10,
  );
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Roster</h1>
      <p className="text-sm text-muted-foreground">Coverage floor is 1 person. Gaps (hours from 08:00 UTC): {gaps.length ? gaps.join(", ") : "none"}.</p>
      <ul className="space-y-2 text-sm">
        {shifts.rows.map((row) => (
          <li key={row.id} className="rounded-xl border border-border bg-card p-3">
            {row.name}: {new Date(row.starts_at).toISOString()} → {new Date(row.ends_at).toISOString()}
          </li>
        ))}
      </ul>
      <form action={addShiftAction} className="max-w-md space-y-3">
        <select name="personId" className="flex h-9 w-full rounded-md border border-input bg-card px-3 text-sm">
          {people.rows.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
        </select>
        <input type="datetime-local" name="start" required className="flex h-9 w-full rounded-md border border-input bg-card px-3 text-sm" />
        <input type="datetime-local" name="end" required className="flex h-9 w-full rounded-md border border-input bg-card px-3 text-sm" />
        <Button type="submit">Add shift</Button>
      </form>
    </div>
  );
}
