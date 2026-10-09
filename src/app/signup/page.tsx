"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = window.location.origin + "/auth/confirm";
      const { error: signupError, data } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: redirectTo },
      });
      if (signupError) throw signupError;
      if (data.session) {
        window.location.assign("/dashboard");
        return;
      }
      setMessage("Hvis adressen kan registreres, modtager du en bekræftelsesmail. Tjek også spam. Hvis mailen ikke kommer, kontakt support — opret ikke gentagne konti.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Kontoen kunne ikke oprettes. Prøv igen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth">
      <section className="auth-card">
        <div className="auth-brand">Gainora<span>.</span></div>
        <div className="eyebrow" style={{ marginTop: 24 }}>Kom i gang</div>
        <h1>Opret konto</h1>
        <p className="muted">Pilotversionen bruger kun testdata. Brug ikke rigtige kundeoplysninger endnu.</p>
        <form onSubmit={onSubmit}>
          <label className="field">E-mail
            <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="field">Adgangskode (mindst 10 tegn)
            <input type="password" autoComplete="new-password" minLength={10} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          <button type="submit" disabled={busy}>{busy ? "Opretter..." : "Opret konto"}</button>
          {message ? <p role="status" className="muted">{message}</p> : null}
          {error ? <p role="alert" style={{ color: "var(--bad)" }}>{error}</p> : null}
        </form>
        <p className="muted">Har du allerede en konto? <Link href="/login">Log ind</Link></p>
      </section>
    </main>
  );
}
