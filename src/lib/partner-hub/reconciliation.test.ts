import {describe,it,expect} from "vitest";
import {prepareCommissionLedger} from "./reconciliation";
import {commissionLedgerKey} from "./commissions";
const attribution=new Map([["customer-a",{directPartnerId:"agency",introducerPartnerId:"association"}]]);
const paid={providerEventId:"evt-1",paymentId:"pmt-1",customerId:"customer-a",currency:"DKK",netAmountMinor:249500,status:"paid" as const,product:"subscription" as const,occurredAt:"2026-10-22T12:00:00Z"};
describe("commission ledger preparation",()=>{
 it("creates two correct beneficiary entries from a validated paid record",()=>{
  const result=prepareCommissionLedger([paid],attribution,new Set());
  expect(result.newEntries.map(x=>x.amountMinor)).toEqual([24950,4990]);
 });
 it("is idempotent across webhook retries",()=>{
  const first=prepareCommissionLedger([paid],attribution,new Set());
  expect(prepareCommissionLedger([paid,paid],attribution,new Set(first.newEntries.map(commissionLedgerKey))).newEntries).toEqual([]);
 });
 it("does not allocate unmatched clients or pending payments",()=>{
  expect(prepareCommissionLedger([{...paid,customerId:"unassigned"}],attribution,new Set()).newEntries).toEqual([]);
  expect(prepareCommissionLedger([{...paid,status:"pending"}],attribution,new Set()).newEntries).toEqual([]);
 });
 it("reconciles verified add-on billing with distinct payment identifiers",()=>{
  const result=prepareCommissionLedger([paid,{...paid,providerEventId:"evt-2",paymentId:"pmt-2",product:"addon"}],attribution,new Set());
  expect(result.newEntries).toHaveLength(4);
 });
 it("rejects malformed provider events",()=>{
  expect(()=>prepareCommissionLedger([{...paid,providerEventId:""}],attribution,new Set())).toThrow("invalid_payment_event");
 });
});
