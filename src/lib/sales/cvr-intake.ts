/** CVR intake decision logic. Pure functions only; never grants or writes ownership. */
export type CompanyLookup = { cvr: string; name: string };
export type ClaimStatus = "available" | "mine" | "other" | "pending" | "blocked";
export type ClaimDecision = { allowed: boolean; reason: string };

export function normalizeCvr(value: string): string | null {
  const compact = value.trim().replace(/^DK[\s-]*/i, "").replace(/[\s-]/g, "");
  return /^\d{8}$/.test(compact) ? compact : null;
}

export function canRequestPipelineClaim(status: ClaimStatus | null): ClaimDecision {
  // Unknown/unverified status fails closed. Server must recheck atomically
  // against a unique CVR record and current authenticated seller identity.
  switch (status) {
    case "available": return { allowed: true, reason: "Kan anmodes om tildeling efter serverkontrol." };
    case "mine": return { allowed: false, reason: "Virksomheden findes allerede i din pipeline." };
    case "other": return { allowed: false, reason: "Virksomheden er tildelt en anden sælger." };
    case "pending": return { allowed: false, reason: "Der behandles allerede en tildelingsanmodning." };
    case "blocked": return { allowed: false, reason: "Virksomheden er blokeret for kontakt." };
    default: return { allowed: false, reason: "Tildelingsstatus kunne ikke verificeres." };
  }
}
