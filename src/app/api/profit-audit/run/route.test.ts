import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ user: vi.fn(), client: vi.fn(), rows: vi.fn() }));
vi.mock("@/lib/auth", () => ({ requireUser: mocks.user }));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: mocks.client }));
vi.mock("@/lib/profit-audit/load-rows", () => ({ loadFinancialRows: mocks.rows }));
import { POST } from "./route";
import { GET } from "../detail/route";

const organizationId = "00000000-0000-4000-8000-000000000001";
const importId = "00000000-0000-4000-8000-000000000002";
const from = vi.fn();
beforeEach(() => {
  vi.resetAllMocks();
  mocks.user.mockResolvedValue({ id: "test-user" });
  mocks.client.mockResolvedValue({ from });
});

describe("audit endpoint input failures", () => {
  it.each([
    ["no_rows", 404], ["import_too_large", 413], ["audit_invalid_amount", 422],
    ["audit_rows_incomplete", 409], ["audit_rows_changed", 409],
    ["database_unavailable", 500]
  ])("both endpoints reject %s without mutating findings", async (message, status) => {
    mocks.rows.mockRejectedValue(new Error(String(message)));
    const run = await POST(new NextRequest("http://localhost/api/profit-audit/run", {
      method: "POST", body: JSON.stringify({ organizationId, importId }),
      headers: { "content-type": "application/json" }
    }));
    const detail = await GET(new NextRequest(`http://localhost/api/profit-audit/detail?organizationId=${organizationId}&importId=${importId}`));
    expect(run.status).toBe(status);
    expect(detail.status).toBe(status);
    expect(from).not.toHaveBeenCalled();
    expect(mocks.rows).toHaveBeenCalledWith({ from }, organizationId, importId);
  });
});
