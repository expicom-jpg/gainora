"use client";
import {FormEvent,useEffect,useMemo,useState} from "react";
import {FindingDetail} from "./finding-detail";
type Org={organization:{id:string;name:string}|null};
type Finding={id:string;import_id:string;finding_type:string;title:string;description:string;status:string;estimated_annual_value:number|null};
type Filter="all"|"identified"|"approved"|"rejected";
const statusLabel:Record<string,string>={identified:"Ny",approved:"Godkendt",rejected:"Afvist",implemented:"Gennemført"};
const typeLabel:Record<string,string>={financial_summary:"Overblik",cost_concentration:"Omkostninger",people_capacity:"Personale",purchasing_margin:"Indkøb",fixed_costs:"Faste udgifter"};
export default function OpportunitiesPage(){
 const[organizations,setOrganizations]=useState<Org[]>([]);
 const[organizationId,setOrganizationId]=useState("");
 const[findings,setFindings]=useState<Finding[]>([]);
 const[filter,setFilter]=useState<Filter>("identified");
 const[activeId,setActiveId]=useState("");
 const[search,setSearch]=useState("");
 const[loading,setLoading]=useState(false);
 const[title,setTitle]=useState("");
 const[baselineValue,setBaselineValue]=useState("");
 const[resultValue,setResultValue]=useState("");
 const[attributedValue,setAttributedValue]=useState("");
 const[notes,setNotes]=useState("");
 const[resultId,setResultId]=useState("");
 const[message,setMessage]=useState<string|null>(null);
 useEffect(()=>{fetch("/api/organizations").then(r=>r.json()).then(d=>{const items=(d.organizations??[]) as Org[];setOrganizations(items);if(items[0]?.organization?.id)setOrganizationId(items[0].organization.id)}).catch(()=>setMessage("Virksomheder kunne ikke indlæses."))},[]);
 useEffect(()=>{if(!organizationId){setFindings([]);return}let cancelled=false;fetch("/api/findings?organizationId="+encodeURIComponent(organizationId)).then(r=>{if(!r.ok)throw new Error();return r.json()}).then(d=>{if(!cancelled){setFindings(d.findings??[]);setActiveId("")}}).catch(()=>{if(!cancelled)setMessage("Fund kunne ikke indlæses.")});return()=>{cancelled=true}},[organizationId]);
 const visible=useMemo(()=>findings.filter(f=>(filter==="all"||f.status===filter)&&(f.title+" "+f.description).toLocaleLowerCase("da-DK").includes(search.toLocaleLowerCase("da-DK"))).sort((a,b)=>Number(a.finding_type==="financial_summary")-Number(b.finding_type==="financial_summary")),[findings,filter,search]);
 const active=visible.find(f=>f.id===activeId)??null;
 const counts={all:findings.length,identified:findings.filter(f=>f.status==="identified").length,approved:findings.filter(f=>f.status==="approved").length,rejected:findings.filter(f=>f.status==="rejected").length};
 async function setStatus(id:string,status:"approved"|"rejected"){
  setLoading(true);setMessage(null);
  try{const r=await fetch("/api/findings",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({findingId:id,organizationId,status})});const d=await r.json();if(!r.ok)throw new Error(d.error??"Kunne ikke opdatere fund");setFindings(current=>current.map(f=>f.id===id?{...f,status}:f));setActiveId("");setMessage(status==="approved"?"Fundet er godkendt.":"Fundet er afvist.")}catch(e){setMessage(e instanceof Error?e.message:"Fejl")}finally{setLoading(false)}
 }
 async function recordResult(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setLoading(true);setMessage(null);
  try{const r=await fetch("/api/results",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({organizationId,findingId:resultId,title,baselineValue:baselineValue===""?undefined:Number(baselineValue),resultValue:resultValue===""?undefined:Number(resultValue),attributedValue:attributedValue===""?undefined:Number(attributedValue),notes})});const d=await r.json();if(!r.ok)throw new Error(d.error??"Kunne ikke gemme resultat");setMessage("Resultatet er dokumenteret.");setResultId("");setTitle("");setBaselineValue("");setResultValue("");setAttributedValue("");setNotes("")}catch(e){setMessage(e instanceof Error?e.message:"Fejl")}finally{setLoading(false)}
 }
 return <main className="page">
  <div className="eyebrow">Profit Intelligence</div><h1>Muligheder & resultater</h1>
  <p className="lead">Vælg et fund i oversigten, se dokumentationen og beslut næste skridt. Du behøver ikke åbne alle fund.</p>
  <section className="card"><label className="field">Virksomhed<select value={organizationId} onChange={e=>setOrganizationId(e.target.value)}><option value="">Vælg virksomhed</option>{organizations.map(o=>o.organization?<option key={o.organization.id} value={o.organization.id}>{o.organization.name}</option>:null)}</select></label>{message?<p role="status" className="notice" style={{marginTop:12}}>{message}</p>:null}</section>
  <section className="card" style={{marginTop:18}}>
   <h2>Overblik</h2>
   <div className="actions" style={{gap:8,flexWrap:"wrap"}}>{(["identified","approved","all","rejected"] as Filter[]).map(k=><button type="button" key={k} className={filter===k?"":"secondary"} onClick={()=>{setFilter(k);setActiveId("")}} aria-pressed={filter===k}>{k==="identified"?"Nye":k==="approved"?"Godkendte":k==="rejected"?"Afviste":"Alle"} ({counts[k]})</button>)}</div>
   <label className="field" style={{marginTop:16}}>Find et fund<input type="search" value={search} placeholder="Søg i titel eller beskrivelse" onChange={e=>{setSearch(e.target.value);setActiveId("")}}/></label>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,320px),1fr))",gap:18,marginTop:18,alignItems:"start"}}>
    <div aria-label="Liste over fund" style={{maxHeight:540,overflowY:"auto",border:"1px solid var(--line)",borderRadius:12}}>
     {visible.length?visible.map(f=><button key={f.id} type="button" aria-pressed={activeId===f.id} onClick={()=>{setActiveId(f.id);setResultId("")}} style={{display:"block",width:"100%",textAlign:"left",padding:"14px 16px",border:"none",borderBottom:"1px solid var(--line)",borderRadius:0,background:activeId===f.id?"var(--accent2)":"var(--card)",color:"var(--ink)",cursor:"pointer",overflowWrap:"anywhere"}}>
      <span style={{fontSize:12,color:"var(--muted)"}}>{typeLabel[f.finding_type]??"Analyse"} · {statusLabel[f.status]??f.status}</span>
      <div style={{fontWeight:750,marginTop:5}}>{f.title}</div>
     </button>):<p className="muted" style={{padding:16}}>Ingen fund matcher filteret.</p>}
    </div>
    <div style={{minWidth:0}}>
     {active?<article key={active.id} className="finding" style={{marginTop:0}}>
      <span className="status">{statusLabel[active.status]??active.status}</span>
      <h2 style={{marginTop:12,overflowWrap:"anywhere"}}>{active.title}</h2>
      <p style={{overflowWrap:"anywhere"}}>{active.description}</p>
      {active.estimated_annual_value!=null?<p><strong>Estimeret årlig værdi:</strong> {new Intl.NumberFormat("da-DK",{style:"currency",currency:"DKK"}).format(active.estimated_annual_value)}</p>:null}
      <FindingDetail organizationId={organizationId} importId={active.import_id} findingType={active.finding_type} title={active.title}/>
      <div className="actions" style={{marginTop:18}}>
       {active.status==="identified"?<><button type="button" disabled={loading} onClick={()=>setStatus(active.id,"approved")}>Godkend</button><button type="button" className="secondary" disabled={loading} onClick={()=>setStatus(active.id,"rejected")}>Afvis</button></>:null}
       {active.status==="approved"?<button type="button" onClick={()=>{setResultId(active.id);setTitle(active.title)}}>Dokumentér resultat</button>:null}
      </div>
     </article>:<div className="finding" style={{marginTop:0}}><h2>Vælg et fund</h2><p className="muted">Klik på en titel til venstre for at se analysen og tage stilling. Listen kan søges og filtreres.</p></div>}
    </div>
   </div>
  </section>
  {resultId?<section className="card" style={{marginTop:18,maxWidth:760}}><h2>Dokumentér resultat</h2><form className="form-grid" onSubmit={recordResult}><label className="field">Resultattitel<input value={title} onChange={e=>setTitle(e.target.value)} required/></label><div className="grid"><label className="field">Baseline-værdi<input type="number" step=".01" value={baselineValue} onChange={e=>setBaselineValue(e.target.value)}/></label><label className="field">Resultatværdi<input type="number" step=".01" value={resultValue} onChange={e=>setResultValue(e.target.value)}/></label><label className="field">Tilskrevet Gainora<input type="number" step=".01" value={attributedValue} onChange={e=>setAttributedValue(e.target.value)}/></label></div><label className="field">Dokumentation<textarea rows={5} value={notes} onChange={e=>setNotes(e.target.value)}/></label><div className="actions"><button type="submit" disabled={loading}>Gem dokumenteret resultat</button><button type="button" className="secondary" onClick={()=>setResultId("")}>Annuller</button></div></form></section>:null}
 </main>
}
