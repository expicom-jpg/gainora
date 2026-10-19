import {describe,it,expect} from "vitest";
import {analyzeImportedInvoiceLines} from "./invoice-signal-adapter";
import type {InvoiceLine} from "./invoice-lines";
const line=(invoiceId:string,invoiceDate:string,supplier:string,unitPrice:number):InvoiceLine=>({invoiceId,invoiceDate,supplier,unitPrice,quantity:10,productKey:"sku-1",currency:"DKK",unit:"stk"});
describe("invoice signal adapter",()=>{
 it("uses invoice ids as evidence and detects supplier price changes",()=>{
  const result=analyzeImportedInvoiceLines([line("inv-1","2026-01-10","supplier-a",10),line("inv-2","2026-02-10","supplier-a",12)]);
  expect(result).toHaveLength(1);
  expect(result[0].kind).toBe("price_increase");
  expect(result[0].evidenceIds).toEqual(["inv-1#0","inv-2#1"]);
  expect(result[0].verifiedSaving).toBe(false);
 });
 it("rejects malformed invoice dates",()=>{
  expect(()=>analyzeImportedInvoiceLines([line("inv-1","2026-02-30","supplier-a",10)])).toThrow("invalid_invoice_line");
 });
});
