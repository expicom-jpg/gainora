"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin + "/reset-password"
      });
      if (authError) throw authError;
      setSent(true);
    } catch {
      setError("Anmodningen kunne ikke gennemføres lige nu. Prøv igen senere.");
    } finally { setBusy(false); }
  }
  return <main className="auth"><section className="auth-card">
    <div className="auth-brand">Gainora<span>.</span></div>
    <div className="eyebrow" style={{marginTop:24}}>Kontoadgang</div>
    <h1>Glemt adgangskode?</h1>
    {sent ? <p role="status">Hvis der findes en konto med denne e-mailadresse, modtager du et link til at vælge en ny adgangskode. Kontrollér også spam-mappen.</p> : <>
      <p className="muted">Indtast din e-mailadresse, så sender vi et link til nulstilling.</p>
      <form onSubmit={submit}><label className="field">E-mail<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
      <button type="submit" disabled={busy}>{busy ? "Sender..." : "Send nulstillingslink"}</button>
      {error && <p role="alert" style={{color:"var(--bad)"}}>{error}</p>}</form></>}
    <p className="muted"><Link href="/login">Tilbage til login</Link></p>
  </section></main>;
}
