import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

// Deliberately unconditional: reopening file ingestion requires a reviewed release,
// including database and storage permissions, not an environment flag or client claim.
// Never read request.json()/formData() on these retired ingestion endpoints.
export async function rejectFileImport() {
  try {
    await requireUser();
    return NextResponse.json({ error: "file_import_disabled", demoEndpoint: "/api/imports/demo" }, { status: 403 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    return NextResponse.json({ error: "import_unavailable" }, { status: 503 });
  }
}
