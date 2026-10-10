"use client";
import { useState } from "react";
import type { AuditDetail } from "@/lib/profit-audit/analysis";
import type { Recommendation } from "@/lib/profit-audit/recommendations";
const dkk=(n:number)=>new Intl.NumberFormat("da-DK",{style:"currency",currency:"DKK",maximumFractionDigits:2}).format(n);
const percent=(n:number)=>new Intl.NumberFormat("da-DK",{maximumFractionDigits:2}).format(n)+" %";
export function FindingDetail({organizationId,importId,findingType,title}:{organizationId:string;importId:string;findingType:string;title:string}){
 const[open,setOpen]=useState(false),[loading,setLoading]=useState(false),[error,setError]=useState(""),[analysis,setAnalysis]=useState<AuditDetail|null>(null),[recommendations,setRecommendations]=useState<Recommendation[]>([]);
 async function toggle(){
  if(open){setOpen(false);return}
  setOpen(true);
  if(analysis)return;
  setLoading(true);setError("");
  try{
   const response=await fetch("/api/profit-audit/detail?"+new URLSearchParams({organizationId,importId}));
   if(!response.ok)throw new Error("Analysen kunne ikke indlæses. Kontrollér adgang og datagrundlag.");
   const result=await response.json() as {analysis:AuditDetail;recommendations?:Recommendation[]};
   setAnalysis(result.analysis);setRecommendations(result.recommendations??[]);
  }catch(e){setError(e instanceof Error?e.message:"Ukendt fejl")}finally{setLoading(false)}
 }
 const related=analysis?.accounts.filter(a=>title.toLocaleLowerCase("da-DK").includes(a.account.toLocaleLowerCase("da-DK")));
 const accounts=related?.length?related:analysis?.accounts.slice(0,8);
 return <div style={{marginTop:12}}>
  <button type="button" className="secondary" aria-expanded={open} onClick={toggle}>{open?"Luk detaljer":"Se løsninger, handlinger og økonomisk analyse"}</button>
  {open?<div style={{marginTop:16,overflowWrap:"anywhere"}}>
   {loading?<p className="muted">Beregner analysen…</p>:null}
   {error?<p role="alert">{error}</p>:null}
   {analysis?<div>
    <h3>Dokumenteret økonomisk grundlag</h3>
    <p className="muted">Tal fra den importerede periode. Analysen viser sammenhænge, ikke dokumenterede årsager eller besparelser.</p>
    <div className="grid">
     <p><strong>Omsætning</strong><br/>{dkk(analysis.revenue)}</p>
     <p><strong>Omkostninger</strong><br/>{dkk(analysis.costs)}</p>
     <p><strong>Resultat</strong><br/>{dkk(analysis.profit)}</p>
     <p><strong>Resultatmargin</strong><br/>{percent(analysis.marginPct)}</p>
    </div>
    <h3>Omkostninger fordelt på konti</h3>
    <div style={{overflowX:"auto"}}><table style={{width:"100%",textAlign:"left"}}>
     <thead><tr><th scope="col">Konto</th><th scope="col">Beløb</th><th scope="col">Andel af omkostninger</th></tr></thead>
     <tbody>{accounts?.map(a=><tr key={a.account}><td>{a.account}</td><td>{dkk(a.amount)}</td><td>{percent(a.shareOfCosts)}</td></tr>)}</tbody>
    </table></div>
    <h3>Udvikling måned for måned</h3>
    {analysis.monthly.length?<div style={{overflowX:"auto"}}><table style={{width:"100%",textAlign:"left"}}>
     <thead><tr><th scope="col">Måned</th><th scope="col">Omsætning</th><th scope="col">Omkostninger</th><th scope="col">Resultat</th></tr></thead>
     <tbody>{analysis.monthly.map(m=><tr key={m.month}><td>{m.month}</td><td>{dkk(m.revenue)}</td><td>{dkk(m.costs)}</td><td>{dkk(m.profit)}</td></tr>)}</tbody>
    </table></div>:<p className="muted">Ingen månedsfordeling tilgængelig.</p>}
    <h3>Konkrete forbedringsmuligheder</h3>
    {recommendations.filter(r=>findingType==="financial_summary"||(findingType==="purchasing_margin"&&r.id==="purchasing")||(findingType==="people_capacity"&&r.id==="payroll")||(findingType==="fixed_costs"&&r.id==="recurring")||(findingType==="cost_concentration"&&title.toLocaleLowerCase("da-DK").includes(r.id==="purchasing"?"vare":r.id==="payroll"?"løn":"abonnement"))).map(r=><section key={r.id} className="finding" style={{marginTop:12}}><h4>{r.title}</h4><p>{r.observation}</p><strong>Sådan kommer I videre</strong><ol>{r.actions.map(a=><li key={a}>{a}</li>)}</ol><p><strong>Konkret leverance:</strong> {r.deliverable}</p><p><strong>Før kunden beslutter sig:</strong> {r.decisionGate}</p><strong>Data der skal bruges</strong><ul>{r.dataNeeded.map(d=><li key={d}>{d}</li>)}</ul>{r.scenario?<p><strong>Illustrativt scenarie:</strong> {dkk(r.scenario.potential)} ved {r.scenario.reductionPct} % reduktion af {dkk(r.scenario.baseAmount)}. {r.scenario.label}</p>:null}<p><strong>Sådan måles resultatet:</strong> {r.validation}</p></section>)}
    <h3>Næste handling</h3>
    <p>{findingType==="cost_concentration"?"Undersøg fakturaer, leverandørpriser og aftaler for den fremhævede konto. Sammenlign med tidligere perioder, før der fastsættes et besparelsesmål.":findingType==="people_capacity"?"Sammenhold lønomkostninger med bemanding, timer og aktivitet. Uden aktivitetsdata kan produktivitet ikke fastslås.":findingType==="purchasing_margin"?"Sammenlign indkøbspriser, leverandører og vareforbrug med salg og produktmix.":"Kontrollér datagrundlaget og undersøg væsentlige udsving, før en konkret forbedring besluttes."}</p>
    <h3>Forbehold og dokumentation</h3>
    <ul>{analysis.caveats.map(c=><li key={c}>{c}</li>)}</ul>
   </div>:null}
  </div>:null}
 </div>
}
