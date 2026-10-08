import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({ organizationId: z.string().uuid() }).strict();

export async function POST(request: NextRequest) {
  try {
    await requireUser();
    const body = schema.safeParse(await request.json());
    if (!body.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("create_demo_import", { target_org: body.data.organizationId });
    if (error) {
      if (error.code === "42501") return NextResponse.json({ error: "forbidden" }, { status: 403 });
      throw error;
    }
    if (!data) throw new Error("missing_import");
    return NextResponse.json({ importId: data, synthetic: true, rowsCommitted: 8 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    if (error instanceof SyntaxError) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    return NextResponse.json({ error: "demo_failed" }, { status: 500 });
  }
}
