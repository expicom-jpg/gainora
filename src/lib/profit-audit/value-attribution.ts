/** Pure calculations only: never infer causal savings from a before/after difference. */
export type ValueEvidence = "hypothesis" | "measured" | "verified";
export type ValueMeasurement = {
  baselineAmount: number;
  followupAmount: number;
  baselineUnits: number;
  followupUnits: number;
  evidence: ValueEvidence;
  approvedByCustomer: boolean;
  supportingDocumentIds: string[];
};
export type ValueAssessment = {
  comparable: boolean;
  observedDifference: number | null;
  potentialSaving: number | null;
  verifiedSaving: number | null;
  explanation: string;
};

/** Compare cost per unit, holding follow-up volume constant. This is an observation,
 * not a claim of causality or a cash saving. A reviewer must verify attribution. */
export function assessValue(input: ValueMeasurement): ValueAssessment {
  for (const value of [input.baselineAmount, input.followupAmount, input.baselineUnits, input.followupUnits]) {
    if (!Number.isFinite(value) || value < 0) throw new Error("Beløb og enheder skal være endelige, ikke-negative tal.");
  }
  if (!Number.isInteger(input.baselineUnits) || !Number.isInteger(input.followupUnits)) throw new Error("Enheder skal være heltal.");
  if (!Array.isArray(input.supportingDocumentIds) || input.supportingDocumentIds.some(id => typeof id !== "string" || !id.trim())) throw new Error("Ugyldige dokumentreferencer.");
  if (input.baselineUnits === 0 || input.followupUnits === 0) return { comparable:false,observedDifference:null,potentialSaving:null,verifiedSaving:null,explanation:"Kan ikke sammenligne perioder uden enheder." };
  const baselineUnitCost = input.baselineAmount / input.baselineUnits;
  const followupUnitCost = input.followupAmount / input.followupUnits;
  const difference = Math.round((baselineUnitCost - followupUnitCost) * input.followupUnits * 100) / 100;
  const potentialSaving = Math.max(0,difference);
  const verifiedSaving = input.evidence === "verified" && input.approvedByCustomer && input.supportingDocumentIds.length > 0 ? potentialSaving : null;
  return {comparable:true,observedDifference:difference,potentialSaving,verifiedSaving,explanation:verifiedSaving===null?"Beregnet forskel i enhedsomkostning. Ikke en dokumenteret realiseret besparelse.":"Verificeret af kunde med dokumentreference; årsagssammenhæng kræver fortsat faglig kontrol."};
}
