import { describe, expect, it } from "vitest";
import { compareInvoiceLines, type InvoiceLine } from "./invoice-lines";
const base: InvoiceLine = {
  invoiceId:"INV-001", invoiceDate:"2026-01-12", supplier:"Supplier A",
  productKey:"tomatoes-grade-a", currency:"DKK", unit:"kg",
  quantity:100, unitPrice:30
};
describe("invoice line price comparisons", () => {
  it("compares equal baseline quantities at observed unit prices", () => {
    const result = compareInvoiceLines(base, {...base, invoiceId:"INV-002", supplier:"Supplier B", quantity:20, unitPrice:27});
    expect(result.comparison.currentTotal).toBe(3000);
    expect(result.comparison.alternativeTotal).toBe(2700);
    expect(result.comparison.potentialDifference).toBe(300);
    expect(result.comparison.verifiedSaving).toBe(false);
    expect(result.status).toBe("illustrative_only");
  });
  it("rejects inconsistent product specifications", () => {
    expect(() => compareInvoiceLines(base,{...base,productKey:"different"})).toThrow("non_comparable_supplier_quotes");
  });
  it("rejects missing invoice references and impossible dates", () => {
    expect(() => compareInvoiceLines(base,{...base,invoiceId:""})).toThrow("invalid_invoice_line");
    expect(() => compareInvoiceLines(base,{...base,invoiceDate:"2026-02-30"})).toThrow("invalid_invoice_line");
  });
  it("rejects invalid invoice quantities", () => {
    expect(() => compareInvoiceLines(base,{...base,quantity:0})).toThrow("invalid_invoice_line");
  });
});
