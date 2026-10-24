import type { SupabaseClient } from "@supabase/supabase-js";
import Link from "next/link";
import { requirePageUser } from "@/lib/auth-page";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MasterPartnerForm } from "./master-partner-form";
export const dynamic = "force-dynamic";
type Approval = { id:string;partner_name:string;contact_email:string;state:string;created_at:string;proposed_mail_local_part:string };
export default async function MasterPartnerOnboarding() {
 const user=await requirePageUser();const db=(await createSupabaseServerClient()) as unknown as SupabaseClient;
 const {data:master,error}=await db.from("gainora_master_users").select("user_id").eq("user_id",user.id).maybeSingle();
 if(error||!master)return <main className="page"><h1>Master Control</h1><div className="notice">Adgang nægtet. Kun Gainoras eneste Master kan godkende nye partnere.</div><Link href="/dashboard">Til dashboard</Link></main>;
 const {data:approvals,error:listError}=await db.from("gainora_partner_approvals").select("id,partner_name,contact_email,state,created_at,proposed_mail_local_part").order("created_at",{ascending:false}).limit(50);
 return <main className="page">
  <div className="eyebrow">Gainora · Master Control</div><h1>Partner-onboarding</h1>
  <p className="lead">Her gennemgår og godkender du nye partnere. Godkendelser gemmes til videre oprettelse; mail, kalender og partnerlogin aktiveres først efter sikre integrationer og kontroller.</p>
  <section className="card"><h2>Godkend ny partner</h2><MasterPartnerForm/></section>
  <section className="card" style={{marginTop:18}}><h2>Seneste godkendelser</h2>
   {listError?<p className="notice">Godkendelseskøen er ikke tilgængelig endnu. Den nye databasemigration skal godkendes og anvendes.</p>:
    (approvals?.length?<div className="table-wrap"><table className="table"><thead><tr><th>Partner</th><th>Kontakt</th><th>Mailnavn</th><th>Status</th></tr></thead><tbody>
      {(approvals as Approval[]).map(a=><tr key={a.id}><td>{a.partner_name}</td><td>{a.contact_email}</td><td>{a.proposed_mail_local_part}</td><td>{a.state}</td></tr>)}
    </tbody></table></div>:<p className="muted">Ingen partnergodkendelser endnu.</p>)}
  </section>
 </main>;
}
