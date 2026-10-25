import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requirePageUser } from "@/lib/auth-page";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Approval = {
 id: string;
 partner_name: string;
 contact_email: string;
 state: string;
 created_at: string;
 approved_at: string | null;
 failure_code: string | null;
};

const order: Record<string, number> = {
 provisioning_failed: 0,
 approved_pending_provisioning: 1,
 provisioning: 2,
 draft: 3,
 active: 4,
 rejected: 5,
};
function displayState(state: string) {
 const labels: Record<string, string> = {
  provisioning_failed: "Kræver opfølgning – fejl i oprettelse",
  approved_pending_provisioning: "Godkendt – afventer Google",
  provisioning: "Oprettelse i gang",
  draft: "Udkast",
  active: "Aktiv",
  rejected: "Afvist",
 };
 return labels[state] ?? "Ukendt status";
}

export default async function MasterInboxPage() {
 const user = await requirePageUser();
 const db = (await createSupabaseServerClient()) as unknown as SupabaseClient;
 const { data: master, error: masterError } = await db
  .from("gainora_master_users")
  .select("user_id")
  .eq("user_id", user.id)
  .maybeSingle();
 if (masterError || !master) return <main className="page">
  <h1>Master Control</h1>
  <div className="notice">Adgang nægtet. Kun Gainoras eneste Master har adgang til denne indbakke.</div>
  <Link href="/dashboard">Tilbage til dashboard</Link>
 </main>;

 const { data, error } = await db
  .from("gainora_partner_approvals")
  .select("id,partner_name,contact_email,state,created_at,approved_at,failure_code")
  .order("created_at", { ascending: false })
  .limit(100);
 const items = ((data ?? []) as Approval[]).sort((a, b) =>
  (order[a.state] ?? 9) - (order[b.state] ?? 9) ||
  b.created_at.localeCompare(a.created_at)
 );
 const waiting = items.filter(x => ["approved_pending_provisioning", "provisioning", "provisioning_failed"].includes(x.state));
 return <main className="page">
  <div className="eyebrow">Gainora · Kun Master</div>
  <h1>Opgaver og godkendelser</h1>
  <p className="lead">Overblik over partnergodkendelser og oprettelsesfejl. Denne første version giver kun læseadgang; ingen rettigheder aktiveres herfra.</p>
  <section className="grid">
   <article className="card"><p className="muted">Afventer oprettelse eller handling</p><div className="metric">{error ? "–" : waiting.length}</div></article>
   <article className="card"><p className="muted">Fejlede oprettelser</p><div className="metric">{error ? "–" : items.filter(x => x.state === "provisioning_failed").length}</div></article>
  </section>
  <section className="card" style={{ marginTop: 18 }}>
   <h2>Partneropgaver</h2>
   {error ? <div className="notice">Godkendelsesindbakken kan endnu ikke læses sikkert. Kontrollér den gennemgåede databasemigration og Master-adgangen.</div> :
   items.length ? <div className="table-wrap"><table className="table">
    <thead><tr><th>Partner</th><th>Registreret</th><th>Status</th></tr></thead>
    <tbody>{items.map(item => <tr key={item.id}>
     <td><strong>{item.partner_name}</strong><div className="muted">{item.contact_email}</div></td>
     <td>{new Date(item.created_at).toLocaleDateString("da-DK")}</td>
     <td>{displayState(item.state)}{item.failure_code ? <div className="muted">Oprettelse skal gennemgås af systemansvarlig.</div> : null}</td>
    </tr>)}</tbody>
   </table></div> : <p className="muted">Ingen registrerede partneropgaver.</p>}
  </section>
  <p style={{ marginTop: 18 }}><Link href="/dashboard/master/partner-onboarding">Åbn partner-onboarding</Link></p>
  <p className="muted">Medarbejderadgang, sikkerhedsalarmer og complianceopgaver tilføjes efter etablering af den fælles, autoriserede opgavekø. Status er ikke bevis for, at Google-provisionering er gennemført.</p>
 </main>;
}
