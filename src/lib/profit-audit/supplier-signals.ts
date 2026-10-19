/** Deterministic invoice-line signals. Caller must enforce tenant isolation and only
 * supply verified same-currency, ex-VAT, normalized-unit data from one organization.
 * No cross-customer data sharing or invented market benchmarks.
 */
export type InvoiceLine = {id:string;supplierId:string;productKey:string;currency:string;unit:string;quantity:number;unitPrice:number;invoiceDate:string};
export type SupplierSignal = {kind:"price_increase"|"supplier_price_gap"|"recurring_purchase";productKey:string;currency:string;unit:string;supplierIds:string[];evidenceIds:string[];observation:string;potentialAnnualSaving:null;verifiedSaving:false};
const norm=(s:string)=>s.trim().toLocaleLowerCase("da-DK");
const finite=(n:number)=>Number.isFinite(n)&&n>=0;
const date=(s:string)=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s+"T00:00:00Z"))&&new Date(s+"T00:00:00Z").toISOString().slice(0,10)===s;
export function detectSupplierSignals(lines:InvoiceLine[]):SupplierSignal[]{
 if(lines.length>100000)throw new Error("too_many_invoice_lines");
 const groups=new Map<string,InvoiceLine[]>();
 const ids=new Set<string>();
 for(const line of lines){
  if(!line.id?.trim()||ids.has(line.id)||!line.supplierId?.trim()||!line.productKey?.trim()||!line.currency?.trim()||!line.unit?.trim()||!finite(line.unitPrice)||!Number.isFinite(line.quantity)||line.quantity<=0||!date(line.invoiceDate))throw new Error("invalid_invoice_line");
  ids.add(line.id);
  const key=[norm(line.productKey),line.currency.trim().toUpperCase(),norm(line.unit)].join("|");
  groups.set(key,[...(groups.get(key)??[]),line]);
 }
 const signals:SupplierSignal[]=[];
 for(const group of groups.values()){
  const sorted=[...group].sort((a,b)=>a.invoiceDate.localeCompare(b.invoiceDate)||a.id.localeCompare(b.id));
  const sample=sorted[0];
  const base={productKey:sample.productKey,currency:sample.currency.toUpperCase(),unit:sample.unit,potentialAnnualSaving:null,verifiedSaving:false as const};
  const suppliers=new Map<string,InvoiceLine[]>();
  for(const line of sorted)suppliers.set(line.supplierId,[...(suppliers.get(line.supplierId)??[]),line]);
  for(const [supplierId,history] of suppliers){
   if(history.length>=2){
    const first=history[0],last=history[history.length-1];
    if(first.invoiceDate<last.invoiceDate&&last.unitPrice>first.unitPrice){
     signals.push({...base,kind:"price_increase",supplierIds:[supplierId],evidenceIds:[first.id,last.id],observation:`Enhedsprisen steg fra ${first.unitPrice} til ${last.unitPrice} ${base.currency}/${base.unit} mellem ${first.invoiceDate} og ${last.invoiceDate}. Kontrollér rabatter, aftalevilkår og specifikation.`});
    }
    const uniqueMonths=new Set(history.map(x=>x.invoiceDate.slice(0,7)));
    if(uniqueMonths.size>=3)signals.push({...base,kind:"recurring_purchase",supplierIds:[supplierId],evidenceIds:history.map(x=>x.id),observation:`Køb registreret i ${uniqueMonths.size} forskellige måneder hos samme leverandør. Undersøg aftale og genbestillingsmønster.`});
   }
  }
  if(suppliers.size>=2){
   const supplierPrices=[...suppliers].map(([id,rows])=>({id,price:rows[rows.length-1].unitPrice,line:rows[rows.length-1]})).sort((a,b)=>a.price-b.price||a.id.localeCompare(b.id));
   const low=supplierPrices[0],high=supplierPrices[supplierPrices.length-1];
   if(high.price>low.price)signals.push({...base,kind:"supplier_price_gap",supplierIds:[low.id,high.id],evidenceIds:[low.line.id,high.line.id],observation:`Seneste observerede enhedspriser: ${low.price} og ${high.price} ${base.currency}/${base.unit}. Priser kan være fra forskellige datoer og er ikke et verificeret alternativt tilbud.`});
  }
 }
 return signals.sort((a,b)=>a.productKey.localeCompare(b.productKey)||a.kind.localeCompare(b.kind)||a.evidenceIds.join(",").localeCompare(b.evidenceIds.join(",")));
}
