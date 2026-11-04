import { describe, expect, it } from "vitest";
import { acknowledgeCommittedHandoff, verifiedHandoffReceipt } from "./handoff-commit-receipt";
import type { CaseAuditEnvelope } from "./audit-envelope";
const envelope: CaseAuditEnvelope = {
  eventType: "compliance.bot_escalated", actorType: "bot_service", actorId: "bot-1",
  organizationId: "tenant-1", caseId: "case-1", requestId: "request-1",
  occurredAt: "2026-11-04T09:00:00.000Z", reasonCode: "bot_handoff",
  before: { status: "bot_open", assignedTo: null, version: 3 },
  after: { status: "queued", assignedTo: null, version: 4 }, auditRequired: true
};
const receipt = {
  committed: true, organizationId: "tenant-1", caseId: "case-1",
  requestId: "request-1", eventType: "compliance.bot_escalated",
  beforeVersion: 3, afterVersion: 4, afterStatus: "queued", auditEventId: "audit-1"
};
describe("synthetic-only transactional handoff receipt gate", () => {
  it("acknowledges only an exact correlated commit receipt", async () => {
    expect(verifiedHandoffReceipt(envelope, receipt)).toBe(true);
    expect(await acknowledgeCommittedHandoff(envelope, async () => receipt))
      .toEqual({ acknowledged: true, auditEventId: "audit-1" });
  });
  it("denies absent, mismatched, uncommitted or forged receipts", async () => {
    for (const candidate of [
      null, false, { ...receipt, committed: false },
      { ...receipt, caseId: "other-case" }, { ...receipt, organizationId: "other-tenant" },
      { ...receipt, requestId: "other-request" }, { ...receipt, beforeVersion: 2 },
      { ...receipt, afterVersion: 5 }, { ...receipt, afterStatus: "resolved" },
      { ...receipt, eventType: "compliance.final_reply" },
      { ...receipt, auditEventId: "" }, { ...receipt, clientApproved: true }
    ]) {
      expect(verifiedHandoffReceipt(envelope, candidate)).toBe(false);
      expect(await acknowledgeCommittedHandoff(envelope, async () => candidate))
        .toEqual({ acknowledged: false });
    }
  });
  it("fails closed on transaction rejection", async () => {
    expect(await acknowledgeCommittedHandoff(envelope, async () => { throw Error("synthetic rollback"); }))
      .toEqual({ acknowledged: false });
  });
  it("never acknowledges a staff-attributed or invalid transition envelope", () => {
    expect(verifiedHandoffReceipt({ ...envelope, actorType: "staff" }, receipt)).toBe(false);
    expect(verifiedHandoffReceipt({ ...envelope, after: { ...envelope.after, version: 3 } }, receipt)).toBe(false);
  });
});
