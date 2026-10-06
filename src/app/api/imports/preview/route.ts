import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseImportFile } from "@/lib/imports/file-parser";
import { suggestColumnMapping } from "@/lib/imports/column-mapping";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const form = await request.formData();
    const organizationId = form.get("organizationId");
    const file = form.get("file");

    if (typeof organizationId !== "string" || !(file instanceof File)) {
      return NextResponse.json(
        { error: "organizationId and file are required" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const { data: membership, error: membershipError } = await supabase
      .from("memberships")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (membershipError) throw membershipError;
    if (!membership) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const rows = await parseImportFile(file);
    const columns = rows[0] ? Object.keys(rows[0]) : [];

    return NextResponse.json({
      filename: file.name,
      size: file.size,
      rowCount: rows.length,
      columns,
      mapping: suggestColumnMapping(columns),
      preview: rows.slice(0, 25),
      rows
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
      }
      if (error.message === "FILE_TOO_LARGE") {
        return NextResponse.json({ error: "file_too_large" }, { status: 413 });
      }
      if (error.message === "UNSUPPORTED_FILE_TYPE") {
        return NextResponse.json({ error: "unsupported_file_type" }, { status: 415 });
      }
    }

    return NextResponse.json({ error: "preview_failed" }, { status: 500 });
  }
}
