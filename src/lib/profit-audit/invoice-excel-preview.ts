import { previewInvoiceCsv, type CsvPreview } from "./invoice-csv-preview";

const HEADERS = ["invoiceId","invoiceDate","supplier","productKey","currency","unit","quantity","unitPrice"];
const MAX_FILE_BYTES = 3_000_000;
const MAX_ROWS = 10_000;

function csvCell(value: string): string {
  return '"' + value.replaceAll('"', '""') + '"';
}

/**
 * Browser-only Excel preview. Rejects formulas and unexpected cell types; does
 * not upload or persist customer documents. ExcelJS is loaded only on demand.
 */
export async function previewInvoiceExcel(buffer: ArrayBuffer): Promise<CsvPreview> {
  if (!buffer.byteLength || buffer.byteLength > MAX_FILE_BYTES) throw new Error("excel_invalid_size");
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  if (workbook.worksheets.length !== 1) throw new Error("excel_requires_one_sheet");
  const sheet = workbook.worksheets[0];
  if (sheet.rowCount > MAX_ROWS + 1) throw new Error("too_many_invoice_lines");
  const cellText = (row: number, col: number): string => {
    const value = sheet.getRow(row).getCell(col).value;
    if (value === null || value === undefined) return "";
    if (typeof value === "string" || typeof value === "number") return String(value);
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    // Reject formula, hyperlinks, rich text and any uncertain Excel cell shape.
    throw new Error("excel_unsupported_cell");
  };
  if (HEADERS.some((name, i) => cellText(1, i + 1).trim() !== name)) throw new Error("invalid_excel_headers");
  const lines = [HEADERS.join(",")];
  for (let row = 2; row <= sheet.rowCount; row++) {
    const cells = HEADERS.map((_, i) => cellText(row, i + 1));
    if (cells.every(value => !value.trim())) continue;
    lines.push(cells.map(csvCell).join(","));
  }
  return previewInvoiceCsv(lines.join("\n"), MAX_ROWS);
}
