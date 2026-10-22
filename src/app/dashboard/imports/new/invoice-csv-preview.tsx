"use client";
import {useState} from "react";
import {previewInvoiceCsv} from "@/lib/profit-audit/invoice-csv-preview";
import {analyzeImportedInvoiceLines} from "@/lib/profit-audit/invoice-signal-adapter";
import type {CsvPreview} from "@/lib/profit-audit/invoice-csv-preview";
import type {SupplierSignal} from "@/lib/profit-audit/supplier-signals";
async function awaitFileBuffer(file: File): Promise<ArrayBuffer> { return file.arrayBuffer(); }
export default function InvoiceCsvPreview(){
 const [preview,setPreview]=useState<CsvPreview|null>(null);
 const [signals,setSignals]=useState<SupplierSignal[]>([]);
 const [error,setError]=useState("");
 async function onFile(file:File|undefined){
  setPreview(null);setSignals([]);setError("");
  if(!file)return;
  if(file.size>3_000_000){setError("Filen er for stor (maks. 3 MB).");return}
  try {
    const isExcel = /\.xlsx$/i.test(file.name);
    if (!isExcel && !/\.csv$/i.test(file.name)) throw new Error("unsupported_file");
    const parsed = isExcel
      ? await import("@/lib/profit-audit/invoice-excel-preview").then(m => m.previewInvoiceExcel(await awaitFileBuffer(file)))
      : previewInvoiceCsv(await file.text());
    setPreview(parsed);
  } catch {
    setError("Filen kunne ikke læses. Brug en CSV- eller XLSX-fil med de otte angivne kolonner, højst 10.000 rækker og uden Excel-formler.");
  }
 }
 function analyze(){
  if(!preview||preview.errors.length||!preview.rows.length)return;
  try{setSignals(analyzeImportedInvoiceLines(preview.rows))}catch{setError("Analysen kunne ikke gennemføres. Kontrollér fakturalinjerne.")}
 }
 return <section className="card" style={{marginTop:18}}>
  <h2>Fakturaanalyse · lokal CSV- og Excel-forhåndsvisning</h2>
  <p className="muted">Denne tidlige funktion læser filen i din browser. Den uploader eller gemmer ikke fakturalinjerne. Brug kun syntetiske eller anonymiserede testdata, indtil kundesikkerheden er godkendt.</p>
  <p className="muted">Kolonner i rækkefølge: invoiceId, invoiceDate, supplier, productKey, currency, unit, quantity, unitPrice. Dato: ÅÅÅÅ-MM-DD. Beløb ekskl. moms og ensartede enheder.</p>
  <label className="field">Vælg CSV- eller Excel-fil<input type="file" accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={e=>void onFile(e.target.files?.[0])}/></label>
  {error?<p role="alert">{error}</p>:null}
  {preview?<div><p><strong>{preview.rows.length}</strong> gyldige linjer · <strong>{preview.errors.length}</strong> fejl</p>
   {preview.errors.slice(0,20).map((e,i)=><p key={i} role="alert">Linje {e.row}: {e.message}</p>)}
   {preview.errors.length>20?<p>Viser kun de første 20 fejl.</p>:null}
   <button type="button" disabled={!!preview.errors.length||!preview.rows.length} onClick={analyze}>Analysér fakturalinjer i browseren</button>
   {signals.length?<div style={{marginTop:16}}><h3>{signals.length} observationer</h3>{signals.slice(0,100).map((s,i)=><article className="finding" key={i}><strong>{s.kind}</strong><p>{s.observation}</p><p className="muted">Dokumentation: {s.evidenceIds.join(", ")}. Ingen besparelse verificeret.</p></article>)}</div>:null}
  </div>:null}
 </section>;
}
