import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { assertRealCustomerDataAllowed } from "@/lib/data-readiness";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeImportRows } from "@/lib/imports/normalize";

const commitSchema = z.object({
  organizationId: z.string().uuid(),
  filename: z.string().min(1).max(255),
  synthetic: z.boolean().default(true),
  mapping: z.object({
    date: z.string().min(1),
    account: z.string().min(1),
    description: z.string().min(1),
    amount: z.string().min(1)
  }),
  rows: z.array(z.record(z.string(), z.union([z.string(), z.number(), z.null()]))).min(1).max(10000)
});

export async function POST(request: NextRequest) {
  try {
    await requireUser();

    const parsedBody = commitSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "invalid_request", details: parsedBody.error.flatten() },
        { status: 400 }
      );
    }

    const body = parsedBody.data;

    if (!body.synthetic) {
      assertRealCustomerDataAllowed();
    }

    const normalizedRows = normalizeImportRows(body.rows, body.mapping);
    const supabase = await createSupabaseServerClient();

    const { data: importId, error } = await supabase.rpc("commit_financial_import", {
      target_org: body.organizationId,
      source_filename: body.filename,
      normalized_rows: normalizedRows,
      is_synthetic: body.synthetic
    });

    if (error) {
      if (error.message.toLowerCase().includes("forbidden")) {
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
      }
      throw error;
    }

    return NextResponse.json({
      importId,
      rowsCommitted: normalizedRows.length,
      synthetic: body.synthetic
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
      }
      if (
        error.message === "REAL_CUSTOMER_DATA_READY is false." ||
        error.message === "Real customer data is not allowed outside production."
      ) {
        return NextResponse.json({ error: "real_customer_data_blocked" }, { status: 403 });
      }
      if (error.message.startsWith("INVALID_ROW:")) {
        return NextResponse.json(
          { error: "invalid_row", row: Number(error.message.split(":")[1]) },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ error: "import_commit_failed" }, { status: 500 });
  }
}
