import type { AuditFinding, FinancialRow } from "@/lib/profit-audit/types";

export function runProfitAudit(rows: FinancialRow[]): AuditFinding[] {
  const findings: AuditFinding[] = [];

  const revenue = rows
    .filter((row) => row.amount > 0)
    .reduce((sum, row) => sum + row.amount, 0);

  const costRows = rows.filter((row) => row.amount < 0);
  const totalCosts = Math.abs(costRows.reduce((sum, row) => sum + row.amount, 0));
  const net = revenue - totalCosts;

  findings.push({
    findingType: "financial_summary",
    title: "Financial baseline",
    description:
      `Imported period: revenue ${revenue.toFixed(2)}, costs ${totalCosts.toFixed(2)}, net ${net.toFixed(2)}.`
  });

  if (totalCosts <= 0) return findings;

  const byAccount = new Map<string, number>();

  for (const row of costRows) {
    byAccount.set(row.account, (byAccount.get(row.account) ?? 0) + Math.abs(row.amount));
  }

  const concentrations = [...byAccount.entries()]
    .map(([account, cost]) => ({
      account,
      cost,
      share: cost / totalCosts
    }))
    .filter((item) => item.share >= 0.15)
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 3);

  for (const item of concentrations) {
    findings.push({
      findingType: "cost_concentration",
      title: `Review cost concentration: ${item.account}`,
      description:
        `${item.account} represents ${(item.share * 100).toFixed(1)}% of imported costs. Review pricing, contracts, usage and alternatives before assigning a savings target.`
    });
  }

  return findings;
}
