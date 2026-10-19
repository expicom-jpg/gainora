import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Dinero integration | Gainora", description: "Klargøring af sikker Dinero-forbindelse til Profit Audit" };
export default function DineroIntegrationPage() {
 return <main className="page">
  <div className="eyebrow">Integrationer / Dinero</div>
  <h1>Forbind dit Dinero-regnskab</h1>
  <p className="lead">Vi klargør en sikker integration, så din virksomheds regnskabsdata senere kan indgå i Gainoras Profit Audit uden manuelle regneark.</p>
  <section className="card" style={{marginBottom:18,borderLeft:"4px solid #0891b2"}}>
   <h2>Forbindelse ikke aktiveret</h2>
   <p className="muted">Dinero er endnu ikke forbundet. Ingen regnskabsdata hentes, og Gainora har ikke adgang til din Dinero-konto.</p>
   <button className="btn" disabled aria-disabled="true" type="button" style={{opacity:.55,cursor:"not-allowed"}}>Forbind Dinero – kommer snart</button>
  </section>
  <div className="grid">
   <section className="card"><h2>1. Godkend adgang</h2><p>Din virksomhed godkender adgang via Dineros officielle autorisationsflow. Vi beder kun om de tilladelser, der er nødvendige.</p></section>
   <section className="card"><h2>2. Vælg regnskab</h2><p>Forbindelsen skal knyttes til den rigtige virksomhed i Gainora. Adgang mellem virksomheder holdes adskilt.</p></section>
   <section className="card"><h2>3. Analyser data</h2><p>Efter sikker synkronisering kan Gainora analysere relevante poster og leverandørudgifter. Resultater må ikke fremstå som dokumenterede besparelser uden grundlag.</p></section>
  </div>
  <section className="card" style={{marginTop:18}}>
   <h2>Forbindelsesstatus</h2>
   <div className="table-wrap"><table className="table"><tbody>
    <tr><th>Udbyder</th><td>Dinero</td></tr>
    <tr><th>Status</th><td>Afventer opsætning og godkendelse</td></tr>
    <tr><th>Seneste synkronisering</th><td>Ingen</td></tr>
    <tr><th>Dataadgang</th><td>Ingen</td></tr>
    <tr><th>Handlinger</th><td>Forbind, synkroniser og afbryd aktiveres først efter sikker integration</td></tr>
   </tbody></table></div>
  </section>
  <section className="card" style={{marginTop:18}}>
   <h2>Privatliv og sikkerhed</h2>
   <p>Vi aktiverer ikke forbindelsen, før OAuth-godkendelse, sikker tokenopbevaring, adgangskontrol pr. virksomhed, afbrydelse, dataminimering og test er på plads. Gainoras eget Dinero-regnskab holdes adskilt fra kundernes regnskaber.</p>
   <div className="actions"><Link className="btn secondary" href="/dashboard/imports/new">Brug manuel testimport indtil videre</Link></div>
  </section>
 </main>;
}
