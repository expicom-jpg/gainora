import ExcelJS from "exceljs";

export const MAX_IMPORT_BYTES = 5 * 1024 * 1024;

export type ParsedTabularRow = Record<string, string | number | null>;

function normalizeHeader(value: unknown, index: number) {
  const text = String(value ?? "").trim();
  return text || `column_${index + 1}`;
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === "," && !quoted) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

export function parseCsv(text: string): ParsedTabularRow[] {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);

  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    return Object.fromEntries(
      headers.map((header, index) => [header, cells[index] ?? ""])
    );
  });
}

export async function parseXlsx(buffer: Buffer): Promise<ParsedTabularRow[]> {
  const workbook = new ExcelJS.Workbook();
  const payload = buffer as unknown as Parameters<typeof workbook.xlsx.load>[0];
  await workbook.xlsx.load(payload);

  const sheet = workbook.worksheets[0];
  if (!sheet || sheet.rowCount < 2) return [];

  const headerRow = sheet.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    headers[colNumber - 1] = normalizeHeader(cell.value, colNumber - 1);
  });

  const rows: ParsedTabularRow[] = [];

  for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber += 1) {
    const row = sheet.getRow(rowNumber);
    const object: ParsedTabularRow = {};

    headers.forEach((header, index) => {
      const value = row.getCell(index + 1).value;
      object[header] =
        typeof value === "number" || typeof value === "string"
          ? value
          : value == null
            ? null
            : String(value);
    });

    if (Object.values(object).some((value) => value !== null && value !== "")) {
      rows.push(object);
    }
  }

  return rows;
}

export async function parseImportFile(file: File) {
  if (file.size > MAX_IMPORT_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }

  const filename = file.name.toLowerCase();

  if (filename.endsWith(".csv")) {
    return parseCsv(await file.text());
  }

  if (filename.endsWith(".xlsx")) {
    return parseXlsx(Buffer.from(await file.arrayBuffer()));
  }

  throw new Error("UNSUPPORTED_FILE_TYPE");
}
