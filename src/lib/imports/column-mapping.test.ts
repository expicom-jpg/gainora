import { describe, expect, it } from "vitest";
import { suggestColumnMapping, hasRequiredMapping } from "./column-mapping";

describe("column mapping", () => {
  it("maps common Danish financial headers", () => {
    const mapping = suggestColumnMapping(["Dato", "Konto", "Beskrivelse", "Beløb"]);

    expect(mapping).toEqual({
      date: "Dato",
      account: "Konto",
      description: "Beskrivelse",
      amount: "Beløb"
    });
    expect(hasRequiredMapping(mapping)).toBe(true);
  });

  it("does not report a complete mapping when amount is missing", () => {
    const mapping = suggestColumnMapping(["Dato", "Konto", "Beskrivelse"]);
    expect(hasRequiredMapping(mapping)).toBe(false);
  });
});
