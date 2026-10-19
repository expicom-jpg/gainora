"use client";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function ResetPasswordPage() {
 const [password,setPassword]=useState("");
 const [repeat,setRepeat]=useState("");
 const [ready,setReady]=useState(false);
 const [busy,setBusy]=useState(false);
 const [checking,setChecking]=useState(true);
 const [message,setMessage]=useState("");
 const [done,setDone]=useState(false);
 useEffect(()=>{
  const supabase=createSupabaseBrowserClient();
  let active=true;
  const {data:listener}=supabase.auth.onAuthStateChange((event,session)=>{
   if(!active)return;
   if(event==="PASSWORD_RECOVERY"&&session){setReady(true);setChecking(false);setMessage("");}
  });
  async function establishRecovery(){
   try{
    const params=new URLSearchParams(window.location.search);
    const code=params.get("code");
    const tokenHash=params.get("token_hash");
    const type=params.get("type");
    if(code){
     const {error}=await supabase.auth.exchangeCodeForSession(code);
     if(error)throw error;
    }else if(tokenHash&&type==="recovery"){
     const {error}=await supabase.auth.verifyOtp({token_hash:tokenHash,type:"recovery"});
     if(error)throw error;
    }
    const {data:{session},error}=await supabase.auth.getSession();
    if(error)throw error;
    if(active){
     if(session)setReady(true);
     else setMessage("Nulstillingslinket er udløbet eller kunne ikke åbnes. Bestil et nyt link.");
    }
   }catch{
    if(active)setMessage("Nulstillingslinket kunne ikke bekræftes. Bestil et nyt link og åbn det i samme browser.");
   }finally{if(active)setChecking(false)}
  }
  void establishRecovery();
  return ()=>{active=false;listener.subscription.unsubscribe()};
 },[]);
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(busy||!ready)return;
  if(password.length<10){setMessage("Brug mindst 10 tegn.");return}
  if(password!==repeat){setMessage("Adgangskoderne er ikke ens.");return}
  setBusy(true);setMessage("");
  try{
   const supabase=createSupabaseBrowserClient();
   const {data:{session}}=await supabase.auth.getSession();
   if(!session){setReady(false);setMessage("Din nulstillingssession er udløbet. Bestil et nyt link.");return}
   const {error}=await supabase.auth.updateUser({password});
   if(error){
    if(error.status===429)setMessage("For mange forsøg. Vent lidt, og prøv igen.");
    else if(error.status===401||error.status===403){setReady(false);setMessage("Nulstillingslinket er ikke længere gyldigt. Bestil et nyt link.");}
    else setMessage("Adgangskoden kunne ikke gemmes. Kontrollér kravene, eller bestil et nyt link.");
    return;
   }
   setDone(true);setPassword("");setRepeat("");
   await supabase.auth.signOut();
  }catch{setMessage("Forbindelsen blev afbrudt. Prøv igen, eller bestil et nyt link.");}
  finally{setBusy(false)}
 }
 return <main className="auth"><section className="auth-card">
  <div className="auth-brand">Gainora<span>.</span></div><h1>Vælg ny adgangskode</h1>
  {done?<p role="status">Adgangskoden er ændret. Log ind med din nye adgangskode.</p>
   :checking?<p role="status">Kontrollerer nulstillingslink…</p>
   :ready?<form onSubmit={submit}>
    <label className="field">Ny adgangskode<input type="password" autoComplete="new-password" minLength={10} required value={password} onChange={e=>setPassword(e.target.value)}/></label>
    <label className="field">Gentag adgangskode<input type="password" autoComplete="new-password" minLength={10} required value={repeat} onChange={e=>setRepeat(e.target.value)}/></label>
    <button type="submit" disabled={busy}>{busy?"Gemmer...":"Gem adgangskode"}</button>
   </form>:<p>Åbn siden via et nyt link fra nulstillingsmailen.</p>}
  {message?<p role="alert">{message}</p>:null}
  <p><Link href={done?"/login":"/forgot-password"}>{done?"Gå til login":"Bestil nyt link"}</Link></p>
 </section></main>;
}
