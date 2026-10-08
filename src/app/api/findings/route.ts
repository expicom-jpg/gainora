import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const updateSchema = z.object({
  findingId: z.string().uuid(),
  organizationId: z.string().uuid(),
  status: z.enum(["approved", "rejected"])
});

export async function GET(request: NextRequest) {
  try {
    await requireUser();
    const organizationId = request.nextUrl.searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json({ error: "organizationId_required" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("audit_findings")
      .select("id,import_id,finding_type,title,description,estimated_annual_value,status,created_at,approved_at")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ findings: data ?? [] });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    return NextResponse.json({ error: "finding_list_failed" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireUser();
    const parsed = updateSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const approved = parsed.data.status === "approved";

    const { data, error } = await supabase
      .from("audit_findings")
      .update({
        status: parsed.data.status,
        approved_at: approved ? new Date().toISOString() : null,
        approved_by: approved ? user.id : null
      })
      .eq("id", parsed.data.findingId)
      .eq("organization_id", parsed.data.organizationId)
      .select("id,status,approved_at")
      .single();

    if (error) {
      if (error.code === "23514") return NextResponse.json({ error: "invalid_finding_transition" }, { status: 409 });
      if (error.code === "42501") return NextResponse.json({ error: "forbidden" }, { status: 403 });
      throw error;
    }
    return NextResponse.json({ finding: data });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    return NextResponse.json({ error: "finding_update_failed" }, { status: 500 });
  }
}
