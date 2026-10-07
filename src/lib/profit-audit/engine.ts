import type { AuditFinding, FinancialRow } from "@/lib/profit-audit/types";

function norm(value: string) {
  return value.toLocaleLowerCase("da-DK");
}

function pct(value: number) {
  return (value * 100).toFixed(1);
}

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
    description: `Perioden viser omsætning på ${revenue.toFixed(2)}, omkostninger på ${totalCosts.toFixed(2)} og resultat på ${net.toFixed(2)}. Resultatmargin: ${pct(margin)}%.`
  });

  if (revenue <= 0 || totalCosts <= 0) return findings;

  const byAccount = new Map<string, number>();
  for (const row of costRows) byAccount.set(row.account, (byAccount.get(row.account) ?? 0) + Math.abs(row.amount));

  const concentrations = [...byAccount.entries()]
    .map(([account, cost]) => ({ account, cost, share: cost / totalCosts, revenueShare: cost / revenue }))
    .sort((a, b) => b.cost - a.cost);

  for (const item of concentrations.filter((x) => x.share >= 0.15).slice(0, 4)) {
    findings.push({
      findingType: "cost_concentration",
      title: `Undersøg omkostningskoncentration: ${item.account}`,
      description: `${item.account} udgør ${pct(item.share)}% af alle omkostninger og ${pct(item.revenueShare)}% af omsætningen. Gainora har observeret koncentrationen; årsag og besparelsespotentiale skal dokumenteres før et mål sættes.`
    });
  }

  const payroll = concentrations.filter((x) => /løn|loen|salary|wage|personale/.test(norm(x.account))).reduce((s, x) => s + x.cost, 0);
  if (payroll > 0) {
    const share = payroll / revenue;
    findings.push({
      findingType: "people_capacity",
      title: "Løn og kapacitet",
      description: `Lønrelaterede konti udgør ${pct(share)}% af omsætningen. Sammenhold udviklingen med aktivitet, bemanding og produktivitet før der konkluderes på årsagen.`
    });
  }

  const purchasing = concentrations.filter((x) => /vare|indkøb|indkoeb|råvare|raavare|supplier|leverandør|leverandoer/.test(norm(x.account))).reduce((s, x) => s + x.cost, 0);
  if (purchasing > 0) {
    const share = purchasing / revenue;
    findings.push({
      findingType: "purchasing_margin",
      title: "Indkøb og bruttoavance",
      description: `Vare-/indkøbsrelaterede konti svarer til ${pct(share)}% af omsætningen. Næste analyselag bør koble leverandør, prisudvikling, produktmix og bruttoavance for at forklare niveauet.`
    });
  }

  const recurring = concentrations.filter((x) => /abonnement|software|tele|forsikring|leasing|husleje|rent|subscription/.test(norm(x.account)));
  if (recurring.length) {
    const cost = recurring.reduce((s, x) => s + x.cost, 0);
    findings.push({
      findingType: "fixed_costs",
      title: "Faste og tilbagevendende omkostninger",
      description: `Genkendelige faste/tilbagevendende konti udgør ${cost.toFixed(2)} i perioden. Kontroller prisstigninger, brug, overlap og kontraktvilkår; dette er et observationsfund og ikke en antaget besparelse.`
    });
  }

  return findings;
}
