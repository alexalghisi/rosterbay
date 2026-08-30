"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasConflict } from "@/lib/domain";
import { newId } from "@/lib/utils";

export async function addShiftAction(formData: FormData) {
  const user = await requireUser();
  const db = await getDb();
  const personId = String(formData.get("personId") ?? "");
  const start = Date.parse(String(formData.get("start") ?? ""));
  const end = Date.parse(String(formData.get("end") ?? ""));
  const existing = await db.query<{ person_id: string; starts_at: Date; ends_at: Date }>(
    "select person_id, starts_at, ends_at from shifts where organization_id = $1",
    [user.organizationId],
  );
  const conflict = hasConflict(
    { personId, start, end },
    existing.rows.map((row) => ({
      personId: row.person_id,
      start: new Date(row.starts_at).getTime(),
      end: new Date(row.ends_at).getTime(),
    })),
  );
  if (conflict) return;
  await db.query(
    "insert into shifts (id, organization_id, person_id, starts_at, ends_at) values ($1,$2,$3,$4,$5)",
    [newId(), user.organizationId, personId, new Date(start).toISOString(), new Date(end).toISOString()],
  );
  revalidatePath("/app");
}
