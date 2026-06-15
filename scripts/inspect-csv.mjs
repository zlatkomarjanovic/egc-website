import fs from "node:fs";
import path from "node:path";

function parseCSV(t) {
  const rows = [];
  let f = "", row = [], q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) {
      if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; }
      else f += c;
    } else {
      if (c === '"') q = true;
      else if (c === ",") { row.push(f); f = ""; }
      else if (c === "\n") { row.push(f); rows.push(row); row = []; f = ""; }
      else if (c === "\r") { /* skip */ }
      else f += c;
    }
  }
  if (f.length || row.length) { row.push(f); rows.push(row); }
  return rows;
}

const DIR = path.join(process.cwd(), "cms-data");

function show(file, cols) {
  const rows = parseCSV(fs.readFileSync(path.join(DIR, file), "utf8"));
  const h = rows[0].map((x) => x.trim());
  console.log("\n### " + file);
  console.log("rows:", rows.length - 1);
  for (const r of rows.slice(1, 3)) {
    for (const cn of cols) {
      const idx = h.indexOf(cn);
      console.log("  [" + cn + "] = " + JSON.stringify((r[idx] || "").slice(0, 110)));
    }
    console.log("  ----");
  }
}

show("Copy of EGC - Blog Posts - 6a2ed7db57ccd44542c257a7.csv", ["Name", "Author", "Co Authors", "Category", "Tags", "Main Image", "Color"]);
show("Copy of EGC - Mentors - 6a2ed7db57ccd44542c2586f.csv", ["Mentor Name", "Primary Expertise", "Other areas of expertise", "Mentoring session images"]);
show("Copy of EGC - Partner Spotlights - 6a2ed7db57ccd44542c2586b.csv", ["Name", "Partner", "Photos"]);
show("Copy of EGC - Alumni Spotlights - 6a2ed7db57ccd44542c2586a.csv", ["Name", "Photos", "Country", "Featured"]);
show("Copy of EGC - Authors - 6a2ed7db57ccd44542c257d6.csv", ["Name", "Picture"]);
show("Copy of EGC - Tags - 6a2ed7db57ccd44542c25869.csv", ["Name", "Slug"]);
show("Copy of EGC - Areas of Expertise and Interests of Mentors, Alumnis and Mentees - 6a2ed7db57ccd44542c25870.csv", ["Name", "Slug"]);
