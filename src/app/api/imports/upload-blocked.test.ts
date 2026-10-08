import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ user: vi.fn() }));
vi.mock("@/lib/auth", () => ({ requireUser: mocks.user }));
import { POST as preview } from "./preview/route";
import { POST as commit } from "./commit/route";
import { POST as validate } from "./validate/route";
import { POST as map } from "./map/route";

beforeEach(() => { vi.clearAllMocks(); mocks.user.mockResolvedValue({ id: "user" }); });
it.each([preview, commit, validate, map])("blocks input before parsing, even with synthetic:true", async handler => {
  const request = { json: vi.fn(() => { throw new Error("body must not be parsed"); }),
    formData: vi.fn(() => { throw new Error("file must not be parsed"); }), synthetic: true };
  const response = await (handler as (request: unknown) => ReturnType<typeof handler>)(request);
  expect(response.status).toBe(403);
  expect(await response.json()).toMatchObject({ error: "file_import_disabled" });
  expect(request.json).not.toHaveBeenCalled();
  expect(request.formData).not.toHaveBeenCalled();
});
it("retains unauthenticated rejection", async () => {
  mocks.user.mockRejectedValue(new Error("UNAUTHENTICATED"));
  expect((await commit()).status).toBe(401);
});
