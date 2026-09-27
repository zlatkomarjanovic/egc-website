const COUNTRY_INTROS: Array<{ match: RegExp; html: string }> = [
  {
    match: /<h1\b[^>]*>[\s\S]{0,120}?BOLD Fellowship Serbia[\s\S]{0,80}?<\/h1>/i,
    html: `<p class="text-size-regular">BOLD Fellowship Serbia is EGC's entrepreneurship program for young founders building startups in Serbia, including Belgrade and Novi Sad. Fellows get mentorship, workshops, and a path into the wider Western Balkans BOLD network.</p>`,
  },
  {
    match: /<h1\b[^>]*>[\s\S]{0,120}?BOLD Fellowship North Macedonia[\s\S]{0,80}?<\/h1>/i,
    html: `<p class="text-size-regular">BOLD Fellowship North Macedonia is EGC's entrepreneurship program for young founders building startups in North Macedonia, including Skopje. The fellowship pairs local founder support with regional BOLD programming.</p>`,
  },
  {
    match: /<h1\b[^>]*>[\s\S]{0,120}?BOLD Fellowship Bosnia and Herzegovina[\s\S]{0,80}?<\/h1>/i,
    html: `<p class="text-size-regular">BOLD Fellowship Bosnia and Herzegovina is EGC's entrepreneurship program for young founders building startups in Bosnia and Herzegovina, including Sarajevo and Banja Luka, with mentorship, workshops, and alumni support.</p>`,
  },
];

const RELATED_READS = `
      <section id="egc-related-reads" class="section_layout236">
        <div class="padding-global">
          <div class="container-large">
            <div class="padding-section-large" style="padding-top:0">
              <h2 class="heading-style-h3">Keep reading</h2>
              <p class="text-size-regular">See how this program connects to EGC Insights, alumni founders, and the rest of the portfolio.</p>
              <p class="text-size-regular"><a href="/about-us/insights">EGC Insights</a> · <a href="/alumni">Alumni Spotlight</a> · <a href="/programs">All EGC programs</a> · <a href="/post/why-networking-matters-for-founders">Why networking matters for founders</a> · <a href="/post/how-to-use-storytelling-in-entrepreneurship-beyond-marketing">Storytelling for founders</a></p>
            </div>
          </div>
        </div>
      </section>`;

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

export function stripEmbeddedJsonLd(html: string): string {
  return html.replace(
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
  let next = html.replace(
    /(<h1\b[^>]*>)[\s\S]*?EGC[\s\S]{0,40}Discover your[\s\S]*?(<\/h1>)/i,
    "$1Entrepreneurs for Global Change$2"
  );
  if (
    next.includes("Entrepreneurs for Global Change</h1>") &&
    !next.includes("id=\"egc-what-is\"")
  ) {
    next = next.replace(
      /(<h1\b[^>]*>Entrepreneurs for Global Change<\/h1>)/,
      `$1\n<p id="egc-what-is" class="text-size-regular">EGC is a New York City nonprofit that runs entrepreneurship programs for young founders from emerging ecosystems, including the Western Balkans.</p>`
    );
  }
  return next.replace(
    /<h1 blocks-non-deletable="true" class="heading-style-h2">Entrepreneurs for Global Change<\/h1>/,
    '<h2 blocks-non-deletable="true" class="heading-style-h2">Entrepreneurs for Global Change</h2>'
  );
}

export function fixPartnerHeadings(html: string): string {
  return html
    .replace(
      /<h1 blocks-non-deletable="true" class="heading-style-h2">Program Partners<\/h1>/,
      '<h1 blocks-non-deletable="true" class="heading-style-h2">EGC Partners</h1>'
    )
    .replace(
      /<h1>(<span class="text-highlight">Partner <\/span>with EGC <span>for impact and growth<\/span>)<\/h1>/,
      "<h2>$1</h2>"
    );
}

export function injectPartnerCopy(html: string): string {
  if (!html.includes("EGC Partners") && !html.includes("Program Partners")) return html;
  if (html.includes("id=\"egc-partner-intro\"")) return html;
  return html.replace(
    /(<h1\b[^>]*>EGC Partners<\/h1>)/,
    `$1\n<p id="egc-partner-intro" class="text-size-regular">EGC works with program partners who host and fund fellowships, and with global partners who open networks, mentors, and markets for young founders.</p>`
  );
}

export function fixLeapxHeading(html: string): string {
  if (!html.includes("Entrepreneur in Residence")) return html;
  return html.replace(
    /<h1 class="heading-style-h1 text-color-alternate">[\s\S]*?Entrepreneur in Residence[\s\S]*?<\/h1>/,
    '<h1 class="heading-style-h1 text-color-alternate"><strong>LeapX AI Startup Bootcamp</strong></h1>\n<p class="text-size-regular">Entrepreneur in residence and founder residency, including €5K+ in AI tools, four weeks online, and one week in the Canary Islands.</p>'
  );
}

export function fixInsightsHeading(html: string): string {
  return html
    .replace(
      /<h1 class="heading-style-h2">Read about key trends and insights shaping youth entrepreneurship<\/h1>/,
      '<h1 class="heading-style-h2">EGC Insights</h1>'
    )
    .replace(
      /<h1 class="heading-style-h2">Insights<\/h1>/,
      '<h1 class="heading-style-h2">EGC Insights</h1>'
    );
}

export function fixMentorHeading(html: string): string {
  return html.replace(
    /<h1\b([^>]*)>(?:\s*<span[^>]*>)?\s*Shape the Future of Global Founders\s*(?:<\/span>)?\s*<\/h1>/,
    "<h1$1>Become an EGC Mentor</h1>"
  );
}

export function fixLegalHeadings(html: string): string {
  return html
    .replace(/<h3(\b[^>]*)>\s*Privacy Policy\s*<\/h3>/i, "<h1$1>Privacy Policy</h1>")
    .replace(/<h3(\b[^>]*)>\s*Terms of Service\s*<\/h3>/i, "<h1$1>Terms of Service</h1>")
    .replace(/<h4(\b[^>]*)>(\s*\d+\.\s+[^<]+)<\/h4>/gi, "<h2$1>$2</h2>")
    .replace(/<h5(\b[^>]*)>(\s*\d+\.\s+[^<]+)<\/h5>/gi, "<h2$1>$2</h2>");
}

export function fixNewsletterHeading(html: string): string {
  let next = html;
  if (!/<h1\b/i.test(next) && next.includes("Join Our Mentor Community")) {
    next = next.replace(
      /<h2\b([^>]*)>Join Our Mentor Community<\/h2>/,
      '<h1 class="heading-style-h2">EGC Newsletter</h1>\n<h2$1>EGC program updates</h2>'
    );
  }
  return next.replace(
    /<h2\b([^>]*)>Join Our Mentor Community<\/h2>/,
    "<h2$1>EGC program updates</h2>"
  );
}

export function rewriteClosedTimelines(html: string): string {
  return html.replace(/Program Timeline \([^)]*Closed[^)]*\)/gi, "Program Timeline");
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
    const existing = attrs.match(/\balt="([^"]*)"/i) || attrs.match(/\balt='([^']*)'/i);
    if (existing && existing[1].trim()) return full;
    const srcMatch = attrs.match(/\bsrc="([^"]+)"/i);
    const decorative = /search\.svg|Vector\.svg|arrow|icon-1x1/i.test(srcMatch?.[1] || "");
    const alt = decorative ? "" : escapeAlt(altFromSrc(srcMatch?.[1] || ""));
    if (/\balt=/.test(attrs)) {
      return `<img${attrs.replace(/\balt=(?:"[^"]*"|'[^']*')/, `alt="${alt}"`)}>`;
    }
    if (/\balt(?=[\s>/])/.test(attrs)) {
      return `<img${attrs.replace(/\balt(?=[\s>/])/, `alt="${alt}"`)}>`;
    }
    return `<img alt="${alt}"${attrs}>`;
  });
}

export function fixCareersHeading(html: string): string {
  return html.replace(
    /<h1\b([^>]*)>[\s\S]*?EGC[\s\S]{0,20}Careers[\s\S]*?<\/h1>/i,
    "<h1$1>Careers at EGC</h1>"
  );
}

export function injectContactHeadings(html: string): string {
  if (!html.includes("Get in touch") && !html.includes("Get in Touch")) return html;
  if (html.includes("id=\"egc-contact-visit\"")) return html;
  return html
    .replace(
      /(<h1\b[^>]*>[\s\S]*?Get in touch[\s\S]*?<\/h1>)/i,
      `$1\n<h2 id="egc-contact-visit" class="heading-style-h4">Visit and call</h2>\n<p class="text-size-regular">EGC is based at 1412 Broadway, FL 21, New York City, NY 10018. Phone +1 347-990-2142. Email info@egcnyc.org.</p>\n<h2 class="heading-style-h4">Programs and partnerships</h2>\n<p class="text-size-regular">Use this page for BOLD, Scale 2.0, LeapX, mentorship, and partnership questions.</p>\n<h2 class="heading-style-h4">Press</h2>`
    );
}

export function injectBoardNote(html: string): string {
  if (!html.includes("EGC Board of Directors") && !html.includes("Board of Directors")) {
    return html;
  }
  if (html.includes("id=\"egc-team-note\"")) return html;
  return html.replace(
    /(<h1\b[^>]*>[\s\S]*?Board of Directors[\s\S]*?<\/h1>)/i,
    `$1\n<p id="egc-team-note" class="text-size-regular">The former Our Team page now redirects here while EGC reshuffles staff. This page lists the current board of directors.</p>`
  );
}

export function injectRelatedReads(html: string): string {
  if (html.includes("id=\"egc-related-reads\"")) return html;
  if (!/BOLD Fellowship|Scale 2\.0|LeapX|BOLD Summit|BOLD Regional|University Partnership/.test(html)) {
    return html;
  }
  const footer = html.indexOf("<footer");
  if (footer < 0) return html + RELATED_READS;
  return html.slice(0, footer) + RELATED_READS + html.slice(footer);
}

export function prefixFaqAnswers(html: string): string {
  const program =
    (html.match(/BOLD Fellowship [A-Za-z ]+/) ||
      html.match(/Scale 2\.0/) ||
      html.match(/LeapX/) ||
      html.match(/BOLD Regional Workshop[^<]*/) ||
      html.match(/BOLD Summit/))?.[0];
  if (!program || html.includes("<!-- egc-faq-prefix -->")) return html;
  return `<!-- egc-faq-prefix -->${html.replace(
    /(<div class="faq1_answer[^"]*"[^>]*>\s*<p>)/gi,
    `$1${program}: `
  )}`;
}

export function applySeoHtmlFixups(html: string): string {
  return fillEmptyImageAlts(
    injectRelatedReads(
      prefixFaqAnswers(
        injectBoardNote(
          injectContactHeadings(
            injectPartnerCopy(
              injectCountryIntros(
                rewriteClosedTimelines(
                  fixNewsletterHeading(
                    fixLegalHeadings(
                      fixCareersHeading(
                        fixMentorHeading(
                          fixInsightsHeading(
                            fixLeapxHeading(
                              fixPartnerHeadings(
                                demoteExtraH1s(
                                  fixHomepageHeadings(stripEmbeddedJsonLd(html))
                                )
                              )
                            )
                          )
                        )
                      )
                    )
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
