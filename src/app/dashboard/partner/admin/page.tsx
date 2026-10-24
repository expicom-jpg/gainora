import Link from "next/link";
import type {SupabaseClient} from "@supabase/supabase-js";
import {requirePageUser} from "@/lib/auth-page";
import {createSupabaseServerClient} from "@/lib/supabase/server";
export const dynamic="force-dynamic";
const money=(n:number,currency="DKK")=>new Intl.NumberFormat("da-DK",{style:"currency",currency}).format(n/100);
type Partner={id:string;name:string;partner_type:string;status:string;introduced_by_partner_id:string|null};
type Lead={id:string;partner_id:string;company_name:string;status:string;created_at:string};
type Ledger={id:string;partner_id:string;entry_type:string;commission_amount_minor:number;currency:string};
export default async function AdminPartnerHub(){
 const user=await requirePageUser();const db=(await createSupabaseServerClient()) as unknown as SupabaseClient;
 const {data:admin,error}=await db.from("partner_hub_admins").select("user_id").eq("user_id",user.id).maybeSingle();
 if(error||!admin)return <main className="page"><h1>Partner Hub · Administration</h1><div className="notice">Ingen administratoradgang. Adgang tildeles kun af Gainoras systemansvarlige.</div><Link href="/dashboard/partner">Tilbage til partnerområdet</Link></main>;
 const [p,l,c]=await Promise.all([
  db.from("partners").select("id,name,partner_type,status,introduced_by_partner_id").order("created_at",{ascending:false}).limit(100),
  db.from("leads").select("id,partner_id,company_name,status,created_at").order("created_at",{ascending:false}).limit(100),
  db.from("commission_ledger").select("id,partner_id,entry_type,commission_amount_minor,currency").order("created_at",{ascending:false}).limit(100)
 ]);
 if(p.error||l.error||c.error)return <main className="page"><h1>Partner Hub · Administration</h1><div className="notice">Kunne ikke hente de beskyttede partneroplysninger.</div></main>;
 const partners=(p.data??[]) as Partner[],leads=(l.data??[]) as Lead[],ledger=(c.data??[]) as Ledger[];
 const names=new Map(partners.map(x=>[x.id,x.name]));
 return <main className="page">
 <div className="eyebrow">Gainora · Adgangsstyret</div><h1>Partneradministration</h1>
 <p className="lead">Samlet overblik over godkendte partnerkonti, henvisningsrelationer, leads og optjente provisionsposter. Kun læseadgang i denne første version.</p>
 <div className="grid">
  <section className="card"><div className="muted">Partnere (maks. 100 vist)</div><div className="metric">{partners.length}</div></section>
  <section className="card"><div className="muted">Leads (maks. 100 vist)</div><div className="metric">{leads.length}</div></section>
  <section className="card"><div className="muted">Provisionsposter DKK (seneste 100)</div><div className="metric">{money(ledger.filter(x=>x.currency==="DKK").reduce((n,x)=>n+x.commission_amount_minor,0))}</div></section>
 </div>
 <section className="card" style={{marginTop:18}}><h2>Partnerorganisationer</h2>
 <div className="table-wrap"><table className="table"><thead><tr><th>Partner</th><th>Type</th><th>Introduceret af</th><th>Status</th></tr></thead><tbody>
 {partners.map(x=><tr key={x.id}><td>{x.name}</td><td>{x.partner_type}</td><td>{x.introduced_by_partner_id?names.get(x.introduced_by_partner_id)??"Anden godkendt partner":"Direkte"}</td><td>{x.status}</td></tr>)}
 </tbody></table></div></section>
 <section className="card" style={{marginTop:18}}><h2>Leadpipeline</h2>
 <div className="table-wrap"><table className="table"><thead><tr><th>Virksomhed</th><th>Partner</th><th>Status</th><th>Oprettet</th></tr></thead><tbody>
 {leads.map(x=><tr key={x.id}><td>{x.company_name}</td><td>{names.get(x.partner_id)??"Ukendt"}</td><td>{x.status}</td><td>{new Date(x.created_at).toLocaleDateString("da-DK")}</td></tr>)}
 </tbody></table></div></section>
 <p className="muted" style={{marginTop:18}}>Provision på faktisk betalte abonnementer kræver verificerede betalingshændelser, administratorgodkendelse og korrekt attribution. Betalingsintegration og udbetaling er ikke aktiveret.</p>
 </main>;
}