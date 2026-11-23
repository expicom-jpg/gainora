/** Proposed lead-reservation policy; pure preview logic, NOT an authorization boundary.
 * Enforce atomically server-side with RLS, audit and administrator review before production.
 */
export const LEAD_POLICY = {
  maxActiveReservations: 20,
  initialDays: 14,
  firstContactWithinDays: 7,
  extensionDays: 14,
  maxDaysWithoutCustomerAgreement: 60
} as const;
export type ReservationRequest = {
  verifiedAvailable: boolean;
  activeReservations: number;
  blocked: boolean;
  authenticatedSeller: boolean;
  adminOverrideApproved: boolean;
};
export function evaluateReservation(request: ReservationRequest) {
  if (!request.authenticatedSeller) return { allowed: false, reason: "Sælgeradgang mangler." };
  if (request.blocked) return { allowed: false, reason: "Virksomheden er blokeret." };
  if (!request.verifiedAvailable) return { allowed: false, reason: "CVR eller ejerskab er ikke verificeret som ledigt." };
  if (request.activeReservations >= LEAD_POLICY.maxActiveReservations && !request.adminOverrideApproved)
    return { allowed: false, reason: "Grænsen for aktive reservationer er nået." };
  return { allowed: true, reason: "Kan anmode om tidsbegrænset reservation; kræver atomisk serverkontrol." };
}
