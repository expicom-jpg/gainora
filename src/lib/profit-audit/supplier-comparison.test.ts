import { describe, expect, it } from "vitest";
import { compareSupplierQuotes, type SupplierQuote } from "./supplier-comparison";
const current: SupplierQuote = { supplier: "A", productKey: "tomater-klasse-1", currency: "DKK", unit: "kg", unitPrice: 30, quantity: 100, deliveryCost: 100 };
describe("supplier quote comparison", () => {
  it("calculates a signed difference including delivery and never calls it verified", () => {
    const result = compareSupplierQuotes(current, {...current, supplier: "B", unitPrice: 27, deliveryCost: 200});
    expect(result.currentTotal).toBe(3100);
    expect(result.alternativeTotal).toBe(2900);
    expect(result.potentialDifference).toBe(200);
    expect(result.verifiedSaving).toBe(false);
  });
  it("shows a negative difference when the alternative costs more", () => {
    expect(compareSupplierQuotes(current, {...current, supplier: "B", unitPrice: 40}).potentialDifference).toBe(-1000);
  });
  it("rejects different product, unit, currency or quantity", () => {
    for (const patch of [{productKey:"different"}, {unit:"stk"}, {currency:"EUR"}, {quantity:50}]) {
      expect(() => compareSupplierQuotes(current, {...current, ...patch})).toThrow("non_comparable_supplier_quotes");
    }
  });
  it("rejects negative, missing or non-finite price inputs", () => {
    expect(() => compareSupplierQuotes(current, {...current, unitPrice: -1})).toThrow("invalid_supplier_quote");
    expect(() => compareSupplierQuotes(current, {...current, unitPrice: Number.NaN})).toThrow("invalid_supplier_quote");
    expect(() => compareSupplierQuotes(current, {...current, deliveryCost: -1})).toThrow("invalid_supplier_quote");
  });
});
