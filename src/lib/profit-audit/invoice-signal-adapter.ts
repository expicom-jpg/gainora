import {detectSupplierSignals,type SupplierSignal,type InvoiceLine as SignalLine} from "./supplier-signals";
import type {InvoiceLine} from "./invoice-lines";
/** Convert validated invoice-source lines into evidence-linked supplier signals.
 * Scope all input to one authorized organization BEFORE calling this function.
 * Do not infer unit prices from accounting ledger descriptions.
 */
export function analyzeImportedInvoiceLines(lines:InvoiceLine[]):SupplierSignal[]{
 const normalized:SignalLine[]=lines.map((line,index)=>({
  id:line.invoiceId+"#"+index,
  supplierId:line.supplier,
  productKey:line.productKey,
  currency:line.currency,
  unit:line.unit,
  quantity:line.quantity,
  unitPrice:line.unitPrice,
  invoiceDate:line.invoiceDate
 }));
 return detectSupplierSignals(normalized);
}
