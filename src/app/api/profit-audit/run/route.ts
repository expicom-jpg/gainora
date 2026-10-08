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

    const { data: saved, error } = await supabase.rpc("persist_profit_audit", {
      target_org: organizationId,
      target_import: importId,
      proposed_findings: findings.map(f => ({ ...f })),
      input_row_count: financialRows.length
    });
    if (error) {
      if (error.message === "audit_rows_changed") return NextResponse.json({ error: error.message }, { status: 409 });
      if (error.code === "42501") return NextResponse.json({ error: "forbidden" }, { status: 403 });
      throw error;
    }
    return NextResponse.json({ findings: (saved ?? []).map(f => ({
      id: f.id, findingType: f.finding_type, title: f.title, description: f.description,
      status: f.status, estimatedAnnualValue: f.estimated_annual_value
    })), analysis });
  } catch (error) {
    if (error instanceof Error) {
      const status = error.message === "no_rows" ? 404
        : error.message === "import_too_large" ? 413
        : error.message === "audit_invalid_amount" ? 422
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
