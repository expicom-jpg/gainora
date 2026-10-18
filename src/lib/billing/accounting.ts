/** Display-only Danish domestic VAT illustration. Never use this function to
 * determine tax jurisdiction or produce a legally valid invoice.
 * Live VAT must come from a configured tax engine and verified customer data.
 */
export const DK_STANDARD_VAT_RATE = 0.25;
export type DomesticVatPreview = {
  netMinor: number;
  vatMinor: number;
  grossMinor: number;
  currency: "DKK";
  status: "illustrative_only";
};
export function previewDanishDomesticVat(netMinor: number): DomesticVatPreview {
  if (!Number.isSafeInteger(netMinor) || netMinor < 0) throw new Error("invalid_net_amount");
  const vatMinor = Math.round(netMinor * DK_STANDARD_VAT_RATE);
  if (!Number.isSafeInteger(vatMinor) || !Number.isSafeInteger(netMinor + vatMinor)) throw new Error("amount_overflow");
  return { netMinor, vatMinor, grossMinor: netMinor + vatMinor, currency:"DKK", status:"illustrative_only" };
}
export type BillingAccountingEvent =
  | {type:"invoice_issued";providerEventId:string;providerInvoiceId:string;currency:string;netMinor:number;taxMinor:number;grossMinor:number}
  | {type:"payment_received";providerEventId:string;providerInvoiceId:string;currency:string;amountMinor:number}
  | {type:"credit_note_issued";providerEventId:string;providerInvoiceId:string;providerCreditNoteId:string;currency:string;amountMinor:number}
  | {type:"payment_refunded";providerEventId:string;providerInvoiceId:string;currency:string;amountMinor:number};
/** Structural checks only. Does not post journals or classify VAT. */
export function validateAccountingEvent(event: BillingAccountingEvent): BillingAccountingEvent {
  if (!event.providerEventId.trim() || !event.providerInvoiceId.trim() ||
    !/^[A-Z]{3}$/.test(event.currency)) throw new Error("invalid_accounting_event");
  const amounts = event.type === "invoice_issued"
    ? [event.netMinor,event.taxMinor,event.grossMinor]
    : [event.amountMinor];
  if (amounts.some(amount => !Number.isSafeInteger(amount) || amount < 0)) throw new Error("invalid_accounting_event");
  if (event.type === "invoice_issued" && event.netMinor + event.taxMinor !== event.grossMinor) throw new Error("unbalanced_invoice");
  if (event.type === "credit_note_issued" && !event.providerCreditNoteId.trim()) throw new Error("invalid_accounting_event");
  return event;
}
