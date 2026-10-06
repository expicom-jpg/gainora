import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { validateImportRows } from "@/lib/imports/schema";

export async function POST(request: NextRequest) {
  try {
    await requireUser();
    const body = await request.json();

    if (!Array.isArray(body?.rows)) {
      return NextResponse.json({ error: "rows must be an array" }, { status: 400 });
    }

    const results = validateImportRows(body.rows);
    const validCount = results.filter((x) => x.valid).length;

    return NextResponse.json({
      total: results.length,
      valid: validCount,
      invalid: results.length - validCount,
      results
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    return NextResponse.json({ error: "validation_failed" }, { status: 500 });
  }
}
