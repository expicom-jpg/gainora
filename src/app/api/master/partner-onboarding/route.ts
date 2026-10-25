import { NextResponse } from "next/server";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const permitted = ["partner_leads", "partner_email", "partner_calendar", "partner_downline_read"] as const;
const schema = z.object({
  partnerName: z.string().trim().min(2).max(120),
  contactEmail: z.email().max(254),
  proposedMailLocalPart: z.string().trim().toLowerCase().regex(/^[a-z0-9][a-z0-9._-]{1,62}$/),
  agreementReference: z.string().trim().min(3).max(200),
  introducerPartnerId: z.uuid().nullable(),
  permissions: z.array(z.enum(permitted)).max(4),
}).strict();

export async function POST(request: Request) {
  const client = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await client.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Login kræves." }, { status: 401 });

  const db = client as unknown as SupabaseClient;
  // Do not trust client-supplied role/master ID. Read identity from authenticated session.
  const { data: master, error: masterError } = await db
    .from("gainora_master_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (masterError || !master) return NextResponse.json({ error: "Kun Gainoras Master kan godkende partnere." }, { status: 403 });

  let payload: unknown;
  try { payload = await request.json(); }
  catch { return NextResponse.json({ error: "Ugyldige oplysninger." }, { status: 400 }); }
  const parsed = schema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: "Kontrollér partnerdata, mailnavn, aftale og rettigheder." }, { status: 400 });
  const v = parsed.data;

  // A user-submitted approval records intent ONLY. It never creates live partner access
  // or Google credentials. Workspace provisioning requires a separately configured,
  // authorized backend job, license, domain and verified post-provisioning checks.
  const { data, error } = await db.from("gainora_partner_approvals").insert({
    partner_name: v.partnerName,
    contact_email: v.contactEmail,
    proposed_mail_local_part: v.proposedMailLocalPart,
    introducer_partner_id: v.introducerPartnerId,
    agreement_reference: v.agreementReference,
    requested_permissions: [...new Set(v.permissions)],
    master_user_id: user.id,
    state: "approved_pending_provisioning",
    approved_at: new Date().toISOString(),
  }).select("id,state").single();
  if (error) return NextResponse.json({ error: "Godkendelsen kunne ikke registreres. Kontroller databasemigration og rettigheder." }, { status: 409 });
  return NextResponse.json({ id: data.id, state: data.state, message: "Master-godkendelse gemt. Google-oprettelse afventer sikker integration; ingen partneradgang er aktiveret." }, { status: 201 });
}
