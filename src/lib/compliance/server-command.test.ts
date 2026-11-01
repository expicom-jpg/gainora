import { describe, expect, it } from "vitest";
import { parseComplianceCaseCommand } from "./server-command";
const org = "11111111-1111-4111-8111-111111111111";
const caseId = "22222222-2222-4222-8222-222222222222";
describe("Compliance server request boundary (synthetic only)", () => {
  it("accepts a minimal read command", () => {
    expect(parseComplianceCaseCommand({ kind: "case.read", organizationId: org, caseId }))
      .toEqual({ kind: "case.read", organizationId: org, caseId });
  });
  it("keeps interim and final replies distinct", () => {
    for (const kind of ["case.interim_reply", "case.final_reply"] as const)
      expect(parseComplianceCaseCommand({ kind, organizationId: org, caseId, message: "Synthetic reply" })?.kind).toBe(kind);
  });
  it("rejects client-provided authorization and status fields", () => {
    for (const extra of [{ userId: org }, { masterApproved: true }, { permissions: ["compliance.case.reply"] }, { status: "closed" }, { grantVersion: 1 }])
      expect(parseComplianceCaseCommand({ kind: "case.read", organizationId: org, caseId, ...extra })).toBeNull();
  });
  it("rejects malformed, empty, oversized and read-message requests", () => {
    const base = { kind: "case.final_reply", organizationId: org, caseId };
    for (const message of ["", "   ", "x".repeat(10001), "hello\u0000world", false, null])
      expect(parseComplianceCaseCommand({ ...base, message })).toBeNull();
    expect(parseComplianceCaseCommand({ kind: "case.read", organizationId: org, caseId, message: "unexpected" })).toBeNull();
    expect(parseComplianceCaseCommand({ ...base, message: "ok", organizationId: "wrong" })).toBeNull();
    expect(parseComplianceCaseCommand(null)).toBeNull();
    expect(parseComplianceCaseCommand([])).toBeNull();
  });
});
