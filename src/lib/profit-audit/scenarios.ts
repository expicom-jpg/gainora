/** Deterministic scenario modelling for planning only. Never writes financial data. */
export type ScenarioInputs = {
  monthlyRevenue: number;
  monthlyCosts: number;
  revenueChangePct: number;
  costChangePct: number;
  months: number;
};
export type ScenarioProjection = {
  baselineMonthlyProfit: number;
  projectedMonthlyRevenue: number;
  projectedMonthlyCosts: number;
  projectedMonthlyProfit: number;
  projectedMonthlyMarginPct: number | null;
  monthlyProfitDifference: number;
  periodProfitDifference: number;
  disclaimer: string;
};
const round = (value: number) => Math.round(value * 100) / 100;
export function projectScenario(input: ScenarioInputs): ScenarioProjection {
  const values = [input.monthlyRevenue,input.monthlyCosts,input.revenueChangePct,input.costChangePct,input.months];
  if (values.some(v => !Number.isFinite(v))) throw new Error("Alle værdier skal være gyldige tal.");
  if (input.monthlyRevenue < 0 || input.monthlyCosts < 0) throw new Error("Omsætning og omkostninger må ikke være negative.");
  if (input.revenueChangePct < -100 || input.costChangePct < -100) throw new Error("En ændring kan ikke reducere beløbet med mere end 100 %.");
  if (!Number.isInteger(input.months) || input.months < 1 || input.months > 36) throw new Error("Vælg 1 til 36 hele måneder.");
  const revenue = round(input.monthlyRevenue * (1 + input.revenueChangePct / 100));
  const costs = round(input.monthlyCosts * (1 + input.costChangePct / 100));
  const baseline = round(input.monthlyRevenue - input.monthlyCosts);
  const profit = round(revenue - costs);
  const difference = round(profit - baseline);
  return {
    baselineMonthlyProfit: baseline,
    projectedMonthlyRevenue: revenue,
    projectedMonthlyCosts: costs,
    projectedMonthlyProfit: profit,
    projectedMonthlyMarginPct: revenue > 0 ? round(profit / revenue * 100) : null,
    monthlyProfitDifference: difference,
    periodProfitDifference: round(difference * input.months),
    disclaimer: "Illustrativt hvad-nu-hvis-scenarie baseret på konstante månedsbeløb. Ikke en prognose eller dokumenteret besparelse."
  };
}
