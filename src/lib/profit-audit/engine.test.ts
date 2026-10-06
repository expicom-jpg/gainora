import { describe, expect, it } from "vitest";
import { runProfitAudit } from "./engine";

describe("Profit Audit engine", () => {
  it("identifies a cost base when negative financial rows exist", () => {
    const findings = runProfitAudit([
      { account: "Revenue", description: "Sale", amount: 1000 },
      { account: "Food cost", description: "Supplier", amount: -300 }
    ]);

    expect(findings.some((finding) => finding.findingType === "cost_base")).toBe(true);
  });

  it("does not create a cost-base finding without costs", () => {
    const findings = runProfitAudit([
      { account: "Revenue", description: "Sale", amount: 1000 }
    ]);

    expect(findings).toHaveLength(0);
  });
});
