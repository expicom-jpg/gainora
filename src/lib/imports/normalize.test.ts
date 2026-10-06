import { describe, expect, it } from "vitest";
import { normalizeImportRows } from "./normalize";

describe("normalizeImportRows", () => {
  const mapping = {
    date: "Dato",
    account: "Konto",
    description: "Beskrivelse",
    amount: "Beløb"
  } as const;

  it("normalizes mapped rows", () => {
    const rows = normalizeImportRows(
      [
        {
          Dato: "2026-10-01",
          Konto: "1000",
          Beskrivelse: "Salg",
          Beløb: "1250.50"
        }
      ],
      mapping
    );

    expect(rows).toEqual([
      {
        date: "2026-10-01",
        account: "1000",
        description: "Salg",
        amount: 1250.5
      }
    ]);
  });

  it("throws with the spreadsheet row number when a row is invalid", () => {
    expect(() =>
      normalizeImportRows(
        [
          {
            Dato: "",
            Konto: "1000",
            Beskrivelse: "Salg",
            Beløb: "1250"
          }
        ],
        mapping
      )
    ).toThrow("INVALID_ROW:2");
  });
});
