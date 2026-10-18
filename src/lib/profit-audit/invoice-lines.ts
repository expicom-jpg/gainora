import { compareSupplierQuotes, type SupplierQuote, type QuoteComparison } from "./supplier-comparison";

/** Explicit, normalized invoice line data. No extraction from ledger descriptions:
 * invoice prices, quantities and units must be provided by an actual invoice source.
 */
export type InvoiceLine = {
  invoiceId: string;
  invoiceDate: string;
  supplier: string;
  productKey: string;
  currency: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  deliveryCost?: number;
};
export type InvoiceComparison = {
  baselineInvoiceId: string;
  alternativeInvoiceId: string;
  comparison: QuoteComparison;
  status: "illustrative_only";
};
function quote(line: InvoiceLine, quantity: number): SupplierQuote {
  return {
    supplier: line.supplier, productKey: line.productKey,
    currency: line.currency, unit: line.unit,
    unitPrice: line.unitPrice, quantity,
    // Delivery cannot be prorated reliably across multiple lines.
    // A supplied line-level delivery amount is accepted as-is.
    deliveryCost: line.deliveryCost
  };
}
/** Compares equal quantities, using the baseline invoice quantity as the
 * scenario quantity. A quote comparison is never proof of achieved savings.
 */
export function compareInvoiceLines(baseline: InvoiceLine, alternative: InvoiceLine): InvoiceComparison {
  for (const line of [baseline, alternative]) {
    if (!line.invoiceId?.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(line.invoiceDate) ||
      !Number.isFinite(line.quantity) || line.quantity <= 0) {
      throw new Error("invalid_invoice_line");
    }
    const date = new Date(line.invoiceDate + "T00:00:00Z");
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0,10) !== line.invoiceDate) {
      throw new Error("invalid_invoice_line");
    }
  }
  return {
    baselineInvoiceId: baseline.invoiceId,
    alternativeInvoiceId: alternative.invoiceId,
    comparison: compareSupplierQuotes(quote(baseline, baseline.quantity), quote(alternative, baseline.quantity)),
    status: "illustrative_only"
  };
}
