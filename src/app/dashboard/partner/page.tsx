export const dynamic = "force-dynamic";

const metrics = [
  ["Leads", "0", "Nye og aktive partnerleads"],
  ["Kunder", "0", "Konverterede betalende kunder"],
  ["MRR", "0 kr.", "Månedlig tilbagevendende omsætning"],
  ["Forventet provision", "0 kr.", "Baseret på aktive abonnementer"],
  ["Optjent provision", "0 kr.", "Kun fra bekræftede betalinger"],
  ["Udbetalt", "0 kr.", "Afstemte partnerudbetalinger"]
];

export default function PartnerDashboardPage() {
  return <main className="page">
    <div className="eyebrow">Partnerkanal</div>
    <h1>Partnerdashboard</h1>
    <p className="lead">Følg pipeline, kunder, tilbagevendende omsætning og provision. Provision bliver først optjent, når en berettiget kundebetaling er bekræftet.</p>
    <div className="grid" style={{marginTop:18}}>
      {metrics.map(([label,value,help]) => <section className="card" key={label}>
        <div className="muted">{label}</div>
        <div style={{fontSize:"2rem",fontWeight:700,margin:"8px 0"}}>{value}</div>
        <div className="muted">{help}</div>
      </section>)}
    </div>
    <section className="card" style={{marginTop:18}}>
      <h2>Fra lead til tilbagevendende indtjening</h2>
      <p className="muted">Kanal → partner/bureau → sælger → lead → Profit Audit → kunde → abonnement → betalt faktura → provision.</p>
      <div className="notice" style={{marginTop:14}}>Partnerdata er endnu ikke åbnet til almindelige brugere. Datamodellen er etableret med RLS og holdes lukket, indtil partnerroller og adgangspolitikker er færdige.</div>
    </section>
  </main>;
}
