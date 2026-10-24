/**
 * Gainora Partner Operations domain rules.
 * This is a side-effect-free, testable foundation; callers must persist audit
 * events and enforce authorization server-side before any production action.
 */
export type PartnerLifecycle = "pending" | "invited" | "active" | "suspended" | "revoked";
export type SecurityEvent =
  | "staff.permissions_changed"
  | "staff.access_revoked"
  | "partner.created"
  | "partner.invited"
  | "partner.activated"
  | "partner.suspended"
  | "partner.attribution_changed"
  | "commission.rate_changed"
  | "compliance.case_exported"
  | "auth.suspicious_login";

export interface AuditEvent {
  id: string;
  occurredAt: string;
  actorId: string;
  action: SecurityEvent;
  subjectType: "staff" | "partner" | "customer" | "compliance" | "security";
  subjectId: string;
  outcome: "success" | "denied" | "error";
  reason?: string;
  correlationId: string;
}
export interface MasterAlert {
  category: "access" | "partner" | "commission" | "compliance" | "security";
  severity: "high" | "critical";
  eventId: string;
  summary: string;
  requiresMasterReview: true;
}

/** Alert definitions are deliberately explicit, not based on arbitrary logs. */
export function masterAlertsForEvent(event: AuditEvent): MasterAlert[] {
  if (event.action === "auth.suspicious_login")
    return [{ category: "security", severity: "critical", eventId: event.id, summary: "Mistænkeligt login kræver Master-gennemgang", requiresMasterReview: true }];
  if (event.action === "staff.access_revoked" || event.action === "staff.permissions_changed")
    return [{ category: "access", severity: "high", eventId: event.id, summary: "Medarbejderrettigheder blev ændret", requiresMasterReview: true }];
  if (event.action === "commission.rate_changed")
    return [{ category: "commission", severity: "high", eventId: event.id, summary: "Provisionsvilkår blev ændret", requiresMasterReview: true }];
  if (event.action === "partner.attribution_changed")
    return [{ category: "partner", severity: "high", eventId: event.id, summary: "Kundetilknytning blev ændret", requiresMasterReview: true }];
  if (event.action === "compliance.case_exported")
    return [{ category: "compliance", severity: "high", eventId: event.id, summary: "Compliance-sag blev eksporteret", requiresMasterReview: true }];
  return [];
}
export interface PartnerProvisioningRequest {
  partnerId: string;
  inviteeEmail: string;
  approvedByMaster: boolean;
  emailVerified: boolean;
  agreementAccepted: boolean;
  currentStatus: PartnerLifecycle;
}
export type ProvisioningDecision =
  | { allowed: true; nextStatus: "active"; steps: ["create_membership", "enable_scoped_dashboard", "record_audit_event"] }
  | { allowed: false; nextStatus: PartnerLifecycle; reason: string };

/** Fail-closed: an invite alone must NEVER grant partner data access. */
export function decidePartnerActivation(input: PartnerProvisioningRequest): ProvisioningDecision {
  if (input.currentStatus === "suspended" || input.currentStatus === "revoked")
    return { allowed: false, nextStatus: input.currentStatus, reason: "partner_blocked" };
  if (input.currentStatus === "active")
    return { allowed: false, nextStatus: input.currentStatus, reason: "already_active" };
  if (!input.partnerId || !input.inviteeEmail.includes("@"))
    return { allowed: false, nextStatus: input.currentStatus, reason: "invalid_identity" };
  if (!input.approvedByMaster)
    return { allowed: false, nextStatus: input.currentStatus, reason: "master_approval_required" };
  if (!input.emailVerified || !input.agreementAccepted)
    return { allowed: false, nextStatus: input.currentStatus, reason: "identity_or_agreement_pending" };
  return { allowed: true, nextStatus: "active", steps: ["create_membership", "enable_scoped_dashboard", "record_audit_event"] };
}
