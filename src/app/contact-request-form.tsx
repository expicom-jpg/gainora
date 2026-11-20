"use client";
import { FormEvent, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function ContactRequestForm() {
  const [status, setStatus] = useState<"idle"|"sending"|"success"|"error">("idle");
  const [errorText, setErrorText] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form=e.currentTarget;
    const f=new FormData(form);
    if (f.get("website")) return;
    const company=String(f.get("company")||"").trim();
    const contact_name=String(f.get("contact_name")||"").trim();
    const email=String(f.get("email")||"").trim();
    const phone=String(f.get("phone")||"").trim();
    const message=String(f.get("message")||"").trim();
    if(company.length<2||contact_name.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorText("Udfyld venligst virksomhed, navn og en gyldig e-mail.");
      setStatus("error");return;
    }
    if(!f.get("consent")){setErrorText("Du skal acceptere, at vi kontakter dig om din forespørgsel.");setStatus("error");return;}
    const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if(!url||!key){setStatus("error");setErrorText("Formularen er midlertidigt utilgængelig. Skriv til expicom@gmail.com.");return;}
    setStatus("sending");
    try {
      const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
      const {error}=await db.from("gainora_contact_requests").insert({company,contact_name,email,phone,message,source:"homepage"});
      if(error) throw error;
      form.reset();setStatus("success");
    } catch {
      setErrorText("Vi kunne ikke sende din forespørgsel. Prøv igen, eller skriv til expicom@gmail.com.");
      setStatus("error");
    }
  }
  return <form className="lead-form" onSubmit={submit}>
    <div className="form-heading"><span className="eyebrow">Tag første skridt</span><h3>Lad os tage en uforpligtende snak</h3><p>Fortæl os lidt om jer. Vi vender tilbage og finder ud af, om Gainora er et match.</p></div>
    <div className="lead-fields">
      <label>Virksomhed <input name="company" required minLength={2} maxLength={160} placeholder="Virksomhedens navn" autoComplete="organization"/></label>
      <label>Dit navn <input name="contact_name" required minLength={2} maxLength={160} placeholder="Fornavn og efternavn" autoComplete="name"/></label>
      <label>E-mail <input type="email" name="email" required maxLength={254} placeholder="navn@virksomhed.dk" autoComplete="email"/></label>
      <label>Telefon (valgfri) <input type="tel" name="phone" maxLength={60} placeholder="+45 …" autoComplete="tel"/></label>
      <label className="full">Hvad vil du gerne blive klogere på? <textarea name="message" maxLength={2000} rows={3} placeholder="Omkostninger, indtjening, likviditet eller noget helt andet…"/></label>
    </div>
    <label className="lead-consent"><input type="checkbox" name="consent" required/><span>Jeg accepterer, at Gainora gemmer mine oplysninger for at besvare min henvendelse.</span></label>
    <div className="form-trap" aria-hidden="true"><label>Websted<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
    <button className="lead-submit" disabled={status==="sending"} type="submit">{status==="sending"?"Sender…":"Bliv kontaktet"} <span aria-hidden="true">↗</span></button>
    {status==="success"&&<p className="form-success" role="status">Tak! Vi har modtaget din henvendelse og vender tilbage.</p>}
    {status==="error"&&<p className="form-error" role="alert">{errorText}</p>}
    <p className="lead-fine">Ingen binding · Vi beder ikke om regnskabsadgang her</p>
  </form>;
}
