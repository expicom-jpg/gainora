"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { AuditFinding } from "@/lib/profit-audit/types";

type Organization = { role: string; organization: { id: string; name: string } | null };

export default function NewImportPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationId, setOrganizationId] = useState("");
  const [findings, setFindings] = useState<AuditFinding[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadOrganizations() {
      try {
        const response = await fetch("/api/organizations");
        if (!response.ok) throw new Error("organization_list_failed");
        const data = await response.json();
        const items = ((data.organizations ?? []) as Organization[])
          .filter(item => item.organization && ["owner", "admin", "member"].includes(item.role));
        if (active) {
          setOrganizations(items);
          setOrganizationId(items[0]?.organization?.id ?? "");
        }
      } catch {
        if (active) setMessage("Kunne ikke hente virksomheder. Genindlæs siden og prøv igen.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadOrganizations();
    return () => { active = false; };
  }, []);

  async function runDemo() {
    if (!organizationId || busy) return;
    setBusy(true);
    setMessage(null);
    setFindings([]);
    try {
      const demo = await fetch("/api/imports/demo", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ organizationId })
      });
      if (!demo.ok) throw new Error("demo_failed");
      const { importId } = await demo.json();
      const audit = await fetch("/api/profit-audit/run", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ organizationId, importId })
      });
      if (!audit.ok) throw new Error("audit_failed");
      const data = await audit.json();
      setFindings(data.findings ?? []);
      setMessage("Demo klar: 8 syntetiske posteringer analyseret. Eksisterende godkendelser og resultater bevares, hvis du kører demoen igen.");
    } catch {
      setMessage("Demoen kunne ikke gennemføres. Prøv igen; dine eksisterende fund bliver bevaret.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="page">
    <div className="eyebrow">Profit Audit · demo</div>
    <h1>Prøv Gainora med demodata</h1>
    <p className="lead">Se økonomisk overblik og konkrete undersøgelsespunkter for en fiktiv virksomhed.</p>
    <div className="notice">Filupload er lukket. Demoen bruger kun faste, syntetiske tal. Indtast ikke rigtige kundeoplysninger i demoens øvrige felter.</div>
    <section className="card" style={{ marginTop: 18 }}>
      <h2>En måned i en fiktiv virksomhed</h2>
      <p className="muted">September 2026 · 8 posteringer · salg, vareindkøb, løn, husleje, software, forsikring, energi og markedsføring.</p>
      <label className="field">Virksomhed
        <select value={organizationId} disabled={busy || loading} onChange={event => {
          setOrganizationId(event.target.value); setFindings([]); setMessage(null);
        }}>
          <option value="">Vælg virksomhed</option>
          {organizations.map(item => item.organization ? <option key={item.organization.id} value={item.organization.id}>{item.organization.name}</option> : null)}
        </select>
      </label>
      {!loading && !organizations.length ? <p>Du skal have skriverettigheder til en virksomhed. <Link href="/dashboard/organizations/new">Opret en demovirksomhed</Link>.</p> : null}
      <div className="actions"><button type="button" disabled={busy || loading || !organizationId} onClick={runDemo}>
        {busy ? "Kører demo..." : "Kør demo med syntetiske data"}
      </button></div>
      {message ? <p role="status" className="notice" style={{ marginTop: 14 }}>{message}</p> : null}
    </section>
    {findings.length > 0 ? <section className="card" style={{ marginTop: 18 }}>
      <h2>Demoens fund</h2>
      <p className="muted">Fundene er undersøgelsespunkter fra fiktive tal. De dokumenterer ikke en virkelig besparelse.</p>
      {findings.map((finding, index) => <article className="finding" key={`${finding.findingType}-${index}`}>
        <h3 className="finding-title">{finding.title}</h3><p className="muted">{finding.description}</p>
      </article>)}
      <Link href="/dashboard/opportunities">Gå til fund og godkendelser</Link>
    </section> : null}
  </main>;
}
