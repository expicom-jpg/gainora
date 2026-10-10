import { describe, expect, it } from "vitest";
import { FIXED_DEMO, syntheticPrompt, validateSyntheticExplanation } from "./synthetic-explanation";

const valid = { summary: "Fiktiv demo med 18 % margin.", observations: [{ evidenceId: "profit", explanation: "Resultatet er 36000 DKK.", nextStep: "Kontrollér de underliggende poster." }], caveat: "Ingen dokumenterede besparelser." };
describe("synthetic AI explanation safety", () => {
  it("uses only fixed, synthetic data", () => {
    expect(FIXED_DEMO.synthetic).toBe(true);
    expect(syntheticPrompt()).toContain("fiktiv");
    expect(syntheticPrompt()).toContain("200000");
  });
  it("accepts bounded evidence-linked explanations", () => expect(validateSyntheticExplanation(valid)).toEqual(valid));
  it("rejects unsupported amounts", () => expect(() => validateSyntheticExplanation({ ...valid, summary: "Du sparer 50000 DKK." })).toThrow("ai_unsupported_number"));
  it("rejects unknown evidence IDs", () => expect(() => validateSyntheticExplanation({ ...valid, observations: [{ ...valid.observations[0], evidenceId: "customer" }] })).toThrow());
  it("rejects unexpected fields", () => expect(() => validateSyntheticExplanation({ ...valid, customerName: "Secret" })).toThrow());
  it("rejects empty and oversized explanations", () => expect(() => validateSyntheticExplanation({ ...valid, summary: "x".repeat(501) })).toThrow());
});
