"use client";
import {useMemo,useState} from "react";
import {analyzeImportedInvoiceLines} from "@/lib/profit-audit/invoice-signal-adapter";
import type {InvoiceLine} from "@/lib/profit-audit/invoice-lines";
const sample:InvoiceLine[]=[
 {invoiceId:"DEMO-101",invoiceDate:"2026-01-15",supplier:"Leverandør A",productKey:"kaffe-1kg",currency:"DKK",unit:"kg",quantity:12,unitPrice:80},
 {invoiceId:"DEMO-102",invoiceDate:"2026-02-15",supplier:"Leverandør A",productKey:"kaffe-1kg",currency:"DKK",unit:"kg",quantity:12,unitPrice:85},
 {invoiceId:"DEMO-103",invoiceDate:"2026-03-15",supplier:"Leverandør A",productKey:"kaffe-1kg",currency:"DKK",unit:"kg",quantity:12,unitPrice:92},
 {invoiceId:"DEMO-104",invoiceDate:"2026-03-16",supplier:"Leverandør B",productKey:"kaffe-1kg",currency:"DKK",unit:"kg",quantity:12,unitPrice:78}
];
const labels={price_increase:"Prisstigning",supplier_price_gap:"Prisforskel",recurring_purchase:"Gentaget indkøb"};
export default function SupplierAuditDemo(){
 const [show,setShow]=useState(false);
 const signals=useMemo(()=>analyzeImportedInvoiceLines(sample),[]);
 return <section className="card" style={{marginTop:18}}>
  <div className="eyebrow">Profit Audit · leverandøranalyse</div>
  <h2>Se hvordan Gainora finder indkøbsmuligheder</h2>
  <p className="muted">Interaktiv demonstration med fire syntetiske fakturalinjer. Ingen rigtige kundedata eller live leverandørpriser.</p>
  <button type="button" onClick={()=>setShow(x=>!x)} aria-expanded={show}>{show?"Skjul leverandørfund":"Analysér demo-fakturaer"}</button>
  {show?<div style={{marginTop:16}}>
   <p><strong>{signals.length} observationer</strong> med sporbar dokumentation</p>
   {signals.map((signal,index)=><article className="finding" key={signal.kind+"-"+index} style={{marginTop:12}}>
    <h3>{labels[signal.kind]} · {signal.productKey}</h3>
    <p>{signal.observation}</p>
    <p><strong>Fakturalinjer:</strong> {signal.evidenceIds.join(", ")}</p>
    <p className="muted">Kræver manuel kontrol af produktspecifikation, moms, levering og aftalevilkår. Ingen besparelse er verificeret.</p>
   </article>)}
  </div>:null}
 </section>;
}
