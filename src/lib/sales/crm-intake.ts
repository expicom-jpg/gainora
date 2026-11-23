/** Pure CRM intake plan. Does not access a database or grant ownership.
 * Production implementation MUST use a single server-side transaction, unique CVR,
 * authenticated seller id, RLS checks, quota lock and audit event.
 */
import { normalizeCvr } from "./cvr-intake";
import { evaluateReservation, LEAD_POLICY } from "./reservation-policy";

export type IntakeInput = {
  rawCvr: string;
  verifiedRegistryName: string;
  sellerId: string | null;
  activeReservations: number;
  existingCompanyStatus: "available" | "mine" | "other" | "blocked" | "pending" | "unknown";
  adminOverrideApproved?: boolean;
};

export type IntakePlan =
  | { ok: false; reason: string }
  | { ok: true; company: { cvr: string; name: string }; sellerId: string; stage: "new"; reservationDays: number; firstContactWithinDays: number };

export function planCvrCrmIntake(input: IntakeInput): IntakePlan {
  const cvr = normalizeCvr(input.rawCvr);
  if (!cvr) return { ok: false, reason: "CVR-nummeret skal bestå af otte cifre." };
  if (!input.sellerId?.trim()) return { ok: false, reason: "Sælgeridentitet mangler." };
  if (!input.verifiedRegistryName.trim()) return { ok: false, reason: "Virksomhedsnavn skal verificeres i CVR-registeret." };
  if (input.existingCompanyStatus === "mine") return { ok: false, reason: "Virksomheden findes allerede i din pipeline." };
  const decision = evaluateReservation({
    verifiedAvailable: input.existingCompanyStatus === "available",
    activeReservations: input.activeReservations,
    blocked: input.existingCompanyStatus === "blocked",
    authenticatedSeller: true,
    adminOverrideApproved: input.adminOverrideApproved === true
  });
  if (!decision.allowed) return { ok: false, reason: decision.reason };
  return {
    ok: true,
    company: { cvr, name: input.verifiedRegistryName.trim() },
    sellerId: input.sellerId,
    stage: "new",
    reservationDays: LEAD_POLICY.initialDays,
    firstContactWithinDays: LEAD_POLICY.firstContactWithinDays
  };
}
