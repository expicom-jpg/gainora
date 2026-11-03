/**
 * Synthetic-only bot handoff preflight. No network, DB writes or customer data.
 * A verified service principal MUST be established by the server (not JSON).
 * The caller MUST re-check service identity, case version and tenant scope
 * inside the same DB transaction that persists queue state and append-only audit.
 */
import { decideBotEscalation, type ComplianceCase } from "./policy-core";
import { prepareCaseAuditEnvelope, type CaseAuditEnvelope } from "./audit-envelope";

export interface TrustedBotHandoffDependencies {
  verifiedBotService(): Promise<boolean>;
  serviceActorId(): Promise<string | null>;
  caseSnapshot(organizationId: string, caseId: string):
    Promise<{ caseRecord: ComplianceCase; version: number } | null>;
  auditContext(): Promise<{ requestId: string; occurredAt: string } | null>;
}
export type BotHandoffResult =
  | { prepared: false; reason: "invalid_command" | "not_authorized_or_unavailable" }
  | { prepared: true; audit: CaseAuditEnvelope };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const denied = (): BotHandoffResult => ({ prepared: false, reason: "not_authorized_or_unavailable" });

export async function prepareBotHandoff(
  raw: unknown,
  trusted: TrustedBotHandoffDependencies
): Promise<BotHandoffResult> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { prepared: false, reason: "invalid_command" };
  const command = raw as Record<string, unknown>;
  if (Object.keys(command).some(key => !["organizationId", "caseId", "reason"].includes(key)) ||
    typeof command.organizationId !== "string" || !UUID.test(command.organizationId) ||
    typeof command.caseId !== "string" || !UUID.test(command.caseId) ||
    typeof command.reason !== "string" || !command.reason.trim() || command.reason.length > 1000 ||
    command.reason.includes("\u0000")) return { prepared: false, reason: "invalid_command" };
  try {
    if (await trusted.verifiedBotService() !== true) return denied();
    const actorId = await trusted.serviceActorId();
    if (!actorId) return denied();
    const snapshot = await trusted.caseSnapshot(command.organizationId, command.caseId);
    if (!snapshot || snapshot.caseRecord?.organizationId !== command.organizationId ||
      snapshot.caseRecord.id !== command.caseId) return denied();
    const decision = decideBotEscalation(snapshot.caseRecord, true, command.reason);
    if (!decision.allowed) return denied();
    const context = await trusted.auditContext();
    if (!context) return denied();
    const audit = prepareCaseAuditEnvelope(
      snapshot.caseRecord, decision, actorId, context.requestId,
      context.occurredAt, snapshot.version, "bot_service"
    );
    return audit.allowed ? { prepared: true, audit: audit.envelope } : denied();
  } catch {
    return denied();
  }
}
