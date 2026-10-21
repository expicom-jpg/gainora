import type { InvoiceLine } from "./invoice-lines";

export type CsvPreview = {
  rows: InvoiceLine[];
  errors: { row: number; message: string }[];
};
const FIELDS = ["invoiceId", "invoiceDate", "supplier", "productKey", "currency", "unit", "quantity", "unitPrice"] as const;
const MAX_BYTES = 3_000_000;

function parseRecords(text: string, delimiter: "," | ";"): { line: number; cells: string[] }[] {
  const rows: { line: number; cells: string[] }[] = [];
  let cells: string[] = [], value = "", quoted = false, afterQuote = false, line = 1, rowLine = 1;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') { value += '"'; i++; }
        else { quoted = false; afterQuote = true; }
      } else {
        if (ch === "\n") line++;
        value += ch;
      }
      continue;
    }
    if (ch === '"') {
      if (value !== "" || afterQuote) throw new Error("invalid_csv_quote");
      quoted = true;
    } else if (ch === delimiter) {
      cells.push(value); value = ""; afterQuote = false;
    } else if (ch === "\n" || ch === "\r") {
      cells.push(value);
      if (cells.some(c => c.trim() !== "")) rows.push({ line: rowLine, cells });
      cells = []; value = ""; afterQuote = false;
      if (ch === "\r" && text[i + 1] === "\n") i++;
      line++; rowLine = line;
    } else {
      if (afterQuote && ch !== " " && ch !== "\t") throw new Error("invalid_csv_quote");
      if (!afterQuote) value += ch;
    }
  }
  if (quoted) throw new Error("invalid_csv_quote");
  cells.push(value);
  if (cells.some(c => c.trim() !== "")) rows.push({ line: rowLine, cells });
  return rows;
}

function parseNumber(value: string, decimalComma: boolean): number {
  const cleaned = value.trim();
  if (!cleaned || !(decimalComma ? /^-?\d+(?:,\d+)?$/ : /^-?\d+(?:\.\d+)?$/).test(cleaned)) return NaN;
  return Number(decimalComma ? cleaned.replace(",", ".") : cleaned);
}
function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value + "T00:00:00Z");
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/** Local browser preview only: no storage, upload, tenant sharing or verified savings. */
export function previewInvoiceCsv(text: string, maxRows = 10000): CsvPreview {
  if (new TextEncoder().encode(text).length > MAX_BYTES) throw new Error("csv_too_large");
  const source = text.replace(/^\uFEFF/, "");
  const firstLine = source.split(/\r?\n/, 1)[0] ?? "";
  const delimiter: "," | ";" = firstLine.includes(";") ? ";" : ",";
  const records = parseRecords(source, delimiter);
  if (!records.length) throw new Error("empty_csv");
  const header = records.shift()!.cells.map(c => c.trim());
  if (header.length !== FIELDS.length || FIELDS.some((field, i) => field !== header[i]))
    throw new Error("invalid_csv_headers");
  if (records.length > maxRows) throw new Error("too_many_invoice_lines");
  const rows: InvoiceLine[] = [];
  const errors: CsvPreview["errors"] = [];
  for (const { line, cells } of records) {
    if (cells.length !== FIELDS.length) {
      errors.push({ row: line, message: "Forkert antal kolonner" }); continue;
    }
    const [invoiceId, invoiceDate, supplier, productKey, currency, unit, qty, price] = cells.map(c => c.trim());
    const quantity = parseNumber(qty, delimiter === ";");
    const unitPrice = parseNumber(price, delimiter === ";");
    if (!invoiceId || !supplier || !productKey || !currency || !unit || !validDate(invoiceDate) ||
        !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0 ||
        !/^[A-Za-z]{3}$/.test(currency)) {
      errors.push({ row: line, message: "Ugyldig dato, felt, valuta, antal eller enhedspris" }); continue;
    }
    rows.push({ invoiceId, invoiceDate, supplier, productKey, currency: currency.toUpperCase(), unit, quantity, unitPrice });
  }
  return { rows, errors };
}
