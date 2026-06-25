import fs from "node:fs";
import path from "node:path";

const CMS_DIR = path.join(process.cwd(), "..", "cms-data");

function parseFields(text: string): string[] {
  const row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else {
      field += char;
    }
  }

  row.push(field);
  return row;
}

function parseSimpleCsv(text: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

/** Parse Webflow CSV exports where long text fields span multiple physical lines. */
export function parseCSV(text: string): string[][] {
  const lines = text.split(/\r?\n/);
  if (!lines.length) return [];

  const sample = lines.slice(1).find((line) => line.trim());
  let rowStart: RegExp | null = null;

  if (sample) {
    const match = sample.match(/^([^,\n]+),([a-z0-9][a-z0-9-]*),([0-9a-f]{24}),/i);
    if (match) {
      rowStart = new RegExp(`^[^,\\n]+,[a-z0-9][a-z0-9-]*,${match[3]},`, "i");
    }
  }

  if (!rowStart) return parseSimpleCsv(text);

  const chunks: string[] = [];
  let current: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    if (rowStart.test(line) && current.length) {
      chunks.push(current.join("\n"));
      current = [line];
    } else if (rowStart.test(line)) {
      current = [line];
    } else {
      current.push(line);
    }
  }

  if (current.length) chunks.push(current.join("\n"));

  const headerFields = parseFields(lines[0]).map((cell) => cell.trim());
  return [headerFields, ...chunks.map((chunk) => {
    const fields = parseFields(chunk);
    return headerFields.map((_, index) => fields[index] ?? "");
  })];
}

export function findCsvFile(prefix: string): string | null {
  if (!fs.existsSync(CMS_DIR)) return null;

  const files = fs
    .readdirSync(CMS_DIR)
    .filter((name) => name.startsWith(prefix) && name.endsWith(".csv"))
    .sort((a, b) => {
      const aDup = a.includes("(1)") ? 1 : 0;
      const bDup = b.includes("(1)") ? 1 : 0;
      return aDup - bDup;
    });

  let bestFile: string | null = null;
  let bestCount = -1;

  for (const file of files) {
    const text = fs.readFileSync(path.join(CMS_DIR, file), "utf8");
    const count = Math.max(0, parseCSV(text).length - 1);
    if (count > bestCount) {
      bestCount = count;
      bestFile = file;
    } else if (count === bestCount && bestFile && !file.includes("(1)")) {
      bestFile = file;
    }
  }

  return bestFile ? path.join(CMS_DIR, bestFile) : null;
}

export function readCsvRows(prefix: string): Record<string, string>[] {
  const file = findCsvFile(prefix);
  if (!file) return [];

  const rows = parseCSV(fs.readFileSync(file, "utf8"));
  const header = rows[0]?.map((cell) => cell.trim()) ?? [];

  return rows
    .slice(1)
    .filter((row) => row.some((cell) => cell.trim() !== ""))
    .map((row) => {
      const record: Record<string, string> = {};
      header.forEach((key, index) => {
        record[key] = (row[index] ?? "").trim();
      });
      return record;
    });
}
