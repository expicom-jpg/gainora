import { beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const mocks = vi.hoisted(() => ({ user: vi.fn(), client: vi.fn(), rpc: vi.fn() }));
vi.mock("@/lib/auth", () => ({ requireUser: mocks.user }));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: mocks.client }));
import { POST } from "./route";
const organizationId = "00000000-0000-4000-8000-000000000001";
const request = (body: unknown) => new NextRequest("http://localhost/api/imports/demo", {
  method: "POST", body: JSON.stringify(body)
});
beforeEach(() => {
  vi.clearAllMocks(); mocks.user.mockResolvedValue({ id: "user" });
  mocks.client.mockResolvedValue({ rpc: mocks.rpc });
  mocks.rpc.mockResolvedValue({ data: "demo-import", error: null });
});
it("passes only the tenant to the fixed database fixture", async () => {
  const response = await POST(request({ organizationId }));
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ importId: "demo-import", synthetic: true, rowsCommitted: 8 });
  expect(mocks.rpc).toHaveBeenCalledExactlyOnceWith("create_demo_import", { target_org: organizationId });
});
it.each([{ rows: [{ amount: 1 }] }, { synthetic: true }, { filename: "customer.csv" }])("rejects extra financial input %j", async extra => {
  expect((await POST(request({ organizationId, ...extra }))).status).toBe(400);
  expect(mocks.rpc).not.toHaveBeenCalled();
});
it.each([["42501",403],["XX000",500]])("maps database error %s", async (code, status) => {
  mocks.rpc.mockResolvedValue({ data: null, error: { code } });
  expect((await POST(request({ organizationId }))).status).toBe(status);
});
it("rejects malformed JSON", async () => {
  expect((await POST(new NextRequest("http://localhost/api/imports/demo", { method: "POST", body: "{" }))).status).toBe(400);
  expect(mocks.rpc).not.toHaveBeenCalled();
});
it("requires login before reading a payload", async () => {
  mocks.user.mockRejectedValue(new Error("UNAUTHENTICATED"));
  expect((await POST(request({ organizationId }))).status).toBe(401);
  expect(mocks.client).not.toHaveBeenCalled();
});
