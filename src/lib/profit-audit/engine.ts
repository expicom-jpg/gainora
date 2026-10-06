import type { AuditFinding, FinancialRow } from "@/lib/profit-audit/types";

export function runProfitAudit(rows: FinancialRow[]): AuditFinding[] {
  const findings: AuditFinding[] = [];

  const negativeRows = rows.filter((row) => row.amount < 0);
  const totalCosts = Math.abs(negativeRows.reduce((sum, row) => sum + row.amount, 0));

  if (totalCosts > 0) {
    findings.push({
      findingType: "cost_base",
      title: "Cost base identified",
      description: "Gainora identified the current cost base for further category analysis.",
      estimatedAnnualValue: 0
    });
  }

  return findings;
}
