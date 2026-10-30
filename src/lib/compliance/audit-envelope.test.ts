import { describe, expect, it } from "vitest";
import { prepareCaseAuditEnvelope } from "./audit-envelope";
import {
  decideBotEscalation,
  decideStaffCaseAction,
  type ComplianceCase,
  type StaffGrant
} from "./policy-core";

const grant: StaffGrant = {
  actorId: "staff-a",
  status: "active",
  masterApproved: true,
  grantVersion: 3,
  currentGrantVersion: 3,
  organizationIds: ["org-a"],
  permissions: ["compliance.case.read", "compliance.case.reply", "compliance.case.export"]
};
const queued: ComplianceCase = {
  id: "case-a", organizationId: "org-a", status: "queued", assignedTo: null
};
const assigned: ComplianceCase = { ...queued, status: "assigned", assignedTo: "staff-a" };
const now = "2026-10-30T10:00:00.000Z";
const requestId = "request-0001";

describe("Fail-closed case audit envelope (synthetic-only; no database writes)", () => {
  it("captures staff claim with exact before/after state, actor, version and correlation", () => {
    const decision = decideStaffCaseAction(grant, "staff-a", queued, "claim");
    const result = prepareCaseAuditEnvelope(queued, decision, "staff-a", requestId, now, 4);
    expect(result).toEqual({
      allowed: true,
      envelope: {
        eventType: "compliance.case_claimed",
        actorType: "staff",
        actorId: "staff-a",
        organizationId: "org-a",
        caseId: "case-a",
        requestId,
        occurredAt: now,
        reasonCode: "staff_claim",
        before: { status: "queued", assignedTo: null, version: 4 },
        after: { status: "assigned", assignedTo: "staff-a", version: 5 },
        auditRequired: true
      }
    });
  });

  it("records bot handoff without assigning staff or closing the case", () => {
    const open: ComplianceCase = { ...queued, status: "bot_open" };
    const decision = decideBotEscalation(open, true, "human help requested");
    const result = prepareCaseAuditEnvelope(open, decision, "bot-service", requestId, now, 1);
    expect(result.allowed).toBe(true);
    if (result.allowed) {
      expect(result.envelope.actorType).toBe("bot_service");
      expect(result.envelope.after).toEqual({ status: "queued", assignedTo: null, version: 2 });
      expect(JSON.stringify(result.envelope)).not.toContain("human help requested");
    }
  });

  it("keeps interim replies open but resolves final replies, without storing message text", () => {
    for (const [action, expected] of [
      ["reply_interim", "assigned"],
      ["reply_final", "resolved"]
    ] as const) {
      const decision = decideStaffCaseAction(grant, "staff-a", assigned, action, "Synthetic reply content");
      const result = prepareCaseAuditEnvelope(assigned, decision, "staff-a", requestId, now, 10);
      expect(result.allowed).toBe(true);
      if (result.allowed) {
        expect(result.envelope.after.status).toBe(expected);
        expect(result.envelope.after.version).toBe(11);
        expect(JSON.stringify(result.envelope)).not.toContain("Synthetic reply content");
      }
    }
  });

  it("logs read and export without falsely changing the case version or assignment", () => {
    for (const action of ["read", "export"] as const) {
      const decision = decideStaffCaseAction(grant, "staff-a", assigned, action);
      const result = prepareCaseAuditEnvelope(assigned, decision, "staff-a", requestId, now, 8);
      expect(result.allowed).toBe(true);
      if (result.allowed) expect(result.envelope.after).toEqual(result.envelope.before);
    }
  });

  it("refuses denied, spoofed, unaudited or inconsistent decisions", () => {
    const denied = decideStaffCaseAction({ ...grant, status: "revoked" }, "staff-a", queued, "claim");
    expect(prepareCaseAuditEnvelope(queued, denied, "staff-a", requestId, now, 1).allowed).toBe(false);
    const claimed = decideStaffCaseAction(grant, "staff-a", queued, "claim");
    expect(prepareCaseAuditEnvelope(queued, { ...claimed, auditRequired: false } as never, "staff-a", requestId, now, 1).allowed).toBe(false);
    expect(prepareCaseAuditEnvelope(queued, { allowed: true, eventType: "compliance.final_reply", nextStatus: "resolved", auditRequired: true }, "staff-a", requestId, now, 1).allowed).toBe(false);
    expect(prepareCaseAuditEnvelope(queued, { allowed: true, eventType: "compliance.case_deleted", nextStatus: "queued", auditRequired: true } as never, "staff-a", requestId, now, 1).allowed).toBe(false);
    const crossTenantDecision = decideStaffCaseAction(grant, "staff-a", { ...queued, organizationId: "org-b" }, "claim");
    expect(prepareCaseAuditEnvelope({ ...queued, organizationId: "org-b" }, crossTenantDecision, "staff-a", requestId, now, 1).allowed).toBe(false);
  });

  it("rejects forged reply actor and malformed trusted context", () => {
    const decision = decideStaffCaseAction(grant, "staff-a", assigned, "reply_final", "Done");
    expect(prepareCaseAuditEnvelope(assigned, decision, "staff-b", requestId, now, 2).allowed).toBe(false);
    expect(prepareCaseAuditEnvelope(assigned, decision, "staff-a", "bad\nrequest", now, 2).allowed).toBe(false);
    expect(prepareCaseAuditEnvelope(assigned, decision, "staff-a", requestId, "2026-10-30", 2).allowed).toBe(false);
    expect(prepareCaseAuditEnvelope(assigned, decision, "staff-a", requestId, "2026-02-30T10:00:00.000Z", 2).allowed).toBe(false);
    expect(prepareCaseAuditEnvelope(assigned, decision, "staff-a", requestId, now, 0).allowed).toBe(false);
    expect(prepareCaseAuditEnvelope(assigned, decision, "staff-a", requestId, now, Number.MAX_SAFE_INTEGER).allowed).toBe(false);
    expect(prepareCaseAuditEnvelope({ ...assigned, id: "bad\ncase" }, decision, "staff-a", requestId, now, 2).allowed).toBe(false);
  });
});
