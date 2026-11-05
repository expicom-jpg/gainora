import { describe, expect, it, vi } from "vitest";
import { executeBotHandoff } from "./handoff-orchestration";
import type { TrustedBotHandoffDependencies } from "./bot-handoff-preflight";
import type { CaseAuditEnvelope } from "./audit-envelope";
const organizationId = "11111111-1111-4111-8111-111111111111";
const caseId = "22222222-2222-4222-8222-222222222222";
const raw = { organizationId, caseId, reason: "Synthetic escalation" };
const trusted = (): TrustedBotHandoffDependencies => ({
  verifiedBotService: async () => true,
  serviceActorId: async () => "synthetic-bot",
  caseSnapshot: async () => ({ caseRecord: { id: caseId, organizationId, status: "bot_open", assignedTo: null }, version: 3 }),
  auditContext: async () => ({ requestId: "synthetic-request", occurredAt: "2026-11-05T09:00:00.000Z" })
});
const receipt = (e: CaseAuditEnvelope) => ({
  committed: true, organizationId: e.organizationId, caseId: e.caseId,
  requestId: e.requestId, eventType: e.eventType,
  beforeVersion: e.before.version, afterVersion: e.after.version,
  afterStatus: e.after.status, auditEventId: "synthetic-audit-1"
});
describe("synthetic-only bot handoff orchestration", () => {
  it("acknowledges only a correlated committed receipt", async () => {
    const commit = vi.fn(async (e: CaseAuditEnvelope) => receipt(e));
    expect(await executeBotHandoff(raw, trusted(), commit)).toEqual({
      acknowledged: true, auditEventId: "synthetic-audit-1"
    });
    expect(commit).toHaveBeenCalledTimes(1);
  });
  it("never calls commit after failed bot verification", async () => {
    const commit = vi.fn(async (e: CaseAuditEnvelope) => receipt(e));
    expect(await executeBotHandoff(raw, { ...trusted(), verifiedBotService: async () => false }, commit))
      .toEqual({ acknowledged: false });
    expect(commit).not.toHaveBeenCalled();
  });
  it("never calls commit after cross-tenant snapshot or malformed command", async () => {
    const commit = vi.fn(async (e: CaseAuditEnvelope) => receipt(e));
    const crossTenant = { ...trusted(), caseSnapshot: async () => ({
      caseRecord: { id: caseId, organizationId: "another-tenant", status: "bot_open" as const, assignedTo: null },
      version: 3
    }) };
    expect(await executeBotHandoff(raw, crossTenant, commit)).toEqual({ acknowledged: false });
    expect(await executeBotHandoff({ ...raw, masterApproved: true }, trusted(), commit))
      .toEqual({ acknowledged: false });
    expect(commit).not.toHaveBeenCalled();
  });
  it("rejects a forged or failed commit receipt", async () => {
    expect(await executeBotHandoff(raw, trusted(), async (e) => ({
      ...receipt(e), auditEventId: "", committed: true
    }))).toEqual({ acknowledged: false });
    expect(await executeBotHandoff(raw, trusted(), async () => { throw Error("synthetic rollback"); }))
      .toEqual({ acknowledged: false });
  });
  it("does not call commit when preflight dependency throws", async () => {
    const commit = vi.fn(async (e: CaseAuditEnvelope) => receipt(e));
    expect(await executeBotHandoff(raw, { ...trusted(), caseSnapshot: async () => { throw Error("unavailable"); } }, commit))
      .toEqual({ acknowledged: false });
    expect(commit).not.toHaveBeenCalled();
  });
});
