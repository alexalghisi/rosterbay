import { PGlite } from "@electric-sql/pglite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { SCHEMA_SQL } from "../lib/db/schema-sql";
import { hashPassword } from "../lib/auth/password";

const email = "demo@rosterbay.dev";
const orgId = "org_demo";
const userId = "user_demo";

async function main() {
  mkdirSync(path.join(process.cwd(), ".data"), { recursive: true });
  const db = new PGlite(path.join(process.cwd(), ".data", "pglite"));
  await db.waitReady;
  await db.exec(SCHEMA_SQL);
  const passwordHash = await hashPassword("DemoPass123!");
  await db.query("insert into users (id, email, password_hash) values ($1, $2, $3) on conflict (email) do nothing", [userId, email, passwordHash]);
  await db.query("insert into profiles (user_id, display_name) values ($1, $2) on conflict (user_id) do nothing", [userId, "Alex Demo"]);
  await db.query("insert into organizations (id, name, slug) values ($1, $2, $3) on conflict (id) do nothing", [orgId, "Bay Clinic Front Desk", "rosterbay"]);
  await db.query("insert into organization_members (id, organization_id, user_id, role) values ($1, $2, $3, $4) on conflict do nothing", ["mem_1", orgId, userId, "owner"]);

  await db.query("insert into people (id, organization_id, name) values ($1,$2,$3)", ["p1", orgId, "Rina"]);
  await db.query("insert into people (id, organization_id, name) values ($1,$2,$3)", ["p2", orgId, "Omar"]);
  await db.query("insert into shifts (id, organization_id, person_id, starts_at, ends_at) values ($1,$2,$3,$4,$5)", ["s1", orgId, "p1", "2026-08-30T08:00:00Z", "2026-08-30T16:00:00Z"]);
  await db.query("insert into shifts (id, organization_id, person_id, starts_at, ends_at) values ($1,$2,$3,$4,$5)", ["s2", orgId, "p2", "2026-08-30T12:00:00Z", "2026-08-30T20:00:00Z"]);
  console.log("Seeded RosterBay");
}

main();
