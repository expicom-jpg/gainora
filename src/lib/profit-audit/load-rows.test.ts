import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { loadFinancialRows } from "./load-rows";
import { analyzeFinancialRows } from "./analysis";

function fixture(total: number) {
  const data = Array.from({ length: total }, (_, i) => ({
    account: i === total - 1 ? "Salg" : "Omkostning",
    description: "Synthetic regression fixture",
    amount: i === total - 1 ? 5000 : -1,
    transaction_date: "2026-10-01"
  }));
  const query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn(async (from: number, to: number) => ({
      data: data.slice(from, to + 1), count: total, error: null as null | Error
    }))
  };
  const from = vi.fn(() => query);
  return { client: { from } as unknown as SupabaseClient<Database>, query, from };
}

describe("complete audit input", () => {
  it.each([1000, 1001, 2501, 100000])("loads all %i rows without truncating totals", async total => {
    const { client, query } = fixture(total);
    const rows = await loadFinancialRows(client, "tenant-a", "import-a");
    expect(rows).toHaveLength(total);
    expect(analyzeFinancialRows(rows).profit).toBe(5000 - (total - 1));
    expect(query.range).toHaveBeenCalledTimes(Math.ceil(total / 1000));
    for (let page = 0; page < Math.ceil(total / 1000); page++) {
      expect(query.range).toHaveBeenNthCalledWith(page + 1, page * 1000, page * 1000 + 999);
      expect(query.eq).toHaveBeenNthCalledWith(page * 2 + 1, "organization_id", "tenant-a");
      expect(query.eq).toHaveBeenNthCalledWith(page * 2 + 2, "import_id", "import-a");
      expect(query.order).toHaveBeenNthCalledWith(page + 1, "id");
    }
  });

  it("rejects empty or RLS-hidden inputs instead of generating a zero baseline", async () => {
    const { client } = fixture(0);
    await expect(loadFinancialRows(client, "tenant-b", "import-a")).rejects.toThrow("no_rows");
  });

  it("propagates a later page failure instead of returning partial results", async () => {
    const { client, query } = fixture(2501);
    query.range.mockImplementationOnce(async () => ({ data: Array.from({length:1000}, () => ({account:"Salg",description:"",amount:1,transaction_date:"2026-10-01"})), count:2501, error:null }))
      .mockRejectedValueOnce(new Error("database_unavailable"));
    await expect(loadFinancialRows(client, "tenant-a", "import-a")).rejects.toThrow("database_unavailable");
  });

  it("rejects a server page limit smaller than requested", async () => {
    const { client, query } = fixture(1001);
    query.range.mockResolvedValueOnce({ data: [], count: 1001, error: null });
    await expect(loadFinancialRows(client, "tenant-a", "import-a")).rejects.toThrow("audit_rows_incomplete");
  });

  it("rejects input whose count changes between pages", async () => {
    const { client, query } = fixture(1001);
    const normal = query.range.getMockImplementation()!;
    query.range.mockImplementationOnce(normal).mockResolvedValueOnce({ data: [], count: 1000, error: null });
    await expect(loadFinancialRows(client, "tenant-a", "import-a")).rejects.toThrow("audit_rows_changed");
  });

  it("rejects oversized imports before loading all pages", async () => {
    const { client, query } = fixture(100001);
    await expect(loadFinancialRows(client, "tenant-a", "import-a")).rejects.toThrow("import_too_large");
    expect(query.range).toHaveBeenCalledTimes(1);
  });
  it.each([null, "", "not-a-number", "Infinity", "1e9999"])(
    "rejects invalid financial amount %s rather than producing misleading totals",
    async amount => {
      const { client, query } = fixture(1);
      query.range.mockResolvedValueOnce({
        data: [{ account: "Salg", description: "Synthetic invalid input", amount: amount as number, transaction_date: "2026-10-01" }],
        count: 1,
        error: null
      });
      await expect(loadFinancialRows(client, "tenant-a", "import-a")).rejects.toThrow("audit_invalid_amount");
    }
  );

  it("accepts a valid zero amount", async () => {
    const { client, query } = fixture(1);
    query.range.mockResolvedValueOnce({
      data: [{ account: "Salg", description: "Synthetic zero", amount: 0, transaction_date: "2026-10-01" }],
      count: 1,
      error: null
    });
    const rows = await loadFinancialRows(client, "tenant-a", "import-a");
    expect(rows[0].amount).toBe(0);
  });

});
