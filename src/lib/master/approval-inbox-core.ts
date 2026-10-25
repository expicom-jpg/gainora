/** Domain-only constraints for Gainora's sole-Master approval inbox.
 * Persistence, actor verification and effects belong in a secured server transaction.
 */
export type MasterTaskKind =
  | "employee_access" | "compliance_access" | "partner_activation"
  | "partner_permissions" | "partner_attribution" | "commission_change"
  | "security_incident";
export type MasterTaskStatus = "pending" | "in_review" | "approved" | "rejected" | "completed";
export interface MasterTask {
  id: string;
  kind: MasterTaskKind;
  status: MasterTaskStatus;
  createdAt: string;
  subjectId: string;
  requestedBy: string;
  priority: "normal" | "high" | "critical";
}
export interface MasterDecision {
  actorId: string;
  verifiedSoleMasterId: string;
  recentMasterAuthentication: boolean;
  decision: "approve" | "reject";
  reason: string;
}
export type MasterDecisionResult =
  | { allowed: true; nextStatus: "approved" | "rejected"; eventType: "master.approved" | "master.rejected" }
  | { allowed: false; reason: string };

/** The API must verify sole Master identity on every call, not trust a client-supplied ID. */
export function validateMasterDecision(task: MasterTask, decision: MasterDecision): MasterDecisionResult {
  if (!decision.actorId || decision.actorId !== decision.verifiedSoleMasterId)
    return { allowed: false, reason: "sole_master_required" };
  if (!decision.recentMasterAuthentication)
    return { allowed: false, reason: "master_reauthentication_required" };
  if (task.status !== "pending" && task.status !== "in_review")
    return { allowed: false, reason: "task_not_actionable" };
  if (!decision.reason.trim())
    return { allowed: false, reason: "decision_reason_required" };
  return decision.decision === "approve"
    ? { allowed: true, nextStatus: "approved", eventType: "master.approved" }
    : { allowed: true, nextStatus: "rejected", eventType: "master.rejected" };
}
