"use client";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setReady(true);
    }
    void check();
    return () => listener.subscription.unsubscribe();
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 10) { setMessage("Brug mindst 10 tegn."); return; }
    if (password !== repeat) { setMessage("Adgangskoderne er ikke ens."); return; }
    setBusy(true); setMessage("");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setMessage("Kunne ikke ændre adgangskoden. Prøv et nyt nulstillingslink.");
    else { setDone(true); await supabase.auth.signOut(); }
    setBusy(false);
  }
  return <main className="auth"><section className="auth-card">
    <div className="auth-brand">Gainora<span>.</span></div><h1>Vælg ny adgangskode</h1>
    {done ? <p role="status">Adgangskoden er ændret. Log ind med din nye adgangskode.</p> : ready ?
      <form onSubmit={submit}>
        <label className="field">Ny adgangskode<input type="password" autoComplete="new-password" minLength={10} required value={password} onChange={e=>setPassword(e.target.value)}/></label>
        <label className="field">Gentag adgangskode<input type="password" autoComplete="new-password" minLength={10} required value={repeat} onChange={e=>setRepeat(e.target.value)}/></label>
        <button type="submit" disabled={busy}>{busy ? "Gemmer..." : "Gem adgangskode"}</button>
      </form> : <p>Åbn siden via linket i nulstillingsmailen. Hvis linket er udløbet, kan du bestille et nyt.</p>}
    {message && <p role="alert">{message}</p>}
    <p><Link href={done ? "/login" : "/forgot-password"}>{done ? "Gå til login" : "Bestil nyt link"}</Link></p>
  </section></main>;
}
