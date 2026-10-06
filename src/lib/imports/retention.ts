export const ORIGINAL_IMPORT_RETENTION_DAYS = 7;

export function calculateOriginalFileDeleteAfter(now = new Date()) {
  const deleteAfter = new Date(now);
  deleteAfter.setUTCDate(deleteAfter.getUTCDate() + ORIGINAL_IMPORT_RETENTION_DAYS);
  return deleteAfter;
}

export function buildTenantImportPath(
  organizationId: string,
  importId: string,
  filename: string
) {
  const safeFilename = filename
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

  return `${organizationId}/${importId}/${safeFilename || "upload"}`;
}
