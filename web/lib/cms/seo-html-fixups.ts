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
              <p class="heading-style-h3" role="doc-subtitle">Keep reading</p>
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

function isHomepageHtml(html: string): boolean {
  return (
    html.includes('id="egc-what-is"') ||
    /unique because of our/i.test(html) ||
    /Discover your[\s\S]{0,80}inner entrepreneur/i.test(html)
  );
}

export function fixHomepageHeadings(html: string): string {
  let next = html.replace(
    /(<h1\b[^>]*>)[\s\S]*?EGC[\s\S]{0,40}Discover your[\s\S]*?(<\/h1>)/i,
    "$1Entrepreneurs for Global Change$2"
  );
  if (next.includes("Entrepreneurs for Global Change</h1>")) {
    if (!next.includes('id="egc-what-is"')) {
      next = next.replace(
        /(<h1\b[^>]*>Entrepreneurs for Global Change<\/h1>)/,
        `$1\n<p id="egc-what-is" class="text-size-regular">EGC is a New York City nonprofit that runs entrepreneurship programs for young founders from emerging ecosystems, including the Western Balkans. This page lists 85 alumni members.</p>`
      );
    } else if (!next.includes("85 alumni members")) {
      next = next.replace(
        /(<p id="egc-what-is"[^>]*>)([\s\S]*?)(<\/p>)/,
        `$1$2 This page lists 85 alumni members.$3`
      );
    }
  }
  next = next.replace(
    /<h1 blocks-non-deletable="true" class="heading-style-h2">Entrepreneurs for Global Change<\/h1>/,
    '<h2 blocks-non-deletable="true" class="heading-style-h2">What EGC is</h2>'
  );
  next = next.replace(
    /<h2(\b[^>]*)>(?:(?!<\/h2>)[\s\S])*unique because of our\s*<\/h2>/i,
    `<h2$1>Why founders choose EGC</h2>
<p id="egc-why-founders" class="text-size-regular">EGC is an entrepreneurship community, and we are unique because of our network, dedication, and location.</p>`
  );
  if (!next.includes('id="egc-why-founders"')) {
    next = next.replace(
      /<p class="text-size-regular">(EGC is an entrepreneurship community, and we are unique because of our network, dedication, and location\.)<\/p>/,
      '<p id="egc-why-founders" class="text-size-regular">$1</p>'
    );
  }
  return next;
}

export function renameHomepageDuplicateHeading(html: string): string {
  if (!isHomepageHtml(html)) return html;
  return html.replace(
    /<h2(\b[^>]*)>\s*Entrepreneurs for Global Change\s*<\/h2>/gi,
    "<h2$1>What EGC is</h2>"
  );
}

export function demoteKeepReadingHeadings(html: string): string {
  return html.replace(
    /<h2(\b[^>]*)>\s*Keep reading\s*<\/h2>/gi,
    '<p$1 role="doc-subtitle">Keep reading</p>'
  );
}

export function fixBoldProgramNote(html: string): string {
  return html.replace(
    /<h2(\b[^>]*)>\s*The BOLD Fellowship for Entrepreneurship is a program of the U\.S\. Department of State\.\s*<\/h2>/i,
    '<p$1 role="note">The BOLD Fellowship for Entrepreneurship is a program of the U.S. Department of State.</p>'
  );
}

export function fixMentorQuotes(html: string): string {
  if (!html.includes("testimonial5_content") || !html.includes("test-txt")) {
    return html;
  }
  return html.replace(
    /<div class="testimonial5_content">\s*<h3 class="([^"]*\btest-txt\b[^"]*)">([\s\S]*?)<\/h3>([\s\S]*?<div class="text-weight-semibold">)([^<]+)(<\/div>)/gi,
    (full, quoteClass, quote, middle, name, nameClose) => {
      const text = String(quote).replace(/<[^>]+>/g, "").trim();
      const who = String(name).replace(/\s+/g, " ").trim();
      if (text.length < 80 || !who || who.length > 80) return full;
      return `<div class="testimonial5_content">
                    <h3 class="heading-style-h5">${who}</h3>
                    <blockquote class="${quoteClass}">${quote}</blockquote>${middle}${name}${nameClose}`;
    }
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
  let next = html;
  if (next.includes("Entrepreneur in Residence")) {
    next = next.replace(
      /<h1 class="heading-style-h1 text-color-alternate">[\s\S]*?Entrepreneur in Residence[\s\S]*?<\/h1>/,
      '<h1 class="heading-style-h1 text-color-alternate"><strong>LeapX AI Startup Bootcamp</strong></h1>\n<p class="text-size-regular">Entrepreneur in residence and founder residency, including €5K+ in AI tools, four weeks online, and one week in the Canary Islands.</p>'
    );
  }
  return next
    .replace(
      /<h2(\b[^>]*)>\s*(?:<strong>)?How to Apply(?:<\/strong>)?\s*<\/h2>/i,
      "<h2$1>Application status</h2>"
    )
    .replace(
      /<h2(\b[^>]*)>\s*By the end of the program, founders will have:\s*<\/h2>/i,
      "<h2$1>Outcomes</h2>"
    )
    .replace(/<h3(\b[^>]*)>\s*This is not\s*<\/h3>/gi, "<h3$1>LeapX is not</h3>")
    .replace(/<h3(\b[^>]*)>\s*This is\s*<\/h3>/gi, "<h3$1>LeapX is</h3>");
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

export function fixSummitCtas(html: string): string {
  return html.replace(
    /<a href="#" class="button is-bigger w-button">Read more about EGC<\/a>/gi,
    '<a href="/about-us" class="button is-bigger w-button">Read more about EGC</a>'
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

const COUNTRY_STATUS: Array<{ match: RegExp; label: string }> = [
  { match: /<h1\b[^>]*>[\s\S]{0,120}?BOLD Fellowship Serbia[\s\S]{0,80}?<\/h1>/i, label: "Serbia" },
  {
    match: /<h1\b[^>]*>[\s\S]{0,120}?BOLD Fellowship North Macedonia[\s\S]{0,80}?<\/h1>/i,
    label: "North Macedonia",
  },
  {
    match: /<h1\b[^>]*>[\s\S]{0,120}?BOLD Fellowship Bosnia and Herzegovina[\s\S]{0,80}?<\/h1>/i,
    label: "Bosnia and Herzegovina",
  },
];

function countryStatusNote(label: string): string {
  return `<p id="egc-country-status" class="text-size-regular">Applications for BOLD Fellowship ${label} are closed. Watch this page and EGC channels for the next cycle. If you are eligible, consider <a href="/programs/leapx">LeapX</a> or <a href="/programs/scale-2-0">Scale 2.0</a>.</p>`;
}

export function injectCountryIntros(html: string): string {
  let next = html;
  for (const item of COUNTRY_INTROS) {
    if (next.includes(item.html)) continue;
    next = next.replace(item.match, (match) => `${match}\n${item.html}`);
  }
  return next;
}

export function injectCountryStatusNotes(html: string): string {
  let next = html.replace(
    /\s*Applications open on October 14th and close on November 4th\./gi,
    ""
  );
  if (next.includes('id="egc-country-status"')) return next;
  for (const item of COUNTRY_STATUS) {
    const updated = next.replace(item.match, (match) => `${match}\n${countryStatusNote(item.label)}`);
    if (updated !== next) {
      return updated;
    }
  }
  return next;
}

function imageAttr(attrs: string, name: string, value: string): string {
  const quoted = new RegExp(`\\s${name}="[^"]*"`, "i");
  const single = new RegExp(`\\s${name}='[^']*'`, "i");
  const bare = new RegExp(`\\s${name}(?=[\\s>/])`, "i");
  if (quoted.test(attrs)) return attrs.replace(quoted, ` ${name}="${value}"`);
  if (single.test(attrs)) return attrs.replace(single, ` ${name}="${value}"`);
  if (bare.test(attrs)) return attrs.replace(bare, ` ${name}="${value}"`);
  return `${attrs} ${name}="${value}"`;
}

function isSearchIcon(src: string, className: string): boolean {
  return /search\.svg/i.test(src) || /\bsearch-icon\b/i.test(className);
}

function isDecorativeImage(src: string, className: string): boolean {
  if (isSearchIcon(src, className)) return false;
  if (/navbar2_logo|footer-egc-logo|layout3_image|fellow-img|blog21_/i.test(className)) {
    return false;
  }
  return (
    /arrow-left\.svg|Vector\.svg|Subtract\.svg/i.test(src) ||
    /icon-1x1|testimonial15_arrow-icon/i.test(className)
  );
}

function visibleText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function rewriteLayout3CardAlts(card: string, pageContext: "board" | "advisory" | "people"): string {
  const name = visibleText(
    card.match(/<h2\b[^>]*class="[^"]*heading-style-h3[^"]*"[^>]*>([\s\S]*?)<\/h2>/i)?.[1] || ""
  );
  if (!name) return card;
  const role = visibleText(
    card.match(/<div class="tagline-light">([\s\S]*?)<\/div>/i)?.[1] || ""
  );
  const context =
    pageContext === "advisory"
      ? "Advisory Board"
      : pageContext === "board"
        ? "Board of Directors"
        : "EGC";
  const parts = [name, role || undefined, context === "EGC" ? undefined : context, "EGC"].filter(
    Boolean
  );
  const alt = escapeAlt(parts.join(", "));
  return card.replace(/<img\b([^>]*\blayout3_image\b[^>]*)>/gi, (_full, attrs: string) => {
    return `<img${imageAttr(attrs, "alt", alt)}>`;
  });
}

function walkLayout3Cards(html: string, rewrite: (card: string) => string): string {
  const startToken = '<div class="w-layout-grid layout3_component">';
  let output = "";
  let cursor = 0;
  let start = html.indexOf(startToken);
  while (start >= 0) {
    output += html.slice(cursor, start);
    let index = start;
    let depth = 0;
    let closed = false;
    while (index < html.length) {
      const nextOpen = html.indexOf("<div", index);
      const nextClose = html.indexOf("</div>", index);
      if (nextClose < 0) break;
      if (nextOpen >= 0 && nextOpen < nextClose) {
        depth += 1;
        index = nextOpen + 4;
        continue;
      }
      depth -= 1;
      index = nextClose + 6;
      if (depth === 0) {
        output += rewrite(html.slice(start, index));
        cursor = index;
        closed = true;
        break;
      }
    }
    if (!closed) break;
    start = html.indexOf(startToken, cursor);
  }
  return output + html.slice(cursor);
}

export function fixPeoplePortraitAlts(html: string): string {
  const pageContext = /<h1\b[^>]*>[\s\S]{0,120}?Advisory Board/i.test(html)
    ? "advisory"
    : /Board of Directors/i.test(html)
      ? "board"
      : "people";
  if (!html.includes("layout3_component")) return html;
  return walkLayout3Cards(html, (card) => rewriteLayout3CardAlts(card, pageContext));
}

export function fillEmptyImageAlts(html: string): string {
  return html.replace(/<img\b([^>]*)>/gi, (_full, attrs: string) => {
    const src = attrs.match(/\bsrc="([^"]+)"/i)?.[1] || "";
    const className = attrs.match(/\bclass="([^"]*)"/i)?.[1] || "";
    if (isSearchIcon(src, className)) {
      return `<img${imageAttr(attrs, "alt", "Search Insights")}>`;
    }
    if (isDecorativeImage(src, className)) {
      let next = imageAttr(attrs, "alt", "");
      next = imageAttr(next, "aria-hidden", "true");
      return `<img${next}>`;
    }
    const existing = attrs.match(/\balt="([^"]*)"/i) || attrs.match(/\balt='([^']*)'/i);
    if (existing && existing[1].trim()) return `<img${attrs}>`;
    return `<img${imageAttr(attrs, "alt", escapeAlt(altFromSrc(src)))}>`;
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
    fixPeoplePortraitAlts(
      demoteKeepReadingHeadings(
      injectRelatedReads(
        prefixFaqAnswers(
          injectBoardNote(
            injectContactHeadings(
              injectPartnerCopy(
                injectCountryStatusNotes(
                  injectCountryIntros(
                    rewriteClosedTimelines(
                      fixNewsletterHeading(
                        fixLegalHeadings(
                          fixCareersHeading(
                            fixMentorQuotes(
                              fixMentorHeading(
                                fixInsightsHeading(
                                  fixLeapxHeading(
                                    fixSummitCtas(
                                    fixBoldProgramNote(
                                      fixPartnerHeadings(
                                        renameHomepageDuplicateHeading(
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
              )
            )
          )
        )
      )
      )
    )
  );
}
