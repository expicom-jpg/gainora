"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewOrganizationPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "organization_create_failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "organization_create_failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <h1>Create organization</h1>
      <form onSubmit={onSubmit}>
        <label>
          Organization name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            minLength={2}
            maxLength={120}
            required
          />
        </label>
        <button type="submit" disabled={busy}>
          {busy ? "Creating..." : "Create organization"}
        </button>
        {error ? <p role="alert">{error}</p> : null}
      </form>
    </main>
  );
}
