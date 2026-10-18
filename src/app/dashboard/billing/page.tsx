import type { Metadata } from "next";
export const metadata: Metadata = { title: "Abonnement | Gainora", description: "Gainoras abonnementsmuligheder og kommende betalingsadministration" };
const tiers = [
 {name:"Founding Customer", price:"1.247,50",period:"De første 12 måneder",next:"2.495 kr./md. fra måned 13",note:"Kun til de første to virksomheder, der tegner et betalt abonnement. Pladser tildeles først ved bekræftet betaling.",featured:true},
 {name:"Introduktion",price:"995",period:"De første 3 måneder",next:"2.495 kr./md. fra måned 4",note:"Introduktionspris til nye betalende kunder.",featured:false},
 {name:"Standard",price:"2.495",period:"Fra første måned",next:"2.495 kr./md. løbende",note:"Normalpris uden introduktionsrabat.",featured:false}
] as const;
export default function BillingPage(){
 return <main className="page">
  <div className="eyebrow">Abonnement og betaling</div>
  <h1>En klar pris på bedre beslutninger.</h1>
  <p className="lead">Få adgang til Gainoras økonomiske analyser, anbefalinger og opfølgning. Betalingsfunktionen er under klargøring og kan endnu ikke bruges til at oprette et abonnement.</p>
  <section className="card" style={{marginBottom:20,borderLeft:"4px solid #0891b2"}} aria-label="Betalingsstatus">
   <strong>Betaling er endnu ikke aktiveret</strong>
   <p className="muted">Dette er en forhåndsvisning af priserne. Ingen betalinger trækkes, og ingen abonnementsaftale oprettes på denne side.</p>
  </section>
  <div className="grid">
   {tiers.map(t=><section className="card" key={t.name} style={{display:"flex",flexDirection:"column",gap:12,border:t.featured?"2px solid #0891b2":undefined}}>
    <div className="eyebrow">{t.featured?"Begrænset tilbud":"Gainora"}</div>
    <h2 style={{margin:0}}>{t.name}</h2>
    <div><strong style={{fontSize:"2rem"}}>{t.price} kr.</strong><span className="muted"> / måned</span></div>
    <p style={{margin:0}}>{t.period}</p>
    <p className="muted" style={{margin:0}}>{t.next}</p>
    <p className="muted" style={{flex:1}}>{t.note}</p>
    <button type="button" className="btn" disabled aria-disabled="true" style={{opacity:.55,cursor:"not-allowed"}}>Kommer snart</button>
   </section>)}
  </div>
  <section className="card" style={{marginTop:20}}>
   <h2>Hvad sker der, når betalingen aktiveres?</h2>
   <p>Ved tilmelding skal kunden se introduktionsprisen, normalprisen, den præcise dato for prisændringen, moms og opsigelsesvilkår, inden betaling godkendes. Den automatiske prisændring gennemføres først, når et betalingsabonnement er oprettet og accepteret.</p>
   <p className="muted">Alle viste priser er ekskl. moms. Der kan ikke oprettes eller ændres abonnementer her endnu. Pilotadgang håndteres særskilt og bliver ikke automatisk til et betalt abonnement.</p>
  </section>
  <section className="card" style={{marginTop:20}}>
   <h2>Mit abonnement</h2>
   <p className="muted">Når Stripe er integreret, vil du her kunne se abonnementsstatus, kommende betaling, fakturaer, betalingsmetode og opsigelse. Funktionerne er ikke aktiveret endnu.</p>
  </section>
  <section className="card" style={{marginTop:20}}>
   <h2>Moms og regnskab</h2>
   <p>Vi klargør en samlet oversigt over fakturaer, momsgrundlag, indbetalinger, kreditnotaer og afstemning. Denne visning er endnu ikke et bogføringssystem.</p>
   <div className="table-wrap"><table className="table"><thead><tr><th>Område</th><th>Kommende funktion</th><th>Status</th></tr></thead><tbody>
    <tr><td>Moms</td><td>Kontrol af kundeland, momsregistrering og korrekt momssats</td><td>Afventer integration</td></tr>
    <tr><td>Fakturaer</td><td>Fakturanummer, betalingsstatus, momsoplysninger og download</td><td>Afventer integration</td></tr>
    <tr><td>Kreditnotaer</td><td>Sporbar tilbageførsel af faktura og betaling</td><td>Afventer integration</td></tr>
    <tr><td>Regnskab</td><td>Eksport og afstemning mod bogføringssystem</td><td>Afventer integration</td></tr>
   </tbody></table></div>
   <p className="muted">Dansk standardmoms er som udgangspunkt 25 %, men EU B2B, eksport og særlige forhold kræver særskilt vurdering. Moms beregnes først endeligt ved fakturering ud fra validerede kundeoplysninger.</p>
  </section>
 </main>;
}
