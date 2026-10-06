import { describe, expect, it } from "vitest";
import { parseCsv } from "./file-parser";

describe("CSV parser", () => {
  it("parses quoted commas and escaped quotes", () => {
    const rows = parseCsv(
      'Dato,Konto,Beskrivelse,Beløb\n2026-01-01,1000,"Salg, butik","1250"\n2026-01-02,2000,"Kunde ""A""","-50"'
    );

    expect(rows).toHaveLength(2);
    expect(rows[0]["Beskrivelse"]).toBe("Salg, butik");
    expect(rows[1]["Beskrivelse"]).toBe('Kunde "A"');
  });
});
