import { z } from "zod";

/** This first AI feature is restricted to the known, fixed demo dataset.
 * Never accept arbitrary financial data, names, notes or raw files from callers.
 */
export const FIXED_DEMO = {
  month: "2026-09", revenueDkk: 200000, costsDkk: 164000, profitDkk: 36000,
  rowCount: 8, synthetic: true as const
};

export const explanationSchema = z.object({
  summary: z.string().trim().min(1).max(500),
  observations: z.array(z.object({
    evidenceId: z.enum(["revenue", "costs", "profit", "margin"]),
    explanation: z.string().trim().min(1).max(400),
    nextStep: z.string().trim().min(1).max(300)
  }).strict()).min(1).max(4),
  caveat: z.string().trim().min(1).max(400)
}).strict();

export type SyntheticExplanation = z.infer<typeof explanationSchema>;

export function syntheticPrompt(): string {
  return [
    "Du forklarer udelukkende en fast, fiktiv demo for Gainora på dansk.",
    "Tallene er syntetiske og må aldrig præsenteres som kundedata eller dokumenterede besparelser.",
    "Find ikke på tal, årsager, leverandører, procentbesparelser eller beviste effekter.",
    "Svar udelukkende med JSON med summary, observations (evidenceId, explanation, nextStep) og caveat.",
    "Brug evidenceId kun fra revenue, costs, profit, margin. Foreslå kontrolpunkter, ikke garanterede besparelser.",
    JSON.stringify(FIXED_DEMO),
    "Margin er 18 %. Ingen dokumenteret besparelse er opgjort."
  ].join("\n");
}

/** Validate structure and reject unsupported financial numbers before display. */
export function validateSyntheticExplanation(value: unknown): SyntheticExplanation {
  const parsed = explanationSchema.parse(value);
  const prose = [parsed.summary, parsed.caveat, ...parsed.observations.flatMap(o => [o.explanation, o.nextStep])].join(" ");
  // The model must not invent extra numerical savings or amounts.
  const numbers = prose.match(/\d+(?:[.,]\d+)?/g) ?? [];
  const allowed = new Set(["200000", "164000", "36000", "18", "2026", "09", "8"]);
  if (numbers.some(n => !allowed.has(n.replace(/[.,]/g, "")))) throw new Error("ai_unsupported_number");
  return parsed;
}
