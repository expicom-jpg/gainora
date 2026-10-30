/**
 * Synthetic-only, pure audit envelope for Compliance case decisions.
 *
 * NOT an audit writer or an authorization boundary. The server must derive the
 * actor, request ID, UTC timestamp, current case and case version from trusted
 * sources, re-check the Master grant inside the database transaction, and
 * persist the case/message + append-only audit entry atomically. Never send
 * customer messages or mutate state based solely on this envelope.
 */
import type { ComplianceCase, ComplianceCaseStatus, ComplianceDecision } from "./policy-core";

export type CaseAuditEventType =
  | "compliance.case_read"
  | "compliance.case_exported"
  | "compliance.bot_escalated"
  | "compliance.case_claimed"
  | "compliance.interim_reply"
  | "compliance.final_reply";

export interface CaseAuditEnvelope {
  eventType: CaseAuditEventType;
  actorType: "staff" | "bot_service";
  actorId: string;
  organizationId: string;
  caseId: string;
  requestId: string;
  occurredAt: string;
  reasonCode: "case_read" | "case_export" | "bot_handoff" | "staff_claim" | "interim_reply" | "final_resolution";
  before: { status: ComplianceCaseStatus; assignedTo: string | null; version: number };
  after: { status: ComplianceCaseStatus; assignedTo: string | null; version: number };
  auditRequired: true;
}

export type CaseAuditEnvelopeResult =
  | { allowed: false; reason: string }
  | { allowed: true; envelope: CaseAuditEnvelope };

type EventSpec = {
  actorType: CaseAuditEnvelope["actorType"];
  reasonCode: CaseAuditEnvelope["reasonCode"];
  from?: ComplianceCaseStatus;
  to?: ComplianceCaseStatus;
  changesState: boolean;
};
const eventSpecs: Record<CaseAuditEventType, EventSpec> = {
  "compliance.case_read": { actorType: "staff", reasonCode: "case_read", changesState: false },
  "compliance.case_exported": { actorType: "staff", reasonCode: "case_export", changesState: false },
  "compliance.bot_escalated": { actorType: "bot_service", reasonCode: "bot_handoff", from: "bot_open", to: "queued", changesState: true },
  "compliance.case_claimed": { actorType: "staff", reasonCode: "staff_claim", from: "queued", to: "assigned", changesState: true },
  "compliance.interim_reply": { actorType: "staff", reasonCode: "interim_reply", from: "assigned", to: "assigned", changesState: true },
  "compliance.final_reply": { actorType: "staff", reasonCode: "final_resolution", from: "assigned", to: "resolved", changesState: true }
};

const safeIdentifier = (value: unknown): value is string =>
  typeof value === "string" && /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,127}$/.test(value);
const validUtcTimestamp = (value: unknown): value is string =>
  typeof value === "string" &&
  /^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$/.test(value) &&
  Number.isFinite(Date.parse(value)) &&
  new Date(value).toISOString() === value;

/**
 * Builds a minimal, non-PII audit envelope for an ALREADY authorized decision.
 * It deliberately contains no reply text, customer details or free-form reason.
 * A positive result is never evidence that an audit entry was persisted.
 */
export function prepareCaseAuditEnvelope(
  item: ComplianceCase,
  decision: ComplianceDecision,
  actorId: string,
  requestId: string,
  occurredAt: string,
  currentVersion: number
): CaseAuditEnvelopeResult {
  const deny = (reason: string): CaseAuditEnvelopeResult => ({ allowed: false, reason });
  if (!item || !safeIdentifier(item.id) || !safeIdentifier(item.organizationId) ||
    !["bot_open", "queued", "assigned", "resolved"].includes(item.status) ||
    (item.assignedTo !== null && !safeIdentifier(item.assignedTo)) ||
    ((item.status === "bot_open" || item.status === "queued") && item.assignedTo !== null) ||
    (item.status === "assigned" && item.assignedTo === null))
    return deny("invalid_case");
  if (!safeIdentifier(actorId) || !safeIdentifier(requestId) || !validUtcTimestamp(occurredAt))
    return deny("invalid_trusted_audit_context");
  if (!Number.isSafeInteger(currentVersion) || currentVersion < 1)
    return deny("invalid_case_version");
  if (!decision || decision.allowed !== true || decision.auditRequired !== true ||
    typeof decision.eventType !== "string" ||
    !Object.prototype.hasOwnProperty.call(eventSpecs, decision.eventType))
    return deny("unauditable_decision");

  const eventType = decision.eventType as CaseAuditEventType;
  const spec = eventSpecs[eventType];
  if (spec.from && item.status !== spec.from) return deny("invalid_audit_transition");
  const expectedStatus = spec.to ?? item.status;
  if (decision.nextStatus !== expectedStatus) return deny("invalid_audit_transition");
  if ((eventType === "compliance.interim_reply" || eventType === "compliance.final_reply") &&
    item.assignedTo !== actorId) return deny("invalid_audit_assignment");
  if (spec.changesState && currentVersion === Number.MAX_SAFE_INTEGER)
    return deny("invalid_case_version");

  const nextAssignee = eventType === "compliance.case_claimed" ? actorId : item.assignedTo;
  return {
    allowed: true,
    envelope: {
      eventType,
      actorType: spec.actorType,
      actorId,
      organizationId: item.organizationId,
      caseId: item.id,
      requestId,
      occurredAt,
      reasonCode: spec.reasonCode,
      before: { status: item.status, assignedTo: item.assignedTo, version: currentVersion },
      after: {
        status: expectedStatus,
        assignedTo: nextAssignee,
        version: currentVersion + (spec.changesState ? 1 : 0)
      },
      auditRequired: true
    }
  };
}
