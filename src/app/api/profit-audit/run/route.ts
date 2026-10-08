import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { runProfitAudit } from "@/lib/profit-audit/engine";
import { analyzeFinancialRows } from "@/lib/profit-audit/analysis";
import { loadFinancialRows } from "@/lib/profit-audit/load-rows";

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

    const financialRows = await loadFinancialRows(supabase, organizationId, importId);
    const findings = runProfitAudit(financialRows);
    const analysis = analyzeFinancialRows(financialRows);

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

    return NextResponse.json({ findings, analysis });
  } catch (error) {
    if (error instanceof Error) {
      const status = error.message === "no_rows" ? 404
        : error.message === "import_too_large" ? 413
        : ["audit_rows_incomplete", "audit_rows_changed"].includes(error.message) ? 409
        : null;
      if (status) return NextResponse.json({ error: error.message }, { status });
    }
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }

    return NextResponse.json({ error: "profit_audit_failed" }, { status: 500 });
  }
}
