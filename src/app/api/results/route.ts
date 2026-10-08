import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const resultSchema = z.object({
  organizationId: z.string().uuid(),
  findingId: z.string().uuid(),
  title: z.string().trim().min(2).max(160),
  baselineValue: z.coerce.number().optional(),
  resultValue: z.coerce.number().optional(),
  attributedValue: z.coerce.number().optional(),
  notes: z.string().max(4000).default("")
});

export async function POST(request: NextRequest) {
  try {
    await requireUser();
    const parsed = resultSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const body = parsed.data;
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("results")
      .insert({
        organization_id: body.organizationId,
        finding_id: body.findingId,
        title: body.title,
        baseline_value: body.baselineValue ?? null,
        result_value: body.resultValue ?? null,
        attributed_value: body.attributedValue ?? null,
        notes: body.notes
      })
      .select("id,title,baseline_value,result_value,attributed_value,created_at")
      .single();

    if (error) {
      if (error.code === "23514") return NextResponse.json({ error: "finding_not_approved_or_invalid" }, { status: 409 });
      if (error.code === "42501") return NextResponse.json({ error: "forbidden" }, { status: 403 });
      throw error;
    }
    // Database triggers commit the result, finding state and audit events atomically.

    return NextResponse.json({ result: data }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    return NextResponse.json({ error: "result_create_failed" }, { status: 500 });
  }
}
