"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
const rights = [
 { key:"partner_leads", label:"Kundeemner og salg" },
 { key:"partner_email", label:"Officiel Gainora-mail" },
 { key:"partner_calendar", label:"Google-kalender i Gainora" },
 { key:"partner_downline_read", label:"Eget downline-overblik" },
];
export function MasterPartnerForm() {
 const router=useRouter();
 const [name,setName]=useState("");const[email,setEmail]=useState("");
 const[local,setLocal]=useState("");const[agreement,setAgreement]=useState("");
 const[introducer,setIntroducer]=useState("");const[permissions,setPermissions]=useState<string[]>([]);
 const[confirmed,setConfirmed]=useState(false);const[busy,setBusy]=useState(false);const[notice,setNotice]=useState("");
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(!confirmed)return;setBusy(true);setNotice("");
  try{
   const res=await fetch("/api/master/partner-onboarding",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({
    partnerName:name,contactEmail:email,proposedMailLocalPart:local,agreementReference:agreement,
    introducerPartnerId:introducer||null,permissions
   })});
   const body=await res.json();if(!res.ok)throw new Error(body.error||"Godkendelsen fejlede");
   setNotice(body.message);setConfirmed(false);setName("");setEmail("");setLocal("");setAgreement("");setIntroducer("");setPermissions([]);router.refresh();
  }catch(err){setNotice(err instanceof Error?err.message:"Kunne ikke registrere godkendelsen");}finally{setBusy(false);}
 }
 return <form onSubmit={submit} className="form-grid" style={{maxWidth:700}}>
  <label className="field">Partner / virksomhed<input required minLength={2} maxLength={120} value={name} onChange={e=>setName(e.target.value)}/></label>
  <label className="field">Kontakt-e-mail til invitation<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label>
  <label className="field">Ønsket Gainora-mailnavn (uden domæne)<input required minLength={3} pattern="[a-z0-9][a-z0-9._-]{1,62}" placeholder="morten" value={local} onChange={e=>setLocal(e.target.value.toLowerCase())}/></label>
  <label className="field">Aftalereference<input required minLength={3} maxLength={200} value={agreement} onChange={e=>setAgreement(e.target.value)}/></label>
  <label className="field">Introducer-partner-ID (valgfrit)<input value={introducer} onChange={e=>setIntroducer(e.target.value)} placeholder="UUID"/></label>
  <fieldset style={{border:"1px solid var(--border, #ddd)",padding:16,borderRadius:12}}><legend>Vælg rettigheder – ingen valgt som standard</legend>
   {rights.map(r=><label key={r.key} style={{display:"flex",gap:10,margin:"12px 0"}}><input type="checkbox" checked={permissions.includes(r.key)} onChange={e=>setPermissions(a=>e.target.checked?[...a,r.key]:a.filter(x=>x!==r.key))}/>{r.label}</label>)}
  </fieldset>
  <label style={{display:"flex",gap:10,alignItems:"flex-start"}}><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>Jeg har gennemgået partnerens identitet, aftale og rettigheder og ønsker at registrere min Master-godkendelse.</label>
  <button type="submit" disabled={!confirmed||busy}>{busy?"Gemmer…":"Godkend partner til oprettelse"}</button>
  <p className="muted">Google Workspace og partnerlogin aktiveres ikke af formularen. Kontooprettelse afventer domæne, licens, autoriseret API og sikkerhedstest.</p>
  {notice?<p role="status" className="notice">{notice}</p>:null}
 </form>;
}
