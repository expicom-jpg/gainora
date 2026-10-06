import { z } from "zod";

export const importRowSchema = z.object({
  date: z.string().min(1),
  account: z.string().min(1),
  description: z.string().optional().default(""),
  amount: z.coerce.number()
});

export type ImportRow = z.infer<typeof importRowSchema>;

export function validateImportRows(rows: unknown[]) {
  return rows.map((row, index) => {
    const parsed = importRowSchema.safeParse(row);
    return parsed.success
      ? { index, valid: true as const, data: parsed.data }
      : { index, valid: false as const, issues: parsed.error.flatten() };
  });
}
