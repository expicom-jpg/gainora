import { describe, expect, it } from "vitest";
import { buildMarketBrief } from "./market-intelligence";
const indicator = { id: "input-prices", industry: "restaurant", metric: "råvarepriser", sourceName: "Officiel statistik", sourceUrl: "https://example.org/statistics", period: "2026-09", geography: "Danmark", retrievedAt: "2026-10-09", direction: "up", evidenceType: "observed", context: "Fiktivt eksempel, ikke aktuelle markedsdata." };
describe("market intelligence source gate", () => {
  it("does not invent market trends without sources", () => {
    const brief = buildMarketBrief("restaurant", [], "2026-10-10");
    expect(brief.signals).toHaveLength(0);
    expect(brief.recommendations).toHaveLength(0);
    expect(brief.warnings).toHaveLength(1);
  });
  it("requires a source and rejects cross-industry signals", () => {
    expect(buildMarketBrief("restaurant", [{ ...indicator, sourceUrl: "" }, { ...indicator, industry: "trades" }], "2026-10-10").signals).toHaveLength(0);
  });
  it("rejects stale or future-dated indicators", () => {
    expect(buildMarketBrief("restaurant", [{ ...indicator, retrievedAt: "2026-01-01" }, { ...indicator, retrievedAt: "2026-12-01" }], "2026-10-10").signals).toHaveLength(0);
  });
  it("retains sourced indicators as checks, not guaranteed savings", () => {
    const brief = buildMarketBrief("restaurant", [indicator], "2026-10-10");
    expect(brief.signals).toHaveLength(1);
    expect(brief.recommendations[0].certainty).toBe("check");
  });
});
