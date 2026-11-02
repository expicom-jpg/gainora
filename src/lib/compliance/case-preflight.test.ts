import { describe, expect, it } from "vitest";
import {
  prepareComplianceCasePreflight,
  type TrustedCasePreflightDependencies
} from "./case-preflight";
import type { StaffGrant } from "./policy-core";

const actor = "11111111-1111-4111-8111-111111111111";
const org = "22222222-2222-4222-8222-222222222222";
const caseId = "33333333-3333-4333-8333-333333333333";
const otherOrg = "44444444-4444-4444-8444-444444444444";
const otherCase = "55555555-5555-4555-8555-555555555555";

const grant: StaffGrant = {
  actorId: actor,
  status: "active",
  masterApproved: true,
  grantVersion: 3,
  currentGrantVersion: 3,
  organizationIds: [org],
  permissions: ["compliance.case.read", "compliance.case.reply"]
};
const read = { kind: "case.read", organizationId: org, caseId };
const interim = { kind: "case.interim_reply", organizationId: org, caseId, message: "Synthetic update" };
const finalReply = { kind: "case.final_reply", organizationId: org, caseId, message: "Synthetic resolution" };

function deps(
  overrides: Partial<TrustedCasePreflightDependencies> = {}
): TrustedCasePreflightDependencies {
  return {
    authenticatedActorId: async () => actor,
    currentMasterGrant: async () => grant,
    caseSnapshot: async () => ({
      caseRecord: { id: caseId, organizationId: org, status: "assigned", assignedTo: actor },
      version: 7
    }),
    auditContext: async () => ({
      requestId: "synthetic-request-1",
      occurredAt: "2026-11-02T09:00:00.000Z"
    }),
    ...overrides
  };
}

describe("Compliance case preflight (synthetic-only; not a database write)", () => {
  it("prepares a read without mutating state or case version", async () => {
    const result = await prepareComplianceCasePreflight(read, deps());
    expect(result.prepared).toBe(true);
    if (result.prepared) {
      expect(result.audit.eventType).toBe("compliance.case_read");
      expect(result.audit.actorType).toBe("staff");
      expect(result.audit.before).toEqual(result.audit.after);
      expect(result.audit.organizationId).toBe(org);
      expect(result.audit.caseId).toBe(caseId);
      expect(JSON.stringify(result.audit)).not.toContain("Synthetic");
    }
  });

  it("preserves interim versus final semantics and version increment", async () => {
    for (const [command, event, status] of [
      [interim, "compliance.interim_reply", "assigned"],
      [finalReply, "compliance.final_reply", "resolved"]
    ] as const) {
      const result = await prepareComplianceCasePreflight(command, deps());
      expect(result.prepared).toBe(true);
      if (result.prepared) {
        expect(result.audit.eventType).toBe(event);
        expect(result.audit.after.status).toBe(status);
        expect(result.audit.before.version).toBe(7);
        expect(result.audit.after.version).toBe(8);
        expect(JSON.stringify(result.audit)).not.toContain(command.message);
      }
    }
  });

  it("rejects untrusted identity, approval and status claims in request JSON", async () => {
    for (const extra of [
      { actorId: actor }, { masterApproved: true }, { status: "resolved" },
      { grantVersion: 3 }, { permissions: ["compliance.case.reply"] },
      { verifiedBotService: true }, { approvedBy: actor }
    ]) {
      await expect(prepareComplianceCasePreflight({ ...read, ...extra }, deps()))
        .resolves.toEqual({ prepared: false, reason: "invalid_command" });
    }
  });

  it("fails closed for absent actor, missing grant, stale approval and wrong actor", async () => {
    for (const overrides of ([
      { authenticatedActorId: async () => null },
      { currentMasterGrant: async () => null },
      { currentMasterGrant: async () => ({ ...grant, masterApproved: false }) },
      { currentMasterGrant: async () => ({ ...grant, status: "suspended" as const }) },
      { currentMasterGrant: async () => ({ ...grant, currentGrantVersion: 4 }) },
      { currentMasterGrant: async () => ({ ...grant, actorId: otherCase }) },
      { currentMasterGrant: async () => ({ ...grant, organizationIds: [otherOrg] }) },
      { currentMasterGrant: async () => ({ ...grant, permissions: ["compliance.case.read"] as StaffGrant["permissions"] }) }
    ] as Partial<TrustedCasePreflightDependencies>[])) {
      const command = overrides.currentMasterGrant ? interim : read;
      const result = await prepareComplianceCasePreflight(command, deps(overrides));
      expect(result).toEqual({ prepared: false, reason: "not_authorized_or_unavailable" });
    }
  });

  it("rejects cross-tenant or mismatched case snapshots even with a valid grant", async () => {
    for (const caseRecord of [
      { id: caseId, organizationId: otherOrg, status: "assigned" as const, assignedTo: actor },
      { id: otherCase, organizationId: org, status: "assigned" as const, assignedTo: actor }
    ]) {
      const result = await prepareComplianceCasePreflight(read, deps({
        caseSnapshot: async () => ({ caseRecord, version: 7 })
      }));
      expect(result).toEqual({ prepared: false, reason: "not_authorized_or_unavailable" });
    }
  });

  it("rejects replies to unassigned, resolved or another employee's cases", async () => {
    for (const caseRecord of [
      { id: caseId, organizationId: org, status: "queued" as const, assignedTo: null },
      { id: caseId, organizationId: org, status: "resolved" as const, assignedTo: actor },
      { id: caseId, organizationId: org, status: "assigned" as const, assignedTo: otherCase }
    ]) {
      const result = await prepareComplianceCasePreflight(finalReply, deps({
        caseSnapshot: async () => ({ caseRecord, version: 7 })
      }));
      expect(result).toEqual({ prepared: false, reason: "not_authorized_or_unavailable" });
    }
  });

  it("fails closed for invalid audit metadata or case version", async () => {
    for (const overrides of [
      { auditContext: async () => null },
      { auditContext: async () => ({ requestId: "bad id with spaces", occurredAt: "2026-11-02T09:00:00.000Z" }) },
      { auditContext: async () => ({ requestId: "synthetic-request-1", occurredAt: "not-a-time" }) },
      { caseSnapshot: async () => ({
        caseRecord: { id: caseId, organizationId: org, status: "assigned" as const, assignedTo: actor },
        version: Number.MAX_SAFE_INTEGER
      }) }
    ]) {
      const result = await prepareComplianceCasePreflight(finalReply, deps(overrides));
      expect(result).toEqual({ prepared: false, reason: "not_authorized_or_unavailable" });
    }
  });

  it("does not disclose internal exceptions from any trusted dependency", async () => {
    const fail = async (): Promise<never> => { throw new Error("synthetic secret"); };
    for (const overrides of [
      { authenticatedActorId: fail },
      { currentMasterGrant: fail },
      { caseSnapshot: fail },
      { auditContext: fail }
    ]) {
      const result = await prepareComplianceCasePreflight(read, deps(overrides));
      expect(result).toEqual({ prepared: false, reason: "not_authorized_or_unavailable" });
      expect(JSON.stringify(result)).not.toContain("synthetic secret");
    }
  });
});
