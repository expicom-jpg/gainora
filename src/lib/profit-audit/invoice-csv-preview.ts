import type {InvoiceLine} from "./invoice-lines";
export type CsvPreview={rows:InvoiceLine[];errors:{row:number;message:string}[]};
const fields=["invoiceId","invoiceDate","supplier","productKey","currency","unit","quantity","unitPrice"] as const;
function parseRecords(text:string):string[][]{
 const records:string[][]=[];let row:string[]=[];let field="";let quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'&&text[i+1]==='"'){field+='"';i++}else if(c==='"')quoted=false;else field+=c}
 else if(c==='"'){if(field!=="")throw new Error("invalid_csv_quote");quoted=true}
 else if(c===","||c===";"){row.push(field);field=""}
 else if(c==="\n"){row.push(field);records.push(row);row=[];field=""}
 else if(c!=="\r")field+=c}
 if(quoted)throw new Error("invalid_csv_quote");
 if(field!==""||row.length){row.push(field);records.push(row)}
 return records;
}
const number=(value:string)=>Number(value.trim().replace(",","."));
export function previewInvoiceCsv(text:string,maxRows=10000):CsvPreview{
 if(text.length>3_000_000)throw new Error("csv_too_large");
 const records=parseRecords(text.replace(/^\uFEFF/,""));
 if(!records.length)throw new Error("empty_csv");
 const header=records.shift()!.map(x=>x.trim());
 if(header.length!==fields.length||fields.some((f,i)=>header[i]!==f))throw new Error("invalid_csv_headers");
 if(records.length>maxRows)throw new Error("too_many_invoice_lines");
 const rows:InvoiceLine[]=[],errors:CsvPreview["errors"]=[];
 for(let i=0;i<records.length;i++){
  const cells=records[i];if(cells.length===1&&!cells[0].trim())continue;
  const row=i+2;
  if(cells.length!==fields.length){errors.push({row,message:"Forkert antal kolonner"});continue}
  const [invoiceId,invoiceDate,supplier,productKey,currency,unit,quantityText,priceText]=cells.map(x=>x.trim());
  const quantity=number(quantityText),unitPrice=number(priceText);
  const validDate=/^\d{4}-\d{2}-\d{2}$/.test(invoiceDate)&&!Number.isNaN(Date.parse(invoiceDate+"T00:00:00Z"))&&new Date(invoiceDate+"T00:00:00Z").toISOString().slice(0,10)===invoiceDate;
  if(!invoiceId||!supplier||!productKey||!currency||!unit||!validDate||!Number.isFinite(quantity)||quantity<=0||!Number.isFinite(unitPrice)||unitPrice<0){
   errors.push({row,message:"Ugyldig fakturalinje, dato, antal eller enhedspris"});continue;
  }
  rows.push({invoiceId,invoiceDate,supplier,productKey,currency,unit,quantity,unitPrice});
 }
 return {rows,errors};
}
