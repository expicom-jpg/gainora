import { describe, expect, it } from "vitest";
import {
  ORIGINAL_IMPORT_RETENTION_DAYS,
  buildTenantImportPath,
  calculateOriginalFileDeleteAfter
} from "./retention";

describe("import retention", () => {
  it("uses a seven-day original-file retention period", () => {
    expect(ORIGINAL_IMPORT_RETENTION_DAYS).toBe(7);
    expect(
      calculateOriginalFileDeleteAfter(new Date("2026-10-01T00:00:00Z")).toISOString()
    ).toBe("2026-10-08T00:00:00.000Z");
  });

  it("builds a tenant-scoped safe storage path", () => {
    expect(
      buildTenantImportPath("org-1", "import-1", "October / finance.xlsx")
    ).toBe("org-1/import-1/October-finance.xlsx");
  });
});
