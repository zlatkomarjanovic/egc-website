/**
 * Fixes a Webflow export bug: assets whose original names contained spaces or
 * punctuation are written to disk with different characters than the exported
 * HTML references (e.g. disk "image-33_1image 33.webp" vs markup
 * "image-33_1image-33.webp"; "X - Y.jpg" vs "X---Y.jpg"; "img@2x" vs "img2x").
 *
 * Webflow's exact slug rule is fiddly, so instead of reproducing it we match each
 * referenced filename to the disk file with the same alphanumeric "fingerprint"
 * (name lowercased with every non-alphanumeric char removed) and rename the disk
 * file to what the markup expects. Robust to any punctuation difference.
 *
 * Idempotent and safe to re-run.  Usage: node scripts/fix-asset-names.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DIRS = ["images", "fonts", "videos"];

const fingerprint = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Every asset path the generated pages reference, grouped by top dir. */
function collectReferences() {
  const refs = new Set();
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".json")) {
        const text = fs.readFileSync(full, "utf8");
        // Match /images|fonts|videos/<file> up to a delimiter. Stop at comma too
        // (srcset / multi-source values) to avoid swallowing two paths at once.
        for (const m of text.matchAll(/\/(images|fonts|videos)\/([^"'\\)\s,]+)/g)) {
          refs.add(`${m[1]}/${decodeURIComponent(m[2])}`);
        }
      }
    }
  };
  walk(path.join(ROOT, "app"));
  return refs;
}

const refs = collectReferences();

// Build fingerprint -> actual disk file, per directory.
const diskByFp = {};
for (const d of DIRS) {
  const dir = path.join(ROOT, "public", d);
  diskByFp[d] = new Map();
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir)) {
    diskByFp[d].set(fingerprint(file), file);
  }
}

let renamed = 0;
const stillMissing = [];

for (const ref of refs) {
  const slash = ref.indexOf("/");
  const dir = ref.slice(0, slash);
  const wanted = ref.slice(slash + 1);
  const diskFull = path.join(ROOT, "public", dir, wanted);
  if (fs.existsSync(diskFull)) continue; // already correct

  const fp = fingerprint(wanted);
  const actual = diskByFp[dir]?.get(fp);
  if (actual && actual !== wanted) {
    fs.renameSync(
      path.join(ROOT, "public", dir, actual),
      path.join(ROOT, "public", dir, wanted)
    );
    diskByFp[dir].set(fp, wanted);
    renamed++;
  } else {
    stillMissing.push(ref);
  }
}

console.log(`Renamed ${renamed} asset file(s).`);
if (stillMissing.length) {
  console.warn(
    `\n⚠ ${stillMissing.length} referenced asset(s) have no match on disk ` +
      `(likely external/Wix images Webflow never exported):`
  );
  stillMissing.forEach((m) => console.warn("  MISS: " + m));
} else {
  console.log(`\n✓ All ${refs.size} referenced assets resolve on disk.`);
}
