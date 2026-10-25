import {createSupabaseServerClient} from "@/lib/supabase/server";
import {requirePageUser} from "@/lib/auth-page";
import {PartnerLeadForm} from "./partner-lead-form";
import {PartnerLeadStatus} from "./partner-lead-status";
import type {SupabaseClient} from "@supabase/supabase-js";
export const dynamic="force-dynamic";
const money=(minor:number,currency="DKK")=>new Intl.NumberFormat("da-DK",{style:"currency",currency}).format(minor/100);
type Partner={id:string;name:string;partner_type:string;status:string;introduced_by_partner_id:string|null};
type Member={partner_id:string;role:string};
type Lead={id:string;partner_id:string;company_name:string;status:string;created_at:string};
type Commission={id:string;partner_id:string;entry_type:string;commission_amount_minor:number;currency:string;created_at:string};
type Payout={id:string;partner_id:string;amount_minor:number;currency:string;status:string;created_at:string};
export default async function PartnerDashboardPage(){
 const user=await requirePageUser();
 const db=(await createSupabaseServerClient()) as unknown as SupabaseClient;
 const {data:members,error:membershipError}=await db.from("partner_members").select("partner_id,role").eq("user_id",user.id);
 if(membershipError)return <main className="page"><h1>Gainora Partner Hub</h1><div className="notice">Partner Hub afventer sikker databasemigration. Ingen partnerdata vises.</div></main>;
 const own=(members??[]) as Member[];
 if(!own.length)return <main className="page"><div className="eyebrow">Partner Hub</div><h1>Partneradgang</h1><p className="lead">Din konto har endnu ikke fået en godkendt partnerrolle. Kontakt Gainoras salgsadministrator for invitation og adgang.</p><div className="notice">Partneroplysninger og provison er kun tilgængelige for godkendte partnere.</div></main>;
 const ids=own.map(m=>m.partner_id);
 const [p,l,c,pay]=await Promise.all([
  db.from("partners").select("id,name,partner_type,status,introduced_by_partner_id").in("id",ids),
  db.from("leads").select("id,partner_id,company_name,status,created_at").in("partner_id",ids).order("created_at",{ascending:false}).limit(100),
  db.from("commission_ledger").select("id,partner_id,entry_type,commission_amount_minor,currency,created_at").in("partner_id",ids).order("created_at",{ascending:false}).limit(100),
  db.from("partner_payouts").select("id,partner_id,amount_minor,currency,status,created_at").in("partner_id",ids).order("created_at",{ascending:false}).limit(100)
 ]);
 if(p.error||l.error||c.error||pay.error)return <main className="page"><h1>Gainora Partner Hub</h1><div className="notice">Partnerdata kunne ikke indlæses sikkert. Kontakt administrationen.</div></main>;
 const partners=(p.data??[]) as Partner[],leads=(l.data??[]) as Lead[],ledger=(c.data??[]) as Commission[],payouts=(pay.data??[]) as Payout[];
 const total=ledger.filter(x=>x.currency==="DKK").reduce((sum,x)=>sum+x.commission_amount_minor,0);
 const paid=payouts.filter(x=>x.status==="paid"&&x.currency==="DKK").reduce((sum,x)=>sum+x.amount_minor,0);
 return <main className="page">
  <div className="eyebrow">Gainora Partner Hub</div><h1>Dit partneroverblik</h1>
  <p className="lead">Kun dine godkendte partnerkonti. Provision bliver alene optjent på bekræftede, kvalificerende kundebetalinger. Viste beløb er ikke en udbetalingsgaranti.</p>
  <div className="grid">
   <section className="card"><div className="muted">Partnertilknytninger</div><div className="metric">{partners.length}</div></section>
   <section className="card"><div className="muted">Registrerede leads</div><div className="metric">{leads.length}{leads.length===100?"+":""}</div></section>
   <section className="card"><div className="muted">Provisionsposter (DKK)</div><div className="metric">{money(total)}</div><p className="muted">Seneste 100 poster</p></section>
   <section className="card"><div className="muted">Registreret udbetalt (DKK)</div><div className="metric">{money(paid)}</div></section>
  </div>
  <section className="card" style={{marginTop:18}}><h2>Dine partnerkonti</h2>
   <div className="table-wrap"><table className="table"><thead><tr><th>Partner</th><th>Type</th><th>Rolle</th><th>Status</th></tr></thead><tbody>{partners.map(x=><tr key={x.id}><td>{x.name}</td><td>{x.partner_type}</td><td>{own.find(m=>m.partner_id===x.id)?.role}</td><td>{x.status}</td></tr>)}</tbody></table></div>
  </section>
  <section className="card" style={{marginTop:18}}><h2>Registrér nyt lead</h2><p className="muted">Opret kun leads, du har et lovligt grundlag for at kontakte. Gainora godkender attribution før provision.</p>
   <PartnerLeadForm partners={partners.filter(x=>x.status==="active"&&own.some(m=>m.partner_id===x.id&&["admin","seller"].includes(m.role))).map(x=>({id:x.id,name:x.name}))}/>
  </section>
  <section className="card" style={{marginTop:18}}><h2>Salgsarbejde og pipeline</h2>
   {leads.length?<div className="table-wrap"><table className="table"><thead><tr><th>Virksomhed</th><th>Status</th><th>Registreret</th></tr></thead><tbody>{leads.map(x=><tr key={x.id}><td>{x.company_name}</td><td><PartnerLeadStatus leadId={x.id} partnerId={x.partner_id} initialStatus={x.status} canEdit={own.some(m=>m.partner_id===x.partner_id&&["admin","seller"].includes(m.role))}/></td><td>{new Date(x.created_at).toLocaleDateString("da-DK")}</td></tr>)}</tbody></table></div>:<p className="muted">Ingen registrerede leads endnu.</p>}
  </section>
  <section className="card" style={{marginTop:18}}><h2>Provision og afregning</h2>
   {ledger.length?<div className="table-wrap"><table className="table"><thead><tr><th>Type</th><th>Dato</th><th>Beløb</th></tr></thead><tbody>{ledger.map(x=><tr key={x.id}><td>{x.entry_type}</td><td>{new Date(x.created_at).toLocaleDateString("da-DK")}</td><td>{money(x.commission_amount_minor,x.currency)}</td></tr>)}</tbody></table></div>:<p className="muted">Ingen verificerede provisionsposter endnu. Beregningen på 10 % + 2 % er endnu ikke koblet på betalingsudbyderens webhooks.</p>}
  </section>
 </main>;
}