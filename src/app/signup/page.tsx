"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = window.location.origin + "/auth/confirm";
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo }
      });

      if (error) throw error;
      setMessage("Check your email to confirm your Gainora account.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sign up failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <h1>Create Gainora account</h1>
      <form onSubmit={onSubmit}>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" minLength={10} value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button type="submit" disabled={busy}>{busy ? "Creating..." : "Create account"}</button>
      </form>
      {message ? <p>{message}</p> : null}
      <p><Link href="/login">Already have an account?</Link></p>
    </main>
  );
}
