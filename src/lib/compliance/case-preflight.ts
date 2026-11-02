/**
 * Synthetic-only, non-persistent Compliance case preflight.
 *
 * This module composes strict browser-command parsing with trusted server
 * identity, current Master grant, case scope and an audit envelope. It is NOT
 * an endpoint or durable authorization. The database transaction MUST
 * re-check current grants, tenant/RLS, case version and assignment, and write
 * the case/message plus append-only audit before returning or sending data.
 *
 * The dependencies MUST be implemented using server-only trusted storage.
 * Never populate them from client JSON, JWT role claims or cached grants.
 */
import { prepareCaseAuditEnvelope, type CaseAuditEnvelope } from "./audit-envelope";
import {
  decideStaffCaseAction,
  type ComplianceCase,
  type StaffCaseAction,
  type StaffGrant
} from "./policy-core";
import { parseComplianceCaseCommand, type ComplianceCaseCommand } from "./server-command";

export interface TrustedCaseSnapshot {
  caseRecord: ComplianceCase;
  version: number;
}

export interface TrustedCasePreflightDependencies {
  authenticatedActorId(): Promise<string | null>;
  currentMasterGrant(actorId: string, organizationId: string): Promise<StaffGrant | null>;
  caseSnapshot(organizationId: string, caseId: string): Promise<TrustedCaseSnapshot | null>;
  auditContext(): Promise<{ requestId: string; occurredAt: string } | null>;
}

export type CasePreflightResult =
  | { prepared: false; reason: "invalid_command" | "not_authorized_or_unavailable" }
  | { prepared: true; command: ComplianceCaseCommand; audit: CaseAuditEnvelope };

const denied = (): CasePreflightResult => ({
  prepared: false,
  reason: "not_authorized_or_unavailable"
});

/**
 * No effects: never sends a reply, reveals a case, commits an audit event,
 * changes status, or updates the knowledge base.
 *
 * Even a prepared result MUST NOT authorize a write or case disclosure:
 * all conditions must be checked again inside the same DB transaction that
 * persists the audit and any message/state change.
 */
export async function prepareComplianceCasePreflight(
  rawCommand: unknown,
  trusted: TrustedCasePreflightDependencies
): Promise<CasePreflightResult> {
  try {
    const command = parseComplianceCaseCommand(rawCommand);
    if (!command) return { prepared: false, reason: "invalid_command" };

    const actorId = await trusted.authenticatedActorId();
    if (typeof actorId !== "string" || !actorId.trim()) return denied();

    // The current grant is read from protected server storage, never the body.
    const grant = await trusted.currentMasterGrant(actorId, command.organizationId);
    if (!grant) return denied();

    const snapshot = await trusted.caseSnapshot(command.organizationId, command.caseId);
    if (!snapshot || !snapshot.caseRecord ||
        snapshot.caseRecord.id !== command.caseId ||
        snapshot.caseRecord.organizationId !== command.organizationId) return denied();

    const action: StaffCaseAction =
      command.kind === "case.read" ? "read" :
      command.kind === "case.interim_reply" ? "reply_interim" : "reply_final";
    const message = command.kind === "case.read" ? undefined : command.message;
    const decision = decideStaffCaseAction(grant, actorId, snapshot.caseRecord, action, message);
    if (!decision.allowed) return denied();

    const context = await trusted.auditContext();
    if (!context) return denied();
    const audit = prepareCaseAuditEnvelope(
      snapshot.caseRecord, decision, actorId, context.requestId,
      context.occurredAt, snapshot.version, "staff"
    );
    if (!audit.allowed) return denied();

    return { prepared: true, command, audit: audit.envelope };
  } catch {
    // Includes failed storage calls and malformed/untrusted runtime objects.
    // Never leak tenant, case, grant or exception details to a caller.
    return denied();
  }
}
