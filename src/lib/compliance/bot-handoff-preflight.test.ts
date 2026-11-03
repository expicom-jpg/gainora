import { describe, expect, it } from "vitest";
import { prepareBotHandoff, type TrustedBotHandoffDependencies } from "./bot-handoff-preflight";
const organizationId = "11111111-1111-4111-8111-111111111111";
const caseId = "22222222-2222-4222-8222-222222222222";
const raw = { organizationId, caseId, reason: "Synthetic support escalation" };
const trusted = (): TrustedBotHandoffDependencies => ({
  verifiedBotService: async () => true,
  serviceActorId: async () => "bot-service-1",
  caseSnapshot: async () => ({ caseRecord: { id: caseId, organizationId, status: "bot_open", assignedTo: null }, version: 3 }),
  auditContext: async () => ({ requestId: "request-1", occurredAt: "2026-11-03T10:00:00.000Z" })
});
describe("synthetic-only bot-to-inbox preflight", () => {
  it("prepares a queued transition with bot-attributed audit, without writing", async () => {
    const result = await prepareBotHandoff(raw, trusted());
    expect(result.prepared).toBe(true);
    if (result.prepared) {
      expect(result.audit.actorType).toBe("bot_service");
      expect(result.audit.eventType).toBe("compliance.bot_escalated");
      expect(result.audit.before).toEqual({ status: "bot_open", assignedTo: null, version: 3 });
      expect(result.audit.after).toEqual({ status: "queued", assignedTo: null, version: 4 });
    }
  });
  it("denies client-injected service identity or status", async () => {
    for (const extra of [{ verifiedBotService: true }, { actorId: "staff" }, { status: "queued" }])
      expect((await prepareBotHandoff({ ...raw, ...extra }, trusted())).prepared).toBe(false);
  });
  it("denies false service verification and storage failure", async () => {
    expect((await prepareBotHandoff(raw, { ...trusted(), verifiedBotService: async () => false })).prepared).toBe(false);
    expect((await prepareBotHandoff(raw, { ...trusted(), caseSnapshot: async () => { throw new Error("synthetic failure"); } })).prepared).toBe(false);
  });
  it("denies cross-tenant case, stale state and malformed reason", async () => {
    const mismatch = { ...trusted(), caseSnapshot: async () => ({
      caseRecord: { id: caseId, organizationId: "33333333-3333-4333-8333-333333333333", status: "bot_open" as const, assignedTo: null }, version: 3
    }) };
    expect((await prepareBotHandoff(raw, mismatch)).prepared).toBe(false);
    const queued = { ...trusted(), caseSnapshot: async () => ({
      caseRecord: { id: caseId, organizationId, status: "queued" as const, assignedTo: null }, version: 3
    }) };
    expect((await prepareBotHandoff(raw, queued)).prepared).toBe(false);
    for (const reason of ["", "  ", "x".repeat(1001), "bad\u0000reason"])
      expect((await prepareBotHandoff({ ...raw, reason }, trusted())).prepared).toBe(false);
  });
});
