/** Pure, synthetic-safe sales pipeline helpers. No database access or outbound actions. */
export type SalesStage = "new" | "qualified" | "audit" | "offered" | "won" | "lost";
export type LeadSignal = {
  id: string;
  company: string;
  stage: SalesStage;
  sectorFit: 0 | 1 | 2;
  valuePotential: 0 | 1 | 2;
  buyingSignal: 0 | 1 | 2;
  nextActionAt: string | null;
  blocked: boolean;
  ownership: "mine" | "other" | "unassigned";
};
export type SalesSuggestion = { score: number; priority: "high" | "medium" | "low"; nextStep: string; explanation: string };

export function prioritizeLead(lead: LeadSignal, today: string): SalesSuggestion {
  // ISO YYYY-MM-DD only; avoid time zone dependent date parsing.
  const due = lead.nextActionAt !== null && /^\d{4}-\d{2}-\d{2}$/.test(lead.nextActionAt) && lead.nextActionAt <= today;
  const score = lead.sectorFit * 15 + lead.valuePotential * 15 + lead.buyingSignal * 20 + (due ? 10 : 0);
  if (lead.blocked || lead.ownership === "other" || lead.stage === "lost" || lead.stage === "won") {
    return { score: 0, priority: "low", nextStep: "Ingen automatisk kontakt", explanation: "Blokeret, allerede fordelt eller afsluttet lead." };
  }
  const nextStep = due ? "Gennemgå opfølgning manuelt" : lead.stage === "new" ? "Kvalificér virksomhedens behov" : lead.stage === "qualified" ? "Foreslå indledende samtale" : lead.stage === "audit" ? "Følg op på Profit Audit" : "Gennemgå tilbud og næste skridt";
  return {
    score,
    priority: score >= 70 ? "high" : score >= 40 ? "medium" : "low",
    nextStep,
    explanation: `Branchematch ${lead.sectorFit}/2 · potentiale ${lead.valuePotential}/2 · købssignal ${lead.buyingSignal}/2${due ? " · opfølgning forfalden" : ""}`
  };
}

export function summarizePipeline(leads: LeadSignal[]) {
  const mine = leads.filter(lead => lead.ownership === "mine" && !lead.blocked);
  return {
    active: mine.filter(lead => !["won", "lost"].includes(lead.stage)).length,
    qualified: mine.filter(lead => lead.stage === "qualified").length,
    won: mine.filter(lead => lead.stage === "won").length,
    blockedOrOwnedElsewhere: leads.length - mine.length
  };
}
