const COUNTRY_INTROS: Array<{ match: RegExp; html: string }> = [
  {
    match: /<h1\b[^>]*>\s*BOLD Fellowship Serbia\s*<\/h1>/i,
    html: `<p class="text-size-regular">BOLD Fellowship Serbia is EGC's entrepreneurship program for young founders building startups in Serbia. Fellows get mentorship, workshops, and a path into the wider Western Balkans BOLD network.</p>`,
  },
  {
    match: /<h1\b[^>]*>\s*BOLD Fellowship North Macedonia\s*<\/h1>/i,
    html: `<p class="text-size-regular">BOLD Fellowship North Macedonia is EGC's entrepreneurship program for young founders building startups in North Macedonia. The fellowship pairs local founder support with regional BOLD programming.</p>`,
  },
  {
    match: /<h1\b[^>]*>\s*BOLD Fellowship Bosnia and Herzegovina\s*<\/h1>/i,
    html: `<p class="text-size-regular">BOLD Fellowship Bosnia and Herzegovina is EGC's entrepreneurship program for young founders building startups in Bosnia and Herzegovina, with mentorship, workshops, and alumni support.</p>`,
  },
];

function escapeAlt(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function altFromSrc(src: string): string {
  const file = src.split("/").pop() || "EGC";
  const name = file
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b(img|image|logo|icon|group|screenshot)\b/gi, "")
    .replace(/\d{5,}/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!name || name.length < 3) return "Entrepreneurs for Global Change";
  return name;
}

export function stripSeoHeadExtras(html: string): string {
  return html
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, "")
    .replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi, "")
    .replace(/<meta\b[^>]*property=["']og:[^"']+["'][^>]*>/gi, "")
    .replace(/<meta\b[^>]*name=["'](?:twitter|description)[^"']*["'][^>]*>/gi, "")
    .replace(
      /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,
      ""
    );
}

export function demoteExtraH1s(html: string): string {
  let first = true;
  return html.replace(/<h1(\b[^>]*)>([\s\S]*?)<\/h1>/gi, (full, attrs, inner) => {
    if (first) {
      first = false;
      return full;
    }
    const classMatch = String(attrs).match(/\bclass="([^"]*)"/i);
    const classes = classMatch?.[1] || "heading-style-h2";
    return `<h2 class="${classes}">${inner}</h2>`;
  });
}

export function fixHomepageHeadings(html: string): string {
  return html.replace(
    /<h1 blocks-non-deletable="true" class="heading-style-h2">Entrepreneurs for Global Change<\/h1>/,
    '<h2 blocks-non-deletable="true" class="heading-style-h2">Entrepreneurs for Global Change</h2>'
  );
}

export function fixPartnerHeadings(html: string): string {
  return html.replace(
    /<h1>(<span class="text-highlight">Partner <\/span>with EGC <span>for impact and growth<\/span>)<\/h1>/,
    "<h2>$1</h2>"
  );
}

export function fixLeapxHeading(html: string): string {
  if (!html.includes("Entrepreneur in Residence")) return html;
  return html.replace(
    /<h1 class="heading-style-h1 text-color-alternate"><strong>Entrepreneur in Residence \| Founder Residency<\/strong>[\s\S]*?<\/h1>/,
    '<h1 class="heading-style-h1 text-color-alternate"><strong>LeapX AI Startup Bootcamp</strong> <br><span class="subheading-span"><strong>Entrepreneur in Residence. Founder residency while living an unforgettable experience.</strong></span></h1>'
  );
}

export function fixInsightsHeading(html: string): string {
  return html.replace(
    /<h1 class="heading-style-h2">Read about key trends and insights shaping youth entrepreneurship<\/h1>/,
    '<h1 class="heading-style-h2">Insights</h1>'
  );
}

export function fixMentorHeading(html: string): string {
  return html.replace(
    /<h1\b([^>]*)>Shape the Future of Global Founders<\/h1>/,
    "<h1$1>Become an EGC Mentor</h1>"
  );
}

export function fixLegalHeadings(html: string): string {
  return html
    .replace(/<h3(\b[^>]*)>\s*Privacy Policy\s*<\/h3>/i, "<h1$1>Privacy Policy</h1>")
    .replace(/<h3(\b[^>]*)>\s*Terms of Service\s*<\/h3>/i, "<h1$1>Terms of Service</h1>");
}

export function fixNewsletterHeading(html: string): string {
  if (!html.includes("Join Our Mentor Community")) return html;
  if (/<h1\b/i.test(html)) return html;
  return html.replace(
    /<h2\b([^>]*)>Join Our Mentor Community<\/h2>/,
    '<h1 class="heading-style-h2">EGC Newsletter</h1>\n<h2$1>Join Our Mentor Community</h2>'
  );
}

export function rewriteClosedTimelines(html: string): string {
  return html.replace(
    /Program Timeline \(Applications are now Closed\)/g,
    "Program Timeline"
  );
}

export function injectCountryIntros(html: string): string {
  let next = html;
  for (const item of COUNTRY_INTROS) {
    if (next.includes(item.html)) continue;
    next = next.replace(item.match, (match) => `${match}\n${item.html}`);
  }
  return next;
}

export function fillEmptyImageAlts(html: string): string {
  return html.replace(/<img\b([^>]*)>/gi, (full, attrs: string) => {
    if (/\balt="[^"]+"/.test(attrs) || /\balt='[^']+'/.test(attrs)) return full;
    const srcMatch = attrs.match(/\bsrc="([^"]+)"/i);
    const alt = escapeAlt(altFromSrc(srcMatch?.[1] || ""));
    if (/\balt(?=[\s>/])/.test(attrs)) {
      return `<img${attrs.replace(/\balt(?=[\s>/])/, `alt="${alt}"`)}>`;
    }
    return `<img alt="${alt}"${attrs}>`;
  });
}

export function applySeoHtmlFixups(html: string): string {
  return fillEmptyImageAlts(
    injectCountryIntros(
      rewriteClosedTimelines(
        fixNewsletterHeading(
          fixLegalHeadings(
            fixMentorHeading(
              fixInsightsHeading(
                fixLeapxHeading(
                  fixPartnerHeadings(
                    demoteExtraH1s(fixHomepageHeadings(html))
                  )
                )
              )
            )
          )
        )
      )
    )
  );
}
