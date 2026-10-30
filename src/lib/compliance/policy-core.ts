/**
 * Compliance domain decisions only. NOT an API authorization boundary.
 *
 * Every caller MUST load the authenticated actor, current Master-approved grant,
 * tenant membership and case from trusted server-side storage. Persist each
 * decision + audit event atomically under database RLS/transactional checks.
 * Never use browser-supplied StaffGrant/ComplianceCase as authorization proof.
 */
export type CompliancePermission =
  | "compliance.case.read"
  | "compliance.case.reply"
  | "compliance.case.export"
  | "compliance.history.search"
  | "compliance.knowledge.approve"
  | "compliance.knowledge.publish";

export interface StaffGrant {
  actorId: string;
  status: "invited" | "pending_master_approval" | "active" | "suspended" | "revoked";
  masterApproved: boolean;
  grantVersion: number;
  currentGrantVersion: number;
  organizationIds: readonly string[];
  permissions: readonly CompliancePermission[];
}

export type ComplianceCaseStatus = "bot_open" | "queued" | "assigned" | "resolved";
export interface ComplianceCase {
  id: string;
  organizationId: string;
  status: ComplianceCaseStatus;
  assignedTo: string | null;
}

export type StaffCaseAction = "read" | "claim" | "reply_interim" | "reply_final" | "export";
/** Guardrail only; API must separately sanitize and persist the message with its audit event. */
export const MAX_COMPLIANCE_REPLY_LENGTH = 10_000;
export type ComplianceDecision =
  | { allowed: false; reason: string }
  | { allowed: true; eventType: string; nextStatus: ComplianceCaseStatus; auditRequired: true };

const deny = (reason: string): ComplianceDecision => ({ allowed: false, reason });
const knownPermissions: readonly string[] = [
  "compliance.case.read", "compliance.case.reply", "compliance.case.export",
  "compliance.history.search", "compliance.knowledge.approve", "compliance.knowledge.publish"
];

/** No role inheritance, cached role claims or implied permission from partner/admin. */
export function hasCurrentComplianceGrant(
  grant: StaffGrant | null | undefined,
  authenticatedActorId: string,
  organizationId: string,
  permissions: readonly CompliancePermission[]
): boolean {
  return Boolean(
    grant &&
    typeof authenticatedActorId === "string" && authenticatedActorId.trim().length > 0 &&
    typeof grant.actorId === "string" && grant.actorId === authenticatedActorId &&
    typeof organizationId === "string" && organizationId.trim().length > 0 &&
    grant.status === "active" &&
    grant.masterApproved === true &&
    Number.isSafeInteger(grant.grantVersion) &&
    grant.grantVersion > 0 &&
    grant.grantVersion === grant.currentGrantVersion &&
    Array.isArray(grant.organizationIds) &&
    grant.organizationIds.includes(organizationId) &&
    Array.isArray(grant.permissions) &&
    Array.isArray(permissions) && permissions.length > 0 &&
    permissions.every((permission) => typeof permission === "string" && knownPermissions.includes(permission) && (grant.permissions as readonly string[]).includes(permission))
  );
}

/** Reading a case is distinct from replying, exporting or searching history. */
export function decideStaffCaseAction(
  grant: StaffGrant | null | undefined,
  authenticatedActorId: string,
  item: ComplianceCase,
  action: StaffCaseAction,
  replyBody?: string
): ComplianceDecision {
  if (
    !item || typeof item.id !== "string" || !item.id.trim() ||
    typeof item.organizationId !== "string" || !item.organizationId.trim() ||
    !["bot_open", "queued", "assigned", "resolved"].includes(item.status) ||
    (item.assignedTo !== null && typeof item.assignedTo !== "string") ||
    (item.status === "assigned" && (!item.assignedTo || !item.assignedTo.trim())) ||
    ((item.status === "bot_open" || item.status === "queued") && item.assignedTo !== null)
  ) return deny("invalid_case");
  const required: Record<StaffCaseAction, readonly CompliancePermission[]> = {
    read: ["compliance.case.read"],
    claim: ["compliance.case.read", "compliance.case.reply"],
    reply_interim: ["compliance.case.read", "compliance.case.reply"],
    reply_final: ["compliance.case.read", "compliance.case.reply"],
    export: ["compliance.case.read", "compliance.case.export"]
  };
  if (!Object.prototype.hasOwnProperty.call(required, action))
    return deny("unknown_action");
  if (!hasCurrentComplianceGrant(grant, authenticatedActorId, item.organizationId, required[action]))
    return deny("compliance_access_denied");

  if (action === "read")
    return { allowed: true, eventType: "compliance.case_read", nextStatus: item.status, auditRequired: true };
  if (action === "export")
    return { allowed: true, eventType: "compliance.case_exported", nextStatus: item.status, auditRequired: true };
  if (action === "claim") {
    if (item.status !== "queued" || item.assignedTo !== null)
      return deny("case_not_claimable");
    return { allowed: true, eventType: "compliance.case_claimed", nextStatus: "assigned", auditRequired: true };
  }
  if (item.status !== "assigned" || item.assignedTo !== authenticatedActorId)
    return deny("case_not_assigned_to_actor");
  // A reply must contain actual text; an empty final reply must never close a case.
  // Sanitization, content safety, rate limiting and transactional persistence remain server duties.
  if (typeof replyBody !== "string" || !replyBody.trim() || replyBody.length > MAX_COMPLIANCE_REPLY_LENGTH)
    return deny("reply_body_invalid");
  return action === "reply_interim"
    ? { allowed: true, eventType: "compliance.interim_reply", nextStatus: "assigned", auditRequired: true }
    : { allowed: true, eventType: "compliance.final_reply", nextStatus: "resolved", auditRequired: true };
}

/** Bot may only enqueue; never assign itself as staff or mark a case resolved. */
export function decideBotEscalation(
  item: ComplianceCase,
  verifiedBotService: boolean,
  reason: string
): ComplianceDecision {
  if (verifiedBotService !== true) return deny("verified_bot_service_required");
  if (
    !item || typeof item.id !== "string" || !item.id.trim() ||
    typeof item.organizationId !== "string" || !item.organizationId.trim() ||
    item.status !== "bot_open" || item.assignedTo !== null
  ) return deny("case_not_escalatable");
  if (typeof reason !== "string" || !reason.trim()) return deny("escalation_reason_required");
  return { allowed: true, eventType: "compliance.bot_escalated", nextStatus: "queued", auditRequired: true };
}

export interface KnowledgeProposal {
  id: string;
  organizationId: string;
  proposedBy: string;
  status: "pending_review" | "approved_for_publication" | "rejected";
}
export type KnowledgeDecision =
  | { allowed: false; reason: string }
  | { allowed: true; nextStatus: "approved_for_publication"; eventType: "compliance.knowledge_approved"; auditRequired: true };

/** Approval is separate from proposal; approval alone does NOT publish to the bot. */
export function decideKnowledgeApproval(
  grant: StaffGrant | null | undefined,
  authenticatedActorId: string,
  proposal: KnowledgeProposal,
  reason: string
): KnowledgeDecision {
  if (
    !proposal || typeof proposal.id !== "string" || !proposal.id.trim() ||
    typeof proposal.organizationId !== "string" || !proposal.organizationId.trim() ||
    typeof proposal.proposedBy !== "string" || !proposal.proposedBy.trim()
  ) return { allowed: false, reason: "invalid_proposal" };
  if (!hasCurrentComplianceGrant(grant, authenticatedActorId, proposal.organizationId, ["compliance.knowledge.approve"]))
    return { allowed: false, reason: "knowledge_approval_denied" };
  if (proposal.status !== "pending_review")
    return { allowed: false, reason: "proposal_not_pending" };
  if (proposal.proposedBy === authenticatedActorId)
    return { allowed: false, reason: "self_approval_forbidden" };
  if (typeof reason !== "string" || !reason.trim())
    return { allowed: false, reason: "approval_reason_required" };
  return {
    allowed: true,
    nextStatus: "approved_for_publication",
    eventType: "compliance.knowledge_approved",
    auditRequired: true
  };
}

/**
 * Publication is a SECOND gate after independent human approval, not an
 * automatic side effect of approval. The server must fetch this candidate
 * from trusted storage, recompute the content digest, and commit publication,
 * audit entry and search-index outbox event atomically. This decision alone
 * NEVER changes the bot's knowledge base.
 */
export interface KnowledgePublicationCandidate {
  id: string;
  organizationId: string;
  proposedBy: string;
  approvedBy: string | null;
  status: "pending_review" | "approved_for_publication" | "published" | "rejected";
  revision: number;
  approvedRevision: number;
  contentDigest: string;
  approvedContentDigest: string;
}

export type KnowledgePublicationDecision =
  | { allowed: false; reason: string }
  | { allowed: true; nextStatus: "published"; eventType: "compliance.knowledge_published"; auditRequired: true };

export function decideKnowledgePublication(
  grant: StaffGrant | null | undefined,
  authenticatedActorId: string,
  candidate: KnowledgePublicationCandidate,
  reason: string
): KnowledgePublicationDecision {
  if (
    !candidate ||
    typeof candidate.id !== "string" || !candidate.id.trim() ||
    typeof candidate.organizationId !== "string" || !candidate.organizationId.trim() ||
    typeof candidate.proposedBy !== "string" || !candidate.proposedBy.trim() ||
    typeof candidate.approvedBy !== "string" || !candidate.approvedBy.trim()
  ) return { allowed: false, reason: "invalid_publication_candidate" };

  if (!hasCurrentComplianceGrant(grant, authenticatedActorId, candidate.organizationId, ["compliance.knowledge.publish"]))
    return { allowed: false, reason: "knowledge_publication_denied" };

  if (candidate.status !== "approved_for_publication")
    return { allowed: false, reason: "knowledge_not_approved" };

  if (candidate.proposedBy === candidate.approvedBy || candidate.proposedBy === authenticatedActorId)
    return { allowed: false, reason: "independent_review_required" };

  if (
    !Number.isSafeInteger(candidate.revision) || candidate.revision <= 0 ||
    candidate.approvedRevision !== candidate.revision ||
    typeof candidate.contentDigest !== "string" || !candidate.contentDigest.trim() ||
    candidate.approvedContentDigest !== candidate.contentDigest
  ) return { allowed: false, reason: "knowledge_revision_changed" };

  if (typeof reason !== "string" || !reason.trim())
    return { allowed: false, reason: "publication_reason_required" };

  return {
    allowed: true,
    nextStatus: "published",
    eventType: "compliance.knowledge_published",
    auditRequired: true
  };
}
