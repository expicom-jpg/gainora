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
  | "compliance.knowledge.approve";

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
export type ComplianceDecision =
  | { allowed: false; reason: string }
  | { allowed: true; eventType: string; nextStatus: ComplianceCaseStatus; auditRequired: true };

const deny = (reason: string): ComplianceDecision => ({ allowed: false, reason });

/** No role inheritance, cached role claims or implied permission from partner/admin. */
export function hasCurrentComplianceGrant(
  grant: StaffGrant | null | undefined,
  authenticatedActorId: string,
  organizationId: string,
  permissions: readonly CompliancePermission[]
): boolean {
  return Boolean(
    grant &&
    authenticatedActorId &&
    grant.actorId === authenticatedActorId &&
    organizationId &&
    grant.status === "active" &&
    grant.masterApproved === true &&
    Number.isSafeInteger(grant.grantVersion) &&
    grant.grantVersion > 0 &&
    grant.grantVersion === grant.currentGrantVersion &&
    Array.isArray(grant.organizationIds) &&
    grant.organizationIds.includes(organizationId) &&
    Array.isArray(grant.permissions) &&
    permissions.every((permission) => grant.permissions.includes(permission))
  );
}

/** Reading a case is distinct from replying, exporting or searching history. */
export function decideStaffCaseAction(
  grant: StaffGrant | null | undefined,
  authenticatedActorId: string,
  item: ComplianceCase,
  action: StaffCaseAction
): ComplianceDecision {
  if (!item?.id || !item.organizationId || !item.status)
    return deny("invalid_case");
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
  if (!verifiedBotService) return deny("verified_bot_service_required");
  if (!item?.id || !item.organizationId || item.status !== "bot_open" || item.assignedTo !== null)
    return deny("case_not_escalatable");
  if (!reason?.trim()) return deny("escalation_reason_required");
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
  if (!proposal?.id || !proposal.organizationId || !proposal.proposedBy)
    return { allowed: false, reason: "invalid_proposal" };
  if (!hasCurrentComplianceGrant(grant, authenticatedActorId, proposal.organizationId, ["compliance.knowledge.approve"]))
    return { allowed: false, reason: "knowledge_approval_denied" };
  if (proposal.status !== "pending_review")
    return { allowed: false, reason: "proposal_not_pending" };
  if (proposal.proposedBy === authenticatedActorId)
    return { allowed: false, reason: "self_approval_forbidden" };
  if (!reason?.trim())
    return { allowed: false, reason: "approval_reason_required" };
  return {
    allowed: true,
    nextStatus: "approved_for_publication",
    eventType: "compliance.knowledge_approved",
    auditRequired: true
  };
}
