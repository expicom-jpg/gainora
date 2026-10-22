import {describe,it,expect} from "vitest";
import {calculatePartnerCommissions,commissionLedgerKey} from "./commissions";
const payment={paymentId:"pay-1",customerId:"org-1",currency:"DKK",netAmountMinor:249500,status:"paid" as const,product:"subscription" as const};
const attribution={directPartnerId:"agency",introducerPartnerId:"association"};
describe("Partner Hub recurring two-tier commissions",()=>{
 it("pays 10 percent direct and 2 percent to introducing organization on verified payments",()=>{
  const result=calculatePartnerCommissions(payment,attribution);
  expect(result.map(x=>x.amountMinor)).toEqual([24950,4990]);
  expect(result[1].partnerId).toBe("association");
 });
 it("accepts recurring payments for years without a six-month cap",()=>{
  expect(calculatePartnerCommissions({...payment,paymentId:"pay-yr3"},attribution)).toHaveLength(2);
 });
 it("includes eligible recurring add-on upsells but never unrelated charges",()=>{
  expect(calculatePartnerCommissions({...payment,product:"addon"},attribution)).toHaveLength(2);
  expect(calculatePartnerCommissions({...payment,product:"addon"},attribution,false)).toEqual([]);
  expect(calculatePartnerCommissions({...payment,product:"other"},attribution)).toEqual([]);
 });
 it("refuses pending, refunded and zero payments",()=>{
  expect(calculatePartnerCommissions({...payment,status:"pending"},attribution)).toEqual([]);
  expect(calculatePartnerCommissions({...payment,status:"refunded"},attribution)).toEqual([]);
  expect(calculatePartnerCommissions({...payment,netAmountMinor:0},attribution)).toEqual([]);
 });
 it("pays one-time bonus only on marked first paid subscription",()=>{
  expect(calculatePartnerCommissions({...payment,isFirstQualifiedPayment:true},attribution,true,150000).map(x=>x.amountMinor)).toEqual([24950,4990,150000]);
  expect(calculatePartnerCommissions(payment,attribution,true,150000)).toHaveLength(2);
 });
 it("does not allow commission to the same introducer twice",()=>{
  expect(()=>calculatePartnerCommissions(payment,{directPartnerId:"agency",introducerPartnerId:"agency"})).toThrow("self_introduction");
  expect(new Set(calculatePartnerCommissions(payment,attribution).map(commissionLedgerKey)).size).toBe(2);
 });
 it("rejects invalid amounts",()=>expect(()=>calculatePartnerCommissions({...payment,netAmountMinor:NaN},attribution)).toThrow("invalid_amount"));
});
