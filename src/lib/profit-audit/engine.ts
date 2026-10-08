import type { AuditFinding, FinancialRow } from "@/lib/profit-audit/types";

function norm(value: string) {
  return value.toLocaleLowerCase("da-DK");
}

const money = (value: number) => new Intl.NumberFormat("da-DK", { style: "currency", currency: "DKK" }).format(value);

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
    description: `Omsætning: ${money(revenue)}. Omkostninger: ${money(totalCosts)}. Resultat: ${money(net)}. Resultatmargin: ${pct(margin)} %. Det er et regnskabsmæssigt udgangspunkt, ikke et dokumenteret forbedringspotentiale.`
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
      description: `${item.account} udgør ${pct(item.share)}% af alle omkostninger og ${pct(item.revenueShare)}% af omsætningen. Samlet bogført beløb: ${money(item.cost)}. Et scenarie med 1 procentpoint lavere omkostning i forhold til omsætningen svarer til ${money(revenue * 0.01)} i den analyserede periode, forudsat uændret omsætning. Dette er en følsomhedsberegning, ikke en dokumenteret besparelse. Undersøg prisudvikling, mængder, leverandører og kontering, før der vælges indsats.`
    });
  }

  const payroll = concentrations.filter((x) => /løn|loen|salary|wage|personale/.test(norm(x.account))).reduce((s, x) => s + x.cost, 0);
  if (payroll > 0) {
    const share = payroll / revenue;
    findings.push({
      findingType: "people_capacity",
      title: "Løn og kapacitet",
      description: `Lønrelaterede konti udgør ${pct(share)}% af omsætningen. Bogført lønbeløb: ${money(payroll)}. Sammenhold udviklingen med aktivitet, bemanding, overtid og produktivitet. Et fald på 1 procentpoint af omsætningen svarer matematisk til ${money(revenue * 0.01)} i perioden, men kan ikke forventes uden dokumenteret kapacitetsanalyse.`
    });
  }

  const purchasing = concentrations.filter((x) => /vare|indkøb|indkoeb|råvare|raavare|supplier|leverandør|leverandoer/.test(norm(x.account))).reduce((s, x) => s + x.cost, 0);
  if (purchasing > 0) {
    const share = purchasing / revenue;
    findings.push({
      findingType: "purchasing_margin",
      title: "Indkøb og bruttoavance",
      description: `Vare-/indkøbsrelaterede konti svarer til ${pct(share)}% af omsætningen. Bogført indkøb: ${money(purchasing)}. Undersøg leverandørpriser, produktmix, svind og bruttoavance. En reduktion på 1 % af indkøbsbeløbet svarer til ${money(purchasing * 0.01)} i perioden; det er alene et regneeksempel og kræver dokumentation.`
    });
  }

  const recurring = concentrations.filter((x) => /abonnement|software|tele|forsikring|leasing|husleje|rent|subscription/.test(norm(x.account)));
  if (recurring.length) {
    const cost = recurring.reduce((s, x) => s + x.cost, 0);
    findings.push({
      findingType: "fixed_costs",
      title: "Faste og tilbagevendende omkostninger",
      description: `Genkendelige faste/tilbagevendende konti udgør ${money(cost)} i perioden. Kontroller prisstigninger, brug, overlap og kontraktvilkår; dette er et observationsfund og ikke en antaget besparelse.`
    });
  }

  return findings;
}
