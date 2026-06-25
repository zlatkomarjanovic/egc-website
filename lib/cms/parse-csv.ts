import fs from "node:fs";
import path from "node:path";

const CMS_DIR = path.join(process.cwd(), "cms-data");

/** Minimal RFC-style CSV parser (handles quoted fields with commas/newlines). */
export function parseCSV(text: string): string[][] {
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

export function findCsvFile(prefix: string): string | null {
  if (!fs.existsSync(CMS_DIR)) return null;
  const match = fs
    .readdirSync(CMS_DIR)
    .find((name) => name.startsWith(prefix) && name.endsWith(".csv") && !name.includes("(1)"));
  return match ? path.join(CMS_DIR, match) : null;
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
