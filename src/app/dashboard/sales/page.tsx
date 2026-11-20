import { prioritizeLead, summarizePipeline, type LeadSignal } from "@/lib/sales/workbench";

export const dynamic = "force-dynamic";

// Deliberately fictional sample companies: do not fetch or display protected CRM rows.
// No contact details, automatic outreach or live CRM write actions.
const demoLeads: LeadSignal[] = [
  { id: "demo-1", company: "Demo Produktion ApS", stage: "qualified", sectorFit: 2, valuePotential: 2, buyingSignal: 2, nextActionAt: "2026-11-18", blocked: false, ownership: "mine" },
  { id: "demo-2", company: "Eksempel Service ApS", stage: "new", sectorFit: 2, valuePotential: 1, buyingSignal: 1, nextActionAt: null, blocked: false, ownership: "mine" },
  { id: "demo-3", company: "Fiktiv Handel ApS", stage: "audit", sectorFit: 1, valuePotential: 2, buyingSignal: 2, nextActionAt: "2026-11-30", blocked: false, ownership: "mine" }
];
const labels: Record<LeadSignal["stage"], string> = {
  new: "Ny", qualified: "Kvalificeret", audit: "Profit Audit",
  offered: "Tilbud", won: "Kunde", lost: "Afsluttet"
};

export default function SalesWorkbenchPage() {
  const metrics = summarizePipeline(demoLeads);
  const today = new Date().toISOString().slice(0, 10);
  const leads = demoLeads.map(lead => ({ lead, suggestion: prioritizeLead(lead, today) }))
    .sort((a, b) => b.suggestion.score - a.suggestion.score);
  return <main className="page">
    <div className="eyebrow">Gainora · Sales Workspace</div>
    <h1>Mortens salgsarbejdsbord</h1>
    <p className="lead">Et sikkert designudkast til leadprioritering, salgsopfølgning og pipeline. <strong>Alle virksomheder og tal på denne side er fiktive demonstrationsdata.</strong></p>
    <div className="notice">Demo alene: CRM-adgang og sælgertilknytning er endnu ikke frigivet. Her er ingen rigtige kundeoplysninger, ingen udsendelse af beskeder og ingen ændringer til leads.</div>
    <div className="grid" style={{marginTop:18}}>
      <section className="card"><div className="muted">Aktive demo-leads</div><div className="metric">{metrics.active}</div></section>
      <section className="card"><div className="muted">Kvalificerede demo-leads</div><div className="metric">{metrics.qualified}</div></section>
      <section className="card"><div className="muted">Demo-konverteringer</div><div className="metric">{metrics.won}</div></section>
    </div>
    <section className="card" style={{marginTop:18}}>
      <h2>Pipeline og anbefalede næste skridt</h2>
      <p className="muted">Prioritering bygger på branchematch, muligt potentiale, dokumenterede købssignaler og opfølgningsdato. En sælger skal godkende enhver kontakt.</p>
      <div className="table-wrap"><table className="table"><thead><tr><th>Virksomhed (demo)</th><th>Fase</th><th>Prioritet</th><th>Foreslået handling</th><th>Begrundelse</th></tr></thead><tbody>
        {leads.map(({lead,suggestion}) => <tr key={lead.id}>
          <td>{lead.company}</td><td><span className="status">{labels[lead.stage]}</span></td>
          <td>{suggestion.priority === "high" ? "Høj" : suggestion.priority === "medium" ? "Mellem" : "Lav"}</td>
          <td>{suggestion.nextStep}</td><td>{suggestion.explanation}</td>
        </tr>)}
      </tbody></table></div>
    </section>
    <section className="card" style={{marginTop:18}}>
      <h2>Før adgang til rigtige data</h2>
      <p className="muted">Kræver sikker rolle- og ejerskabskontrol, dokumenterede regler for lead-lås og udløb, dobbeltregistrering, opt-out, auditlog samt beståede RLS-tests. Ingen eksterne AI-tjenester må modtage personoplysninger, før dette er godkendt.</p>
    </section>
  </main>;
}
