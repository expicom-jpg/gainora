import type { AuditFinding, FinancialRow } from "@/lib/profit-audit/types";

function norm(value: string) {
  return value.toLocaleLowerCase("da-DK");
}

const money = (value: number) => new Intl.NumberFormat("da-DK", { style: "currency", currency: "DKK", maximumFractionDigits: 0 }).format(value);
function pct(value: number) {
  return new Intl.NumberFormat("da-DK", { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(value * 100);
}
const purchasingAccount = (account: string) => /vare|indkøb|indkoeb|råvare|raavare|supplier|leverandør|leverandoer/.test(norm(account));
const payrollAccount = (account: string) => /løn|loen|salary|wage|personale/.test(norm(account));

export function runProfitAudit(rows: FinancialRow[]): AuditFinding[] {
  const findings: AuditFinding[] = [];
  const revenueRows = rows.filter((row) => row.amount > 0);
  const costRows = rows.filter((row) => row.amount < 0);
  const revenue = revenueRows.reduce((sum, row) => sum + row.amount, 0);
  const totalCosts = Math.abs(costRows.reduce((sum, row) => sum + row.amount, 0));
  const net = revenue - totalCosts;
  const margin = revenue > 0 ? net / revenue : 0;

  findings.push({
    findingType: "financial_summary",
    title: "Økonomisk baseline",
    description: `Omsætning: ${money(revenue)}. Omkostninger: ${money(totalCosts)}. Resultat: ${money(net)}. Resultatmargin: ${pct(margin)} %. Tallene er beregnet ud fra de importerede posteringer.`
  });

  if (revenue <= 0 || totalCosts <= 0) return findings;

  const byAccount = new Map<string, number>();
  for (const row of costRows) byAccount.set(row.account, (byAccount.get(row.account) ?? 0) + Math.abs(row.amount));

  const concentrations = [...byAccount.entries()]
    .map(([account, cost]) => ({ account, cost, share: cost / totalCosts, revenueShare: cost / revenue }))
    .sort((a, b) => b.cost - a.cost);

  for (const item of concentrations.filter((x) => x.share >= 0.15 && !payrollAccount(x.account) && !purchasingAccount(x.account)).slice(0, 4)) {
    findings.push({
      findingType: "cost_concentration",
      title: `Undersøg stor udgift: ${item.account}`,
      description: `${item.account} koster ${money(item.cost)} i perioden (${pct(item.share)} % af omkostningerne). Næste skridt: gennemgå poster og aftaler på kontoen for at finde årsagen. En høj andel er ikke i sig selv en besparelsesmulighed.`
    });
  }

  const payroll = concentrations.filter((x) => payrollAccount(x.account)).reduce((s, x) => s + x.cost, 0);
  if (payroll > 0) {
    const share = payroll / revenue;
    findings.push({
      findingType: "people_capacity",
      title: "Løn og kapacitet",
      description: `Lønudgifterne er ${money(payroll)} (${pct(share)} % af omsætningen). Næste skridt: sammenhold månedlige lønudgifter med omsætning, bemanding og aktivitet. Tallene alene viser ikke, om der er overbemanding.`
    });
  }

  const purchasing = concentrations.filter((x) => purchasingAccount(x.account)).reduce((s, x) => s + x.cost, 0);
  if (purchasing > 0) {
    const share = purchasing / revenue;
    findings.push({
      findingType: "purchasing_margin",
      title: "Indkøb og bruttoavance",
      description: `Indkøb og vareforbrug udgør ${money(purchasing)} (${pct(share)} % af omsætningen). Næste skridt: undersøg indkøbspriser, leverandører og vareforbrug måned for måned. Besparelser kan først vurderes, når priser og mængder er dokumenteret.`
    });
  }

  const recurring = concentrations.filter((x) => /abonnement|software|tele|forsikring|leasing|husleje|rent|subscription/.test(norm(x.account)));
  if (recurring.length) {
    const cost = recurring.reduce((s, x) => s + x.cost, 0);
    findings.push({
      findingType: "fixed_costs",
      title: "Faste og tilbagevendende omkostninger",
      description: `Genkendelige faste/tilbagevendende konti udgør ${money(cost)} i perioden. Næste skridt: gennemgå kontrakter, faktisk brug og eventuelle overlappende abonnementer. Ingen besparelse er endnu dokumenteret.`
    });
  }

  return findings;
}
