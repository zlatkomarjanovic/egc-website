/**
 * Push CMS export to Sanity using @sanity/import (works when the Sanity CLI fails).
 *
 *   node scripts/import-to-sanity.mjs
 *   node scripts/push-to-sanity.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";
import { sanityImport } from "@sanity/import";

const ROOT = process.cwd();
const ENV_FILE = path.join(ROOT, ".env.local");
const NDJSON = path.join(ROOT, "cms-data", "import.ndjson");

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(ENV_FILE);

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token =
  process.env.SANITY_AUTH_TOKEN ||
  process.env.SANITY_API_TOKEN ||
  process.env.SANITY_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-10-01";

if (!projectId || !token) {
  console.error("Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_AUTH_TOKEN in .env.local");
  process.exit(1);
}
if (!fs.existsSync(NDJSON)) {
  console.error("Missing cms-data/import.ndjson — run: node scripts/import-to-sanity.mjs");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion,
  useCdn: false,
});

const input = fs.createReadStream(NDJSON);
const docCount = fs
  .readFileSync(NDJSON, "utf8")
  .trim()
  .split("\n")
  .filter(Boolean).length;

console.log(`Importing ${docCount} documents to ${projectId}/${dataset}…`);

try {
  await sanityImport(input, {
    client,
    operation: "createOrReplace",
    allowFailingAssets: true,
    onProgress: (progress) => {
      if (progress.step) {
        console.log(
          progress.step,
          progress.current != null && progress.total != null
            ? `(${progress.current}/${progress.total})`
            : ""
        );
      }
    },
  });
  console.log("Import complete.");
} catch (err) {
  console.error("Import failed:", err);
  process.exit(1);
}
