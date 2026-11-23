/** Normalized public company profile; no API calls, CRM writes or personal owner data. */
export type PublicMetric = { value: number | null; year: number; source: string; publishedAt: string | null };
export type PublicCompanyProfile = {
  cvr: string; name: string; industry: string | null; status: string | null;
  foundedAt: string | null; municipality: string | null; employees: number | null;
  metrics: { revenue?: PublicMetric; grossProfit?: PublicMetric; netProfit?: PublicMetric; equity?: PublicMetric; assets?: PublicMetric };
};
export type Insight = { title: string; description: string; evidence: string };
export function ratio(numerator?: PublicMetric, denominator?: PublicMetric): number | null {
  if (!numerator || !denominator || numerator.value === null || denominator.value === null ||
      denominator.value <= 0 || numerator.year !== denominator.year) return null;
  return Math.round((numerator.value / denominator.value) * 1000) / 10;
}
export function analyzePublicProfile(profile: PublicCompanyProfile): Insight[] {
  const result: Insight[] = [];
  const { revenue, grossProfit, netProfit, equity, assets } = profile.metrics;
  const margin = ratio(netProfit, revenue);
  if (margin !== null) result.push({ title: "Overskudsgrad", description: margin.toLocaleString("da-DK") + " % – undersøg drivere bag indtjening i samtalen.", evidence: "Årsrapport " + netProfit!.year + " · " + netProfit!.source });
  const solidity = ratio(equity, assets);
  if (solidity !== null) result.push({ title: "Soliditetsgrad", description: solidity.toLocaleString("da-DK") + " % – vurder kapitalstruktur i relevant branchekontekst.", evidence: "Årsrapport " + equity!.year + " · " + equity!.source });
  if (grossProfit?.value !== null && grossProfit?.value !== undefined)
    result.push({ title: "Bruttofortjeneste", description: "Spørg til omkostningsstruktur og udvikling; tallet dokumenterer ikke et besparelsespotentiale.", evidence: "Årsrapport " + grossProfit.year + " · " + grossProfit.source });
  return result;
}
