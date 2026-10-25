import {calculatePartnerCommissions,commissionLedgerKey,type Attribution,type PaidEvent,type CommissionLine} from "./commissions";
export type PaymentRecord=PaidEvent & {providerEventId:string;occurredAt:string};
export type ReconciliationResult={newEntries:CommissionLine[];skippedExisting:number;ignoredEvents:number};
/**
 * Prepares (does not persist) commission ledger entries from verified payment events.
 * All provider signature checks, account/customer attribution and atomic writes are
 * the responsibility of trusted server-side billing infrastructure.
 */
export function prepareCommissionLedger(
 events:PaymentRecord[],
 attributionByCustomer:ReadonlyMap<string,Attribution>,
 existingKeys:ReadonlySet<string>,
 eligibleAddons=true
):ReconciliationResult{
 const seen=new Set(existingKeys);
 const providerEvents=new Set<string>();
 const result:CommissionLine[]=[];
 let skippedExisting=0,ignoredEvents=0;
 for(const event of events){
  if(!event.providerEventId||!event.paymentId||!event.occurredAt||Number.isNaN(Date.parse(event.occurredAt)))
   throw new Error("invalid_payment_event");
  if(providerEvents.has(event.providerEventId)){ignoredEvents++;continue;}
  providerEvents.add(event.providerEventId);
  const attribution=attributionByCustomer.get(event.customerId);
  if(!attribution){ignoredEvents++;continue;}
  for(const entry of calculatePartnerCommissions(event,attribution,eligibleAddons)){
   const key=commissionLedgerKey(entry);
   if(seen.has(key)){skippedExisting++;continue;}
   seen.add(key);result.push(entry);
  }
 }
 return {newEntries:result,skippedExisting,ignoredEvents};
}
