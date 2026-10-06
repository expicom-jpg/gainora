import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const createOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(120)
});

export async function POST(request: NextRequest) {
  try {
    await requireUser();

    const parsed = createOrganizationSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const { data: organizationId, error } = await supabase.rpc("create_organization", {
      org_name: parsed.data.name
    });

    if (error) throw error;

    return NextResponse.json({ organizationId }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }

    return NextResponse.json({ error: "organization_create_failed" }, { status: 500 });
  }
}
