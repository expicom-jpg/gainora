import type { FinancialRow } from "./types";

export type AccountBreakdown = { account: string; amount: number; shareOfCosts: number; shareOfRevenue: number };
export type MonthlySnapshot = { month: string; revenue: number; costs: number; profit: number; marginPct: number };
export type AuditDetail = {
  revenue: number; costs: number; profit: number; marginPct: number;
  accounts: AccountBreakdown[]; monthly: MonthlySnapshot[];
  caveats: string[];
};
const money = (n: number) => Math.round(n * 100) / 100;

/** Uses signed accounting rows: positive revenue, negative expenses.
 * Does not infer savings or causal explanations from account names.
 */
export function analyzeFinancialRows(rows: FinancialRow[]): AuditDetail {
  const valid = rows.filter(r => Number.isFinite(r.amount));
  const revenue = money(valid.reduce((s,r) => s + Math.max(0,r.amount),0));
  const costs = money(valid.reduce((s,r) => s + Math.max(0,-r.amount),0));
  const byAccount = new Map<string,number>();
  const byMonth = new Map<string,{revenue:number;costs:number}>();
  for (const r of valid) {
    if (r.amount < 0) byAccount.set(r.account,(byAccount.get(r.account)??0)-r.amount);
    if (r.transactionDate && /^\d{4}-\d{2}-\d{2}$/.test(r.transactionDate)) {
      const month=r.transactionDate.slice(0,7);
      const item=byMonth.get(month)??{revenue:0,costs:0};
      if(r.amount>0)item.revenue+=r.amount;else item.costs-=r.amount;
      byMonth.set(month,item);
    }
  }
  return {
    revenue, costs, profit:money(revenue-costs), marginPct:revenue>0?money((revenue-costs)/revenue*100):0,
    accounts:[...byAccount].map(([account,amount])=>({account,amount:money(amount),shareOfCosts:costs>0?money(amount/costs*100):0,shareOfRevenue:revenue>0?money(amount/revenue*100):0})).sort((a,b)=>b.amount-a.amount),
    monthly:[...byMonth].sort(([a],[b])=>a.localeCompare(b)).map(([month,v])=>({month,revenue:money(v.revenue),costs:money(v.costs),profit:money(v.revenue-v.costs),marginPct:v.revenue>0?money((v.revenue-v.costs)/v.revenue*100):0})),
    caveats:["Kontonavne alene dokumenterer ikke årsager eller besparelser.","Tal er baseret på importerede posteringer; fuldstændighed og kontofortegn skal kontrolleres.",...(byMonth.size===0?["Ingen gyldige transaktionsdatoer til månedsanalyse."]:[])]
  };
}
/** Hypothetical scenario, not a realized saving or recommendation. */
export function costReductionScenario(costBase: number, reductionPct: number) {
  if (!Number.isFinite(costBase)||costBase<0||!Number.isFinite(reductionPct)||reductionPct<0||reductionPct>100) throw new Error("invalid_scenario");
  return money(costBase*reductionPct/100);
}
