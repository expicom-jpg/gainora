import { z } from "zod";

/** Public, manually reviewed indicators only. No web fetching or tenant data. */
export const marketIndicatorSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,64}$/),
  industry: z.enum(["restaurant", "trades"]),
  metric: z.string().trim().min(1).max(100),
  sourceName: z.string().trim().min(1).max(120),
  sourceUrl: z.string().url().refine(url => new URL(url).protocol === "https:", "https_required"),
  period: z.string().regex(/^\\d{4}-(0[1-9]|1[0-2])$/),
  geography: z.string().trim().min(1).max(80),
  retrievedAt: z.string().date(),
  direction: z.enum(["up", "down", "stable", "unknown"]),
  evidenceType: z.enum(["observed", "forecast"]),
  context: z.string().trim().min(1).max(400)
}).strict();
export type MarketIndicator = z.infer<typeof marketIndicatorSchema>;

export type MarketBrief = {
  industry: "restaurant" | "trades";
  signals: MarketIndicator[];
  warnings: string[];
  recommendations: { indicatorId: string; action: string; certainty: "check" }[];
};

/** Explicitly declines to make predictions when there is no cited evidence. */
export function buildMarketBrief(industry: "restaurant" | "trades", inputs: unknown[], asOf: string): MarketBrief {
  const today = Date.parse(asOf);
  if (!Number.isFinite(today)) throw new Error("invalid_as_of");
  const signals: MarketIndicator[] = [];
  const warnings: string[] = [];
  for (const raw of inputs) {
    const result = marketIndicatorSchema.safeParse(raw);
    if (!result.success) { warnings.push("En markedsindikator blev afvist: ugyldig eller manglende kilde."); continue; }
    const signal = result.data;
    if (signal.industry !== industry) { warnings.push("Indikator fra en anden branche blev udeladt."); continue; }
    const age = today - Date.parse(signal.retrievedAt);
    if (age < 0 || age > 120 * 86400000) { warnings.push("Forældet eller fremtidigt dateret indikator blev udeladt."); continue; }
    signals.push(signal);
  }
  if (signals.length === 0) warnings.push("Ingen aktuelle, verificerbare markedsdata. Ingen prognose kan udledes.");
  return {
    industry, signals, warnings,
    recommendations: signals.map(s => ({
      indicatorId: s.id,
      action: s.evidenceType === "forecast"
        ? `Undersøg, om prognosen for ${s.metric} er relevant for virksomhedens egne omkostninger og efterspørgsel.`
        : `Sammenhold udviklingen i ${s.metric} med egne tal før beslutning.`,
      certainty: "check" as const
    }))
  };
}
