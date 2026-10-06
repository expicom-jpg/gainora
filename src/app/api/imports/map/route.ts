import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { suggestColumnMapping } from "@/lib/imports/column-mapping";

export async function POST(request: NextRequest) {
  try {
    await requireUser();
    const body = await request.json();

    if (!Array.isArray(body?.columns) || body.columns.some((x: unknown) => typeof x !== "string")) {
      return NextResponse.json({ error: "columns must be a string array" }, { status: 400 });
    }

    return NextResponse.json({
      mapping: suggestColumnMapping(body.columns)
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    return NextResponse.json({ error: "mapping_failed" }, { status: 500 });
  }
}
