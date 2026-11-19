"use client";
import {useState, type FormEvent} from "react";

export default function ProfitAuditInterestForm(){
 const [name,setName]=useState("");const [company,setCompany]=useState("");const [email,setEmail]=useState("");const [phone,setPhone]=useState("");const [industry,setIndustry]=useState("");const [consent,setConsent]=useState(false);
 function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  if(!consent)return;
  const subject="Gainora – interesse for Profit Audit";
  const body=["Hej Morten,","","Jeg vil gerne høre mere om en Profit Audit og et muligt pilotforløb.","","Navn: "+name,"Virksomhed: "+company,"E-mail: "+email,"Telefon: "+phone,"Branche: "+industry,"","Jeg ønsker at blive kontaktet om min henvendelse."].join("\n");
  window.location.href="mailto:expicom@gmail.com?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);
 }
 return <form onSubmit={submit} className="lead-form"><h3>Bliv kontaktet om Profit Audit</h3><p>Udfyld dine kontaktoplysninger. Vi beder ikke om regnskabsdata på nuværende tidspunkt.</p><label className="field">Navn<input required maxLength={120} value={name} onChange={e=>setName(e.target.value)} autoComplete="name"/></label><label className="field">Virksomhed<input required maxLength={160} value={company} onChange={e=>setCompany(e.target.value)} autoComplete="organization"/></label><label className="field">E-mail<input required type="email" maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/></label><label className="field">Telefon<input required type="tel" maxLength={40} value={phone} onChange={e=>setPhone(e.target.value)} autoComplete="tel"/></label><label className="field">Branche<select required value={industry} onChange={e=>setIndustry(e.target.value)}><option value="">Vælg branche</option><option>Byggeri</option><option>Specialbutik/detailhandel</option><option>Transport</option><option>Økonomi/regnskab</option><option>Ordrehåndtering</option><option>Andet</option></select></label><label className="lead-consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} required/> Jeg accepterer, at Gainora kontakter mig om denne henvendelse.</label><button type="submit">Åbn e-mail med min forespørgsel</button><small>Dette er en midlertidig løsning: Din e-mailapp åbnes med en udfyldt besked. Du skal selv trykke Send. Formularen gemmer ikke oplysninger på hjemmesiden, og der udsendes endnu ingen automatisk bekræftelse.</small></form>
}