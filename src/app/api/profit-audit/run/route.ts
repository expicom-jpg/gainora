import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { runProfitAudit } from "@/lib/profit-audit/engine";

const requestSchema = z.object({
  organizationId: z.string().uuid(),
  importId: z.string().uuid()
});

export async function POST(request: NextRequest) {
  try {
    await requireUser();
    const parsed = requestSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    const { organizationId, importId } = parsed.data;
    const supabase = await createSupabaseServerClient();

    const { data: rows, error: rowsError } = await supabase
      .from("financial_rows")
      .select("account,description,amount")
      .eq("organization_id", organizationId)
      .eq("import_id", importId);

    if (rowsError) throw rowsError;

    const findings = runProfitAudit(
      (rows ?? []).map((row) => ({
        account: String(row.account),
        description: String(row.description ?? ""),
        amount: Number(row.amount)
      }))
    );

    const { error: deleteError } = await supabase
      .from("audit_findings")
      .delete()
      .eq("organization_id", organizationId)
      .eq("import_id", importId);

    if (deleteError) throw deleteError;

    if (findings.length > 0) {
      const { error: insertError } = await supabase
        .from("audit_findings")
        .insert(
          findings.map((finding) => ({
            organization_id: organizationId,
            import_id: importId,
            finding_type: finding.findingType,
            title: finding.title,
            description: finding.description,
            estimated_annual_value: finding.estimatedAnnualValue ?? null
          }))
        );

      if (insertError) throw insertError;
    }

    return NextResponse.json({ findings });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }

    return NextResponse.json({ error: "profit_audit_failed" }, { status: 500 });
  }
}
