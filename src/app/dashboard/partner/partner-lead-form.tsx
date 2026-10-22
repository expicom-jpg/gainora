"use client";
import {useState,type FormEvent} from "react";
import {useRouter} from "next/navigation";
export function PartnerLeadForm({partners}:{partners:{id:string;name:string}[]}){
 const router=useRouter();const[partner,setPartner]=useState(partners[0]?.id??"");const[company,setCompany]=useState("");const[email,setEmail]=useState("");const[reason,setReason]=useState("");const[busy,setBusy]=useState(false);const[notice,setNotice]=useState("");
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setBusy(true);setNotice("");
  try{
   const res=await fetch("/api/partner/leads",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({partnerId:partner,companyName:company,contactEmail:email||null,contactBasis:reason})});
   const data=await res.json();
   if(!res.ok)throw new Error(data.error??"Kunne ikke oprette lead");
   setCompany("");setEmail("");setReason("");setNotice("Lead registreret til gennemgang.");router.refresh();
  }catch(err){setNotice(err instanceof Error?err.message:"Fejl ved registrering");}finally{setBusy(false)}
 }
 if(!partners.length)return <p className="notice">Du har ingen aktiv salgspartnerrolle. Kontakt Gainora for adgang.</p>;
 return <form onSubmit={submit} className="form-grid" style={{maxWidth:640}}>
  <label className="field">Partner<select value={partner} onChange={e=>setPartner(e.target.value)}>{partners.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select></label>
  <label className="field">Virksomhed<input value={company} onChange={e=>setCompany(e.target.value)} required minLength={2} maxLength={120}/></label>
  <label className="field">Erhvervskontakt (valgfri e-mail)<input type="email" value={email} onChange={e=>setEmail(e.target.value)} maxLength={254}/></label>
  <label className="field">Dokumentér lovligt kontaktgrundlag<textarea required value={reason} onChange={e=>setReason(e.target.value)} minLength={10} maxLength={500} placeholder="Hvordan blev virksomheden interesseret, og hvorfor må vi kontakte den?"/></label>
  <button type="submit" disabled={busy}>{busy?"Gemmer…":"Registrér lead"}</button>{notice?<p role="status">{notice}</p>:null}
 </form>;
}