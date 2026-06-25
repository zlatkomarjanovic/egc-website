/**
 * Webflow CSV helpers — handles multiline quoted fields and duplicate export files.
 */
import fs from "node:fs";
import path from "node:path";

export function getCmsDataDir(cwd = process.cwd()) {
  return path.join(cwd, "cms-data");
}

function parseFields(text) {
  const row = [];
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

function parseSimpleCsv(text) {
  const rows = [];
  let field = "";
  let row = [];
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
export function parseWebflowCsv(text) {
  const lines = text.split(/\r?\n/);
  if (!lines.length) return [];

  const headerLine = lines[0];
  const sample = lines.slice(1).find((line) => line.trim());
  let rowStart = null;

  if (sample) {
    const match = sample.match(/^([^,\n]+),([a-z0-9][a-z0-9-]*),([0-9a-f]{24}),/i);
    if (match) {
      const collectionId = match[3];
      rowStart = new RegExp(`^[^,\\n]+,[a-z0-9][a-z0-9-]*,${collectionId},`, "i");
    }
  }

  if (!rowStart) {
    const rows = parseSimpleCsv(text);
    const header = rows[0]?.map((cell) => cell.trim()) ?? [];
    return rows
      .slice(1)
      .filter((row) => row.some((cell) => cell.trim() !== ""))
      .map((row) => {
        const record = {};
        header.forEach((key, index) => {
          record[key] = (row[index] ?? "").trim();
        });
        return record;
      });
  }

  const chunks = [];
  let current = [];

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

  const headerFields = parseFields(headerLine).map((cell) => cell.trim());
  return chunks.map((chunk) => {
    const fields = parseFields(chunk);
    const record = {};
    headerFields.forEach((key, index) => {
      record[key] = (fields[index] ?? "").trim();
    });
    return record;
  });
}

export function findBestCsvFile(dir, prefix) {
  const files = fs
    .readdirSync(dir)
    .filter((name) => name.startsWith(prefix) && name.endsWith(".csv"))
    .sort((a, b) => {
      const aDup = a.includes("(1)") ? 1 : 0;
      const bDup = b.includes("(1)") ? 1 : 0;
      return aDup - bDup;
    });

  let bestFile = null;
  let bestCount = -1;

  for (const file of files) {
    const text = fs.readFileSync(path.join(dir, file), "utf8");
    const count = parseWebflowCsv(text).length;
    if (count > bestCount) {
      bestCount = count;
      bestFile = file;
    } else if (count === bestCount && bestFile && file.includes("(1)") === false) {
      bestFile = file;
    }
  }

  return bestFile;
}

export function readWebflowCsvRows(dir, prefix) {
  const file = findBestCsvFile(dir, prefix);
  if (!file) return { file: null, rows: [] };
  const rows = parseWebflowCsv(fs.readFileSync(path.join(dir, file), "utf8"));
  return { file, rows };
}
