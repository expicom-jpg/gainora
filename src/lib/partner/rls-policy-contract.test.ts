import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Static guard only: these checks do not replace a live PostgreSQL/RLS integration test.
const sql = readFileSync(join(process.cwd(), "supabase/partner-hub-migration-review.sql"), "utf8");

function policy(name: string): string {
  const marker = `create policy ${name} `;
  const start = sql.indexOf(marker);
  if (start < 0) throw new Error(`Missing RLS policy: ${name}`);
  const end = sql.indexOf(";", start);
  return sql.slice(start, end + 1);
}

describe("partner suspension RLS contract (static)", () => {
  it.each([
    "partner_own_read",
    "partner_agents_own_read",
    "partner_leads_own_read",
    "partner_ledger_own_read",
    "partner_payouts_own_read",
    "partner_leads_self_insert",
    "partner_leads_status_update",
  ])("%s requires active partner", (name) => {
    expect(policy(name)).toContain("status='active'");
  });

  it("checks both old and new rows when updating a lead", () => {
    const update = policy("partner_leads_status_update");
    expect(update).toContain("using (");
    expect(update).toContain("with check (");
    expect(update.match(/status='active'/g)).toHaveLength(2);
  });

  it("keeps membership self-read independent of partners to avoid circular RLS", () => {
    expect(policy("partner_members_own_read")).not.toContain("from public.partners");
  });

  it("does not expose financial records via a partner's read policy", () => {
    for (const name of ["partner_ledger_own_read", "partner_payouts_own_read"]) {
      expect(policy(name)).toContain("m.user_id=(select auth.uid())");
    }
  });
});
