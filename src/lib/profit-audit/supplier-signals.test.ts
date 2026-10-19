import {describe,it,expect} from "vitest";
import {detectSupplierSignals,type InvoiceLine} from "./supplier-signals";
const row=(id:string,supplierId:string,invoiceDate:string,unitPrice:number):InvoiceLine=>({id,supplierId,invoiceDate,unitPrice,quantity:1,productKey:"milk-1l",currency:"DKK",unit:"stk"});
describe("supplier signal engine",()=>{
 it("flags increases, recurring purchases and cross-supplier price gaps with evidence",()=>{
  const lines=[row("a","s1","2026-01-10",10),row("b","s1","2026-02-10",11),row("c","s1","2026-03-10",12),row("d","s2","2026-03-10",9)];
  const signals=detectSupplierSignals(lines);
  expect(signals.map(s=>s.kind)).toEqual(["price_increase","recurring_purchase","supplier_price_gap"].sort());
  expect(signals.every(s=>s.verifiedSaving===false&&s.potentialAnnualSaving===null&&s.evidenceIds.length>0)).toBe(true);
 });
 it("does not compare different currencies, products or units",()=>{
  const other={...row("b","s2","2026-02-10",4),currency:"EUR"};
  expect(detectSupplierSignals([row("a","s1","2026-01-10",10),other])).toEqual([]);
 });
 it("rejects duplicate ids and invalid prices",()=>{
  expect(()=>detectSupplierSignals([row("a","s1","2026-01-10",10),row("a","s2","2026-02-10",11)])).toThrow("invalid_invoice_line");
  expect(()=>detectSupplierSignals([row("a","s1","2026-01-10",-1)])).toThrow("invalid_invoice_line");
 });
});
