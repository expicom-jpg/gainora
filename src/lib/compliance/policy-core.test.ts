import { describe, expect, it } from "vitest";
import {
  decideBotEscalation,
  decideKnowledgeApproval,
  decideKnowledgePublication,
  decideStaffCaseAction,
  hasCurrentComplianceGrant,
  type ComplianceCase,
  type StaffGrant
} from "./policy-core";

const staff: StaffGrant = {
  actorId: "staff-a",
  status: "active",
  masterApproved: true,
  grantVersion: 4,
  currentGrantVersion: 4,
  organizationIds: ["org-a"],
  permissions: [
    "compliance.case.read",
    "compliance.case.reply",
    "compliance.case.export",
    "compliance.knowledge.approve"
  ]
};
const queued: ComplianceCase = {
  id: "case-a", organizationId: "org-a", status: "queued", assignedTo: null
};
const assigned: ComplianceCase = { ...queued, status: "assigned", assignedTo: "staff-a" };

describe("Master-approved compliance access: default deny", () => {
  it("requires authenticated actor, active Master-approved staff and current grant", () => {
    expect(hasCurrentComplianceGrant(staff, "staff-a", "org-a", ["compliance.case.read"])).toBe(true);
    expect(hasCurrentComplianceGrant(null, "staff-a", "org-a", ["compliance.case.read"])).toBe(false);
    expect(hasCurrentComplianceGrant(staff, "staff-a", "org-a", [])).toBe(false);
    expect(hasCurrentComplianceGrant(staff, "staff-b", "org-a", ["compliance.case.read"])).toBe(false);
    expect(hasCurrentComplianceGrant({ ...staff, status: "suspended" }, "staff-a", "org-a", ["compliance.case.read"])).toBe(false);
    expect(hasCurrentComplianceGrant({ ...staff, status: "pending_master_approval" }, "staff-a", "org-a", ["compliance.case.read"])).toBe(false);
    expect(hasCurrentComplianceGrant({ ...staff, masterApproved: false }, "staff-a", "org-a", ["compliance.case.read"])).toBe(false);
    expect(hasCurrentComplianceGrant({ ...staff, currentGrantVersion: 5 }, "staff-a", "org-a", ["compliance.case.read"])).toBe(false);
  });

  it("does not infer compliance rights from a login or partner membership", () => {
    const noCompliance: StaffGrant = { ...staff, permissions: [] };
    expect(decideStaffCaseAction(noCompliance, "staff-a", queued, "read")).toEqual({
      allowed: false, reason: "compliance_access_denied"
    });
  });

  it("denies cross-organization reads, replies and exports", () => {
    for (const action of ["read", "claim", "export"] as const) {
      expect(decideStaffCaseAction(staff, "staff-a", { ...queued, organizationId: "org-b" }, action).allowed).toBe(false);
    }
  });

  it("requires explicit export permission separate from read/reply", () => {
    const noExport: StaffGrant = { ...staff, permissions: ["compliance.case.read", "compliance.case.reply"] };
    expect(decideStaffCaseAction(noExport, "staff-a", queued, "read").allowed).toBe(true);
    expect(decideStaffCaseAction(noExport, "staff-a", queued, "export").allowed).toBe(false);
  });

  it("rejects invalid case states even for authorized staff", () => {
    expect(decideStaffCaseAction(staff, "staff-a", { ...queued, status: "unknown" as never }, "read")).toEqual({
      allowed: false, reason: "invalid_case"
    });
  });

  it("denies unexpected actions at runtime", () => {
    expect(decideStaffCaseAction(staff, "staff-a", queued, "delete" as never)).toEqual({
      allowed: false, reason: "unknown_action"
    });
  });
});

describe("Escalation and reply state machine", () => {
  it("allows only a verified bot to enqueue an unassigned open case with reason", () => {
    const botOpen: ComplianceCase = { ...queued, status: "bot_open" };
    expect(decideBotEscalation(botOpen, false, "needs staff").allowed).toBe(false);
    expect(decideBotEscalation(botOpen, true, " ").allowed).toBe(false);
    expect(decideBotEscalation(queued, true, "needs staff").allowed).toBe(false);
    expect(decideBotEscalation(botOpen, true, "needs staff")).toEqual({
      allowed: true, eventType: "compliance.bot_escalated", nextStatus: "queued", auditRequired: true
    });
  });

  it("claims only an unassigned queued case and requires an audit event", () => {
    expect(decideStaffCaseAction(staff, "staff-a", queued, "claim")).toEqual({
      allowed: true, eventType: "compliance.case_claimed", nextStatus: "assigned", auditRequired: true
    });
    expect(decideStaffCaseAction(staff, "staff-a", assigned, "claim").allowed).toBe(false);
    expect(decideStaffCaseAction(staff, "staff-a", { ...queued, assignedTo: "staff-b" }, "claim").allowed).toBe(false);
  });

  it("distinguishes interim reply from final resolution and prevents other staff replying", () => {
    expect(decideStaffCaseAction(staff, "staff-a", assigned, "reply_interim")).toEqual({
      allowed: true, eventType: "compliance.interim_reply", nextStatus: "assigned", auditRequired: true
    });
    expect(decideStaffCaseAction(staff, "staff-a", assigned, "reply_final")).toEqual({
      allowed: true, eventType: "compliance.final_reply", nextStatus: "resolved", auditRequired: true
    });
    expect(decideStaffCaseAction(staff, "staff-a", { ...assigned, assignedTo: "staff-b" }, "reply_final").allowed).toBe(false);
    expect(decideStaffCaseAction(staff, "staff-a", { ...assigned, status: "resolved" }, "reply_interim").allowed).toBe(false);
  });
});

describe("Separate human knowledge approval", () => {
  const proposal = { id: "suggestion-a", organizationId: "org-a", proposedBy: "staff-b", status: "pending_review" as const };

  it("requires Master-approved knowledge permission and independent human approval", () => {
    expect(decideKnowledgeApproval(staff, "staff-a", proposal, "Reviewed and verified")).toEqual({
      allowed: true,
      nextStatus: "approved_for_publication",
      eventType: "compliance.knowledge_approved",
      auditRequired: true
    });
    expect(decideKnowledgeApproval(staff, "staff-a", { ...proposal, proposedBy: "staff-a" }, "ok").allowed).toBe(false);
    expect(decideKnowledgeApproval({ ...staff, permissions: ["compliance.case.read"] }, "staff-a", proposal, "ok").allowed).toBe(false);
    expect(decideKnowledgeApproval(staff, "staff-a", { ...proposal, organizationId: "org-b" }, "ok").allowed).toBe(false);
    expect(decideKnowledgeApproval(staff, "staff-a", proposal, " ").allowed).toBe(false);
    expect(decideKnowledgeApproval(staff, "staff-a", { ...proposal, status: "approved_for_publication" }, "ok").allowed).toBe(false);
  });
});

describe("Separate publication gate: synthetic approved revisions only", () => {
  const publisher: StaffGrant = {
    ...staff,
    permissions: ["compliance.knowledge.publish"]
  };
  const approved = {
    id: "suggestion-a",
    organizationId: "org-a",
    proposedBy: "staff-b",
    approvedBy: "staff-c",
    status: "approved_for_publication" as const,
    revision: 7,
    approvedRevision: 7,
    contentDigest: "synthetic-digest-v7",
    approvedContentDigest: "synthetic-digest-v7"
  };

  it("permits publication only after independent review of the exact revision", () => {
    expect(decideKnowledgePublication(publisher, "staff-a", approved, "Ready for publication")).toEqual({
      allowed: true,
      nextStatus: "published",
      eventType: "compliance.knowledge_published",
      auditRequired: true
    });
  });

  it("denies unreviewed, rejected, already published and modified revisions", () => {
    for (const status of ["pending_review", "rejected", "published"] as const)
      expect(decideKnowledgePublication(publisher, "staff-a", { ...approved, status }, "ok").allowed).toBe(false);
    expect(decideKnowledgePublication(publisher, "staff-a", { ...approved, revision: 8 }, "ok").allowed).toBe(false);
    expect(decideKnowledgePublication(publisher, "staff-a", { ...approved, contentDigest: "changed" }, "ok").allowed).toBe(false);
    expect(decideKnowledgePublication(publisher, "staff-a", { ...approved, revision: 0, approvedRevision: 0 }, "ok").allowed).toBe(false);
    expect(decideKnowledgePublication(publisher, "staff-a", { ...approved, contentDigest: "", approvedContentDigest: "" }, "ok").allowed).toBe(false);
  });

  it("requires a different human reviewer and denies self-publishing proposals", () => {
    expect(decideKnowledgePublication(publisher, "staff-a", { ...approved, approvedBy: "staff-b" }, "ok").allowed).toBe(false);
    expect(decideKnowledgePublication(publisher, "staff-a", { ...approved, proposedBy: "staff-a" }, "ok").allowed).toBe(false);
    expect(decideKnowledgePublication(publisher, "staff-a", { ...approved, approvedBy: null }, "ok").allowed).toBe(false);
  });

  it("denies wrong tenant, revoked or stale grant, and missing explicit publish permission", () => {
    expect(decideKnowledgePublication(publisher, "staff-a", { ...approved, organizationId: "org-b" }, "ok").allowed).toBe(false);
    expect(decideKnowledgePublication({ ...publisher, status: "revoked" }, "staff-a", approved, "ok").allowed).toBe(false);
    expect(decideKnowledgePublication({ ...publisher, currentGrantVersion: 5 }, "staff-a", approved, "ok").allowed).toBe(false);
    expect(decideKnowledgePublication(staff, "staff-a", approved, "ok").allowed).toBe(false);
    expect(decideKnowledgePublication(publisher, "staff-z", approved, "ok").allowed).toBe(false);
    expect(decideKnowledgePublication(publisher, "staff-a", approved, " ").allowed).toBe(false);
  });
});

describe("Runtime trust boundary hardening (synthetic malformed inputs)", () => {
  it("fails closed for malformed identity, permission list and case assignment", () => {
    expect(hasCurrentComplianceGrant(staff, 42 as never, "org-a", ["compliance.case.read"])).toBe(false);
    expect(hasCurrentComplianceGrant(staff, "staff-a", "org-a", null as never)).toBe(false);
    expect(hasCurrentComplianceGrant(staff, "staff-a", "org-a", "compliance.case.read" as never)).toBe(false);
    expect(hasCurrentComplianceGrant({ ...staff, permissions: null as never }, "staff-a", "org-a", ["compliance.case.read"])).toBe(false);
    expect(decideStaffCaseAction(staff, "staff-a", { ...queued, id: 42 as never }, "read")).toEqual({
      allowed: false, reason: "invalid_case"
    });
    expect(decideStaffCaseAction(staff, "staff-a", { ...queued, assignedTo: undefined as never }, "read").allowed).toBe(false);
    expect(decideStaffCaseAction(staff, "staff-a", { ...assigned, assignedTo: "" }, "reply_final").allowed).toBe(false);
    expect(decideStaffCaseAction(staff, "staff-a", { ...queued, assignedTo: "staff-a" }, "read").allowed).toBe(false);
  });

  it("does not treat truthy strings or objects as verified bot service identity", () => {
    const botOpen: ComplianceCase = { ...queued, status: "bot_open" };
    expect(decideBotEscalation(botOpen, "false" as never, "needs staff")).toEqual({
      allowed: false, reason: "verified_bot_service_required"
    });
    expect(decideBotEscalation(botOpen, {} as never, "needs staff").allowed).toBe(false);
    expect(decideBotEscalation(botOpen, true, { trim: 1 } as never)).toEqual({
      allowed: false, reason: "escalation_reason_required"
    });
    expect(decideBotEscalation({ ...botOpen, organizationId: 7 as never }, true, "needs staff").allowed).toBe(false);
  });

  it("rejects malformed knowledge proposals and non-string review reasons", () => {
    const proposal = { id: "synthetic-proposal", organizationId: "org-a", proposedBy: "staff-b", status: "pending_review" as const };
    expect(decideKnowledgeApproval(staff, "staff-a", { ...proposal, proposedBy: 4 as never }, "reviewed")).toEqual({
      allowed: false, reason: "invalid_proposal"
    });
    expect(decideKnowledgeApproval(staff, "staff-a", proposal, { trim: 1 } as never)).toEqual({
      allowed: false, reason: "approval_reason_required"
    });
  });
});
