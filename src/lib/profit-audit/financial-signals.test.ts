import { describe, expect, it } from "vitest";
import { analyzeFinancialRows, costReductionScenario } from "./analysis";
import { generateRecommendations } from "./recommendations";

describe("Profit Audit evidence boundaries", () => {
  it("computes signed profit and account shares from imported rows", () => {
    const detail = analyzeFinancialRows([
      { account: "Sales", description: "", amount: 1000, transactionDate: "2026-01-01" },
      { account: "Vareforbrug", description: "", amount: -400, transactionDate: "2026-01-01" },
      { account: "Løn", description: "", amount: -200, transactionDate: "2026-01-01" }
    ]);
    expect(detail.revenue).toBe(1000);
    expect(detail.costs).toBe(600);
    expect(detail.profit).toBe(400);
    expect(detail.accounts.find(a => a.account === "Vareforbrug")?.shareOfCosts).toBeCloseTo(66.67, 2);
    const purchasing = generateRecommendations(detail).find(r => r.id === "purchasing");
    expect(purchasing?.signals.join(" ")).toContain("66,7 %");
    expect(purchasing?.scenario?.label).toContain("ikke et dokumenteret");
  });

  it("does not invent monthly variance from fewer than three valid months", () => {
    const detail = analyzeFinancialRows([
      { account: "Sales", description: "", amount: 1000, transactionDate: "2026-01-01" },
      { account: "Vareforbrug", description: "", amount: -400, transactionDate: "2026-01-01" },
      { account: "Sales", description: "", amount: 1000, transactionDate: "2026-02-01" },
      { account: "Vareforbrug", description: "", amount: -600, transactionDate: "2026-02-01" }
    ]);
    const signals = generateRecommendations(detail).find(r => r.id === "purchasing")?.signals ?? [];
    expect(signals).toHaveLength(1);
    expect(signals[0]).toContain("koncentration");
  });

  it("labels total-cost variance without attributing it to purchasing", () => {
    const detail = analyzeFinancialRows([
      { account: "Sales", description: "", amount: 1000, transactionDate: "2026-01-01" },
      { account: "Vareforbrug", description: "", amount: -200, transactionDate: "2026-01-01" },
      { account: "Sales", description: "", amount: 1000, transactionDate: "2026-02-01" },
      { account: "Vareforbrug", description: "", amount: -400, transactionDate: "2026-02-01" },
      { account: "Sales", description: "", amount: 1000, transactionDate: "2026-03-01" },
      { account: "Vareforbrug", description: "", amount: -300, transactionDate: "2026-03-01" }
    ]);
    const signals = generateRecommendations(detail).find(r => r.id === "purchasing")?.signals ?? [];
    expect(signals).toHaveLength(2);
    expect(signals[1]).toContain("alle omkostninger");
    expect(signals[1]).toContain("kan ikke tilskrives");
  });

  it("rejects invalid or unrealistic reduction scenarios", () => {
    expect(() => costReductionScenario(-1, 5)).toThrow("invalid_scenario");
    expect(() => costReductionScenario(100, 101)).toThrow("invalid_scenario");
    expect(() => costReductionScenario(Number.NaN, 1)).toThrow("invalid_scenario");
    expect(costReductionScenario(1000, 1)).toBe(10);
  });
});
