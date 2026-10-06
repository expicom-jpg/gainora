import { importRowSchema, type ImportRow } from "@/lib/imports/schema";
import type { CanonicalField } from "@/lib/imports/column-mapping";
import type { ParsedTabularRow } from "@/lib/imports/file-parser";

export type CompleteColumnMapping = Record<CanonicalField, string>;

export function normalizeImportRows(
  rows: ParsedTabularRow[],
  mapping: CompleteColumnMapping
): ImportRow[] {
  return rows.map((row, index) => {
    const candidate = {
      date: row[mapping.date],
      account: row[mapping.account],
      description: row[mapping.description] ?? "",
      amount: row[mapping.amount]
    };

    const parsed = importRowSchema.safeParse(candidate);

    if (!parsed.success) {
      throw new Error(`INVALID_ROW:${index + 2}`);
    }

    return parsed.data;
  });
}
