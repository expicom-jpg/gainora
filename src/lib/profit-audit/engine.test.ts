import { describe, expect, it } from "vitest";
import { runProfitAudit } from "./engine";

describe("Profit Audit engine", () => {
  it("creates a baseline and identifies concentrated costs", () => {
    const findings = runProfitAudit([
      { account: "Revenue", description: "Sale", amount: 1000 },
      { account: "Food cost", description: "Supplier", amount: -300 },
      { account: "Rent", description: "Rent", amount: -100 }
    ]);

    expect(findings.some((finding) => finding.findingType === "financial_summary")).toBe(true);
    expect(findings.some((finding) => finding.findingType === "cost_concentration")).toBe(true);
  });

  it("creates a financial baseline even when no costs exist", () => {
    const findings = runProfitAudit([
      { account: "Revenue", description: "Sale", amount: 1000 }
    ]);

    expect(findings).toHaveLength(1);
    expect(findings[0].findingType).toBe("financial_summary");
  });
});
