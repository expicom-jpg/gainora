/**
 * Synthetic-only receipt gate for bot-to-inbox handoff.
 * This does NOT implement persistence. The trusted database adapter must
 * authenticate the bot again, lock the case, check tenant/state/version,
 * update the queue and insert append-only audit in ONE transaction.
 * Only a committed, matching receipt can be acknowledged to the caller.
 */
import type { CaseAuditEnvelope } from "./audit-envelope";

export interface HandoffCommitReceipt {
  committed: true;
  organizationId: string;
  caseId: string;
  requestId: string;
  eventType: "compliance.bot_escalated";
  beforeVersion: number;
  afterVersion: number;
  afterStatus: "queued";
  auditEventId: string;
}

const safeAuditId = (value: unknown): value is string =>
  typeof value === "string" && /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,127}$/.test(value);

export function verifiedHandoffReceipt(
  envelope: CaseAuditEnvelope,
  receipt: unknown
): receipt is HandoffCommitReceipt {
  if (!envelope || envelope.eventType !== "compliance.bot_escalated" ||
      envelope.actorType !== "bot_service" || envelope.auditRequired !== true ||
      envelope.before.status !== "bot_open" || envelope.after.status !== "queued" ||
      envelope.before.assignedTo !== null || envelope.after.assignedTo !== null ||
      !Number.isSafeInteger(envelope.before.version) ||
      envelope.after.version !== envelope.before.version + 1 ||
      !receipt || typeof receipt !== "object" || Array.isArray(receipt)) return false;
  const r = receipt as Record<string, unknown>;
  return Object.keys(r).length === 9 &&
    r.committed === true &&
    r.organizationId === envelope.organizationId &&
    r.caseId === envelope.caseId &&
    r.requestId === envelope.requestId &&
    r.eventType === envelope.eventType &&
    r.beforeVersion === envelope.before.version &&
    r.afterVersion === envelope.after.version &&
    r.afterStatus === envelope.after.status &&
    safeAuditId(r.auditEventId);
}

/**
 * An adapter response is not proof of a database transaction by itself.
 * This checks shape and correlation only. The adapter MUST be trusted server
 * code with a transactional commit and independently verified database tests.
 */
export async function acknowledgeCommittedHandoff(
  envelope: CaseAuditEnvelope,
  commit: (envelope: CaseAuditEnvelope) => Promise<unknown>
): Promise<{ acknowledged: true; auditEventId: string } | { acknowledged: false }> {
  try {
    const receipt = await commit(envelope);
    return verifiedHandoffReceipt(envelope, receipt)
      ? { acknowledged: true, auditEventId: receipt.auditEventId }
      : { acknowledged: false };
  } catch {
    return { acknowledged: false };
  }
}
