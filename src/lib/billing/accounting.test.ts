import { describe, expect, it } from "vitest";
import { previewDanishDomesticVat, validateAccountingEvent } from "./accounting";
describe("billing accounting foundation", () => {
 it("calculates domestic Danish illustrative VAT in integer minor units", () => {
   expect(previewDanishDomesticVat(99500)).toEqual({netMinor:99500,vatMinor:24875,grossMinor:124375,currency:"DKK",status:"illustrative_only"});
   expect(previewDanishDomesticVat(124750).grossMinor).toBe(155938);
 });
 it("rejects invalid and overflowing amounts", () => {
   expect(() => previewDanishDomesticVat(-1)).toThrow("invalid_net_amount");
   expect(() => previewDanishDomesticVat(0.5)).toThrow("invalid_net_amount");
   expect(() => previewDanishDomesticVat(Number.MAX_SAFE_INTEGER)).toThrow("amount_overflow");
 });
 it("rejects unbalanced invoices", () => {
   expect(() => validateAccountingEvent({type:"invoice_issued",providerEventId:"evt1",providerInvoiceId:"in1",currency:"DKK",netMinor:100,taxMinor:25,grossMinor:100})).toThrow("unbalanced_invoice");
 });
 it("accepts structurally valid events without posting journal entries", () => {
   const e={type:"payment_received" as const,providerEventId:"evt2",providerInvoiceId:"in1",currency:"DKK",amountMinor:125};
   expect(validateAccountingEvent(e)).toEqual(e);
 });
});
