import { describe, expect, it } from "vitest";
import { decidePartnerActivation, masterAlertsForEvent, type AuditEvent } from "./operations-core";

describe("Partner Operations security core", () => {
  const request = {
    partnerId: "partner-morten",
    inviteeEmail: "partner@example.test",
    currentStatus: "invited" as const,
    approvedByMaster: true,
    emailVerified: true,
    agreementAccepted: true,
  };
  it("denies onboarding until Master personally approves", () => {
    expect(decidePartnerActivation({ ...request, approvedByMaster: false })).toEqual({
      allowed: false, nextStatus: "invited", reason: "master_approval_required",
    });
  });
  it("denies activation without verified email or agreement", () => {
    expect(decidePartnerActivation({ ...request, emailVerified: false }).allowed).toBe(false);
    expect(decidePartnerActivation({ ...request, agreementAccepted: false }).allowed).toBe(false);
  });
  it("never silently reinstates a suspended partner", () => {
    expect(decidePartnerActivation({ ...request, currentStatus: "suspended" }).allowed).toBe(false);
  });
  it("returns only scoped provisioning steps on valid approval", () => {
    expect(decidePartnerActivation(request)).toEqual({
      allowed: true, nextStatus: "active",
      steps: ["create_membership", "enable_scoped_dashboard", "record_audit_event"],
    });
  });
  const event: AuditEvent = {
    id: "evt-1", occurredAt: "2026-10-24T05:00:00Z", actorId: "master",
    action: "commission.rate_changed", subjectType: "partner",
    subjectId: "partner-morten", outcome: "success", correlationId: "corr-1",
  };
  it("alerts Master on sensitive financial and access events", () => {
    expect(masterAlertsForEvent(event)).toMatchObject([{ category: "commission", requiresMasterReview: true }]);
    expect(masterAlertsForEvent({ ...event, action: "staff.permissions_changed" })).toMatchObject([{ category: "access" }]);
  });
  it("flags suspicious login as critical", () => {
    expect(masterAlertsForEvent({ ...event, action: "auth.suspicious_login" })[0].severity).toBe("critical");
  });
  it("does not create noise from ordinary partner creation", () => {
    expect(masterAlertsForEvent({ ...event, action: "partner.created" })).toEqual([]);
  });
});
