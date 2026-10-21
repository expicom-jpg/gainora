import { describe, expect, it } from "vitest";
import { previewInvoiceCsv } from "./invoice-csv-preview";

const header = "invoiceId,invoiceDate,supplier,productKey,currency,unit,quantity,unitPrice";
describe("previewInvoiceCsv", () => {
  it("parses comma-separated lines and quoted supplier names", () => {
    const result = previewInvoiceCsv(header + '\nINV-1,2026-10-01,"Firma, ApS",Kaffe,DKK,kg,2,89.50');
    expect(result.errors).toEqual([]);
    expect(result.rows[0]).toMatchObject({ supplier: "Firma, ApS", quantity: 2, unitPrice: 89.5 });
  });
  it("supports semicolon CSV with Danish decimal commas", () => {
    const result = previewInvoiceCsv(header.replaceAll(",", ";") + "\nINV-2;2026-10-02;Firma;Kaffe;DKK;kg;1,5;99,95");
    expect(result.errors).toEqual([]);
    expect(result.rows[0]).toMatchObject({ quantity: 1.5, unitPrice: 99.95 });
  });
  it("rejects missing numeric data rather than converting blank to zero", () => {
    const result = previewInvoiceCsv(header + "\nINV-3,2026-10-01,Firma,Kaffe,DKK,kg,1,");
    expect(result.rows).toHaveLength(0);
    expect(result.errors[0].row).toBe(2);
  });
  it("flags calendar-invalid date and records correct source row", () => {
    const result = previewInvoiceCsv(header + "\nINV-4,2026-02-30,Firma,Kaffe,DKK,kg,1,25");
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].row).toBe(2);
  });
  it("handles escaped quotes and multiline quoted data", () => {
    const result = previewInvoiceCsv(header + '\nINV-5,2026-10-01,"Firma ""Nord""\nApS",Kaffe,DKK,kg,1,25');
    expect(result.errors).toEqual([]);
    expect(result.rows[0].supplier).toBe('Firma "Nord"\nApS');
  });
  it("rejects unexpected headers and broken quoting", () => {
    expect(() => previewInvoiceCsv("wrong,header\na,b")).toThrow("invalid_csv_headers");
    expect(() => previewInvoiceCsv(header + '\n"unterminated')).toThrow("invalid_csv_quote");
  });
  it("caps the number of records", () => {
    expect(() => previewInvoiceCsv(header + "\nINV-1,2026-10-01,Firma,Kaffe,DKK,kg,1,1", 0)).toThrow("too_many_invoice_lines");
  });
});
