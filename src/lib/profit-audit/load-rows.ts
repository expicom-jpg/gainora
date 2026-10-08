import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import type { FinancialRow } from "./types";

const PAGE_SIZE = 1000;
const MAX_ROWS = 100000;

/** Read the same complete, tenant-scoped input for both audit views.
 * Counts detect truncated responses; failures must never produce partial totals.
 * This is not a database snapshot: imports must remain immutable during analysis.
 */
export async function loadFinancialRows(
  supabase: SupabaseClient<Database>,
  organizationId: string,
  importId: string
): Promise<FinancialRow[]> {
  const rows: FinancialRow[] = [];
  let expectedCount: number | undefined;

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error, count } = await supabase
      .from("financial_rows")
      .select("account,description,amount,transaction_date", { count: "exact" })
      .eq("organization_id", organizationId)
      .eq("import_id", importId)
      .order("id")
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) throw error;
    if (count == null || !Number.isSafeInteger(count) || count < 0) {
      throw new Error("audit_rows_incomplete");
    }
    if (count > MAX_ROWS) throw new Error("import_too_large");
    if (count === 0 && offset === 0) throw new Error("no_rows");
    if (expectedCount !== undefined && count !== expectedCount) {
      throw new Error("audit_rows_changed");
    }
    expectedCount = count;
    if (!data || data.length !== Math.min(PAGE_SIZE, count - offset)) {
      throw new Error("audit_rows_incomplete");
    }

    const normalized = data.map(row => {
      const amount = Number(row.amount);
      if (row.amount == null || !Number.isFinite(amount)) {
        throw new Error("audit_invalid_amount");
      }
      return {
        account: String(row.account),
        description: String(row.description ?? ""),
        amount,
        transactionDate: row.transaction_date
      };
    });
    rows.push(...normalized);
    if (rows.length === expectedCount) return rows;
  }
}
