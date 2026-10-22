/** Pure partner commission logic. Amounts are integer minor currency units. */
export type PaidEvent={paymentId:string;customerId:string;currency:string;netAmountMinor:number;status:"paid"|"refunded"|"pending";product:"subscription"|"addon"|"other";isFirstQualifiedPayment?:boolean};
export type Attribution={directPartnerId:string;introducerPartnerId:string|null};
export type CommissionLine={paymentId:string;customerId:string;partnerId:string;level:1|2;currency:string;amountMinor:number;kind:"recurring"|"activation"};
const DIRECT_BPS=1000,INTRODUCER_BPS=200;
export function calculatePartnerCommissions(payment:PaidEvent,attribution:Attribution,allowAddon=true,activationBonusMinor=0):CommissionLine[]{
 if(!payment.paymentId||!payment.customerId||!attribution.directPartnerId||!payment.currency.match(/^[A-Z]{3}$/)) throw new Error("invalid_attribution");
 if(!Number.isSafeInteger(payment.netAmountMinor)||payment.netAmountMinor<0)throw new Error("invalid_amount");
 if(payment.status!=="paid"||payment.netAmountMinor===0||payment.product==="other"||(payment.product==="addon"&&!allowAddon))return [];
 if(attribution.introducerPartnerId===attribution.directPartnerId)throw new Error("self_introduction");
 const base={paymentId:payment.paymentId,customerId:payment.customerId,currency:payment.currency};
 const lines:CommissionLine[]=[{...base,partnerId:attribution.directPartnerId,level:1,amountMinor:Math.round(payment.netAmountMinor*DIRECT_BPS/10000),kind:"recurring"}];
 if(attribution.introducerPartnerId)lines.push({...base,partnerId:attribution.introducerPartnerId,level:2,amountMinor:Math.round(payment.netAmountMinor*INTRODUCER_BPS/10000),kind:"recurring"});
 if(payment.isFirstQualifiedPayment&&activationBonusMinor>0){
  if(!Number.isSafeInteger(activationBonusMinor))throw new Error("invalid_bonus");
  lines.push({...base,partnerId:attribution.directPartnerId,level:1,amountMinor:activationBonusMinor,kind:"activation"});
 }
 return lines.filter(line=>line.amountMinor>0);
}
export function commissionLedgerKey(line:CommissionLine){return [line.paymentId,line.partnerId,line.level,line.kind].join(":")}
