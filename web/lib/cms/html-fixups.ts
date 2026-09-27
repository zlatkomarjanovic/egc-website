import { applySeoHtmlFixups } from "./seo-html-fixups";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractYoutubeIdFromEmbedly(src: string): string | null {
  try {
    const url = new URL(src);
    const watchUrl = url.searchParams.get("url");
    if (watchUrl) {
      const match = watchUrl.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/i
      );
      if (match) return match[1];
    }

    const embedSrc = url.searchParams.get("src");
    if (embedSrc) {
      const decoded = decodeURIComponent(embedSrc);
      const match = decoded.match(/youtube\.com\/embed\/([\w-]+)/i);
      if (match) return match[1];
    }
  } catch {
    return null;
  }

  return null;
}

function youtubeEmbedHtml(videoId: string, title = "Video"): string {
  return `<iframe class="youtube-embed" src="https://www.youtube.com/embed/${videoId}" title="${title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>`;
}

/** Replace blocked Embedly iframes with direct YouTube embeds. */
export function fixEmbedlyVideos(html: string): string {
  return html.replace(/<iframe\b[^>]*\bclass="embedly-embed"[^>]*><\/iframe>/gi, (match) => {
    const srcMatch = match.match(/\bsrc="([^"]+)"/i);
    if (!srcMatch) return match;

    const videoId = extractYoutubeIdFromEmbedly(srcMatch[1]);
    if (!videoId) return match;

    const titleMatch = match.match(/\btitle="([^"]*)"/i);
    return youtubeEmbedHtml(videoId, titleMatch?.[1] || "Video");
  });
}

const SHARP_IMAGE_SWAPS: Record<string, string> = {
  "/images/image-16_1image-16.webp": "/images/IMG_6315-1-p-1600.jpg",
  "/images/image-38-1_1image-38-1.webp": "/images/Copy_of_IMG_4440-p-1600.jpg",
  "/images/image-39_1image-39.webp": "/images/Copy-of-IMG-20250615-WA0001-p-1600.jpg",
  "/images/IMG_6315-1.jpg": "/images/IMG_6315-1-p-1600.jpg",
  "/images/Copy_of_IMG_4440.jpg": "/images/Copy_of_IMG_4440-p-1600.jpg",
  "/images/Copy-of-IMG-20250615-WA0001.jpg": "/images/Copy-of-IMG-20250615-WA0001-p-1600.jpg",
  "/images/pexels-life-of-pix-7613.jpg": "/images/pexels-life-of-pix-7613-p-1600.jpg",
  "/images/WhatsApp-Image-2024-09-03-at-11.46.56.jpeg":
    "/images/WhatsApp-Image-2024-09-03-at-11.46.56-p-1600.jpeg",
};

const IMAGE_DIMENSIONS: Record<string, [number, number]> = {
  "/images/IMG_6315-1-p-1600.jpg": [1600, 1067],
  "/images/Copy_of_IMG_4440-p-1600.jpg": [1600, 1067],
  "/images/Copy-of-IMG-20250615-WA0001-p-1600.jpg": [1600, 1067],
  "/images/pexels-life-of-pix-7613-p-1600.jpg": [1600, 1067],
  "/images/WhatsApp-Image-2024-09-03-at-11.46.56-p-1600.jpeg": [1600, 1067],
};

function sharpSrc(src: string): string {
  const normalized = src.startsWith("images/") ? `/${src}` : src;
  if (SHARP_IMAGE_SWAPS[normalized]) return SHARP_IMAGE_SWAPS[normalized];
  const original = normalized.replace(
    /-p-(?:500|800|1080|130x130q80|1600|2000|2600|3200)(?=\.[a-z0-9]+(?:\.webp)?$)/i,
    ""
  );
  if (SHARP_IMAGE_SWAPS[original]) return SHARP_IMAGE_SWAPS[original];
  return SHARP_IMAGE_SWAPS[src] || normalized;
}

function largestFromSrcset(srcset: string): string | null {
  let bestUrl = "";
  let bestWidth = -1;
  for (const part of srcset.split(",")) {
    const bits = part.trim().split(/\s+/);
    const url = bits[0];
    if (!url) continue;
    const width = Number((bits[1] || "").replace(/w$/i, "")) || 0;
    if (width >= bestWidth) {
      bestWidth = width;
      bestUrl = url;
    }
  }
  return bestUrl || null;
}

/** Prefer the largest real photo and drop Webflow's tiny compressed stand-ins. */
export function fixImageQuality(html: string): string {
  return html
    .replace(/<img([^>]*)\ssrcset="([^"]*)"([^>]*)>/gi, (match, before, srcset, after) => {
      const largest = largestFromSrcset(srcset);
      if (!largest) return match;

      const withoutSrcset = `${before}${after}`.replace(/\ssrc="[^"]*"/, "");
      return `<img${withoutSrcset} src="${sharpSrc(largest)}">`;
    })
    .replace(/\ssrcset="[^"]*"/gi, "")
    .replace(/\ssizes="[^"]*"/gi, "")
    .replace(/<img([^>]*?)\ssrc="([^"]+)"([^>]*)>/gi, (_match, before, src, after) => {
      const next = sharpSrc(src);
      const size = IMAGE_DIMENSIONS[next];
      let attrs = `${before} src="${next}"${after}`;
      if (size && !/\bwidth=/i.test(attrs)) attrs += ` width="${size[0]}"`;
      if (size && !/\bheight=/i.test(attrs)) attrs += ` height="${size[1]}"`;
      return `<img${attrs}>`;
    });
}

/** Add a real logo alt without changing image size or source. */
export function fixLogoAlt(html: string): string {
  return html.replace(
    /alt(\s+src="\/images\/path12\.svg")/gi,
    'alt="Entrepreneurs for Global Change"$1'
  );
}

/** Drop the IX2 fade-out on hero copy so the heading stays visible. */
export function disableHeroFadeOut(html: string): string {
  return html.replace(
    /<div([^>]*\bclass="[^"]*\bfade-out\b[^"]*"[^>]*)>/gi,
    (_full, attrs: string) => {
      const next = attrs
        .replace(/\sdata-w-id="[^"]*"/i, "")
        .replace(/\sstyle="[^"]*"/i, "");
      return `<div${next} style="opacity:1">`;
    }
  );
}

const HERO_COPY_STYLE =
  "opacity:1;transform:none;color:#fff;-webkit-text-fill-color:#fff";

function isHeroMedia(attrs: string): boolean {
  return /overlay-div|home-bg-video|w-background-video|header30_background|content21_lightbox/.test(
    attrs
  );
}

/**
 * Hero headings and subtitles ship with inline opacity:0 and wait for IX2.
 * Only rewrite those text nodes. Leave the video, poster, and 0.75 overlay alone.
 */
export function revealHeroCopy(html: string): string {
  return html.replace(
    /<(header|section)(\b[^>]*\bsection_hero\b[^>]*)>([\s\S]*?)<\/\1>/gi,
    (_full, tag: string, attrs: string, inner: string) => {
      const next = inner.replace(
        /<(h1|h2|p)(\b[^>]*)>/gi,
        (_match, name: string, raw: string) => {
          let nextAttrs = String(raw).replace(/\sstyle="[^"]*"/i, "");
          if (!/text-color-white|text-color-alternate/.test(nextAttrs)) {
            if (/\bclass="/i.test(nextAttrs)) {
              nextAttrs = nextAttrs.replace(/\bclass="/i, 'class="text-color-white ');
            } else {
              nextAttrs += ' class="text-color-white"';
            }
          }
          return `<${name}${nextAttrs} style="${HERO_COPY_STYLE}">`;
        }
      ).replace(/<div(\b[^>]*\bstyle="[^"]*opacity:\s*0(?:\s|;|")[^"]*"[^>]*)>/gi, (full, raw: string) => {
        if (isHeroMedia(raw) || /opacity:\s*0\.\d+/.test(raw)) return full;
        const cleaned = String(raw).replace(/\sstyle="[^"]*"/i, "");
        return `<div${cleaned} style="opacity:1;transform:none">`;
      });
      return `<${tag}${attrs}>${next}</${tag}>`;
    }
  );
}

const COOKIE_BANNER_HTML = `<div class="cookie-component">
      <div fs-cc="banner" class="fs-cc_cookie-component">
        <div class="fs-cc_modal">
          <a fs-cc="close" href="#" class="fs-cc_close-button w-inline-block">
            <div class="fs-cc_close-button-line"></div>
            <div class="fs-cc_close-button-line is-2nd"></div>
            <div class="fs-cc_screen-reader-only">Close Cookie Popup</div>
          </a>
          <div class="fs_cc-modal-content">
            <div class="fs-cc_title">Cookie settings</div>
            <div class="fs-cc_description">By clicking &quot;Accept all cookies&quot;, you agree to storing cookies on your device to enhance site navigation, analyze site usage and assist in our marketing efforts as outlined in our <a href="/legal/privacy-policy" class="fs-cc_link">privacy policy</a>.</div>
          </div>
          <div class="fs-cc_modal-buttons">
            <a fs-cc="allow" href="#" class="fs-cc_button w-button">Accept all cookies</a>
            <a fs-cc="deny" href="#" class="fs-cc_button is-secondary w-button">Essential only</a>
            <a fs-cc="open-preferences" href="#" class="fs-cc_button is-secondary w-button">Cookie settings</a>
          </div>
        </div>
      </div>
      <div fs-cc="preferences" class="fs-cc_preference-component">
        <div class="cookie-preference_wrapper">
          <div class="fs-cc_modal">
            <a fs-cc="close" href="#" class="fs-cc_close-button w-inline-block">
              <div class="fs-cc_close-button-line"></div>
              <div class="fs-cc_close-button-line is-2nd"></div>
              <div class="fs-cc_screen-reader-only">Close Cookie Preference Manager</div>
            </a>
            <div class="fs_cc-modal-content">
              <div class="fs-cc_title">Cookie settings</div>
              <div class="fs-cc_description">Choose which cookies EGC can use. Analytics stays off until you allow it. Read the <a href="/legal/privacy-policy" class="fs-cc_link">privacy policy</a>.</div>
              <div class="fs-cc_form w-form">
                <form id="ck-form" name="wf-form-ck-form" data-name="ck-form" method="get" class="fs-cc_preferences">
                  <div class="fs-cc_checkbox is--not-allowed w-clearfix">
                    <div class="fs-cc_checkbox-button is-required"></div>
                    <div class="fs-cc_checkbox-label is--not-allowed">Strictly necessary (always active)</div>
                    <div class="fs-cc_checkbox-description is--not-allowed">Cookies required to enable basic website functionality.</div>
                  </div><label class="w-checkbox fs-cc_checkbox w-clearfix">
                    <div class="w-checkbox-input w-checkbox-input--inputType-custom fs-cc_checkbox-button"></div><input type="checkbox" name="Fs-Marketing" id="fs__marketing" data-name="Fs Marketing" fs-cc-checkbox="marketing" style="opacity:0;position:absolute;z-index:-1"><span for="Fs-Marketing" class="fs-cc_checkbox-label w-form-label">Marketing</span>
                    <div class="fs-cc_checkbox-description">Cookies used to deliver advertising that is more relevant to you and your interests.</div>
                  </label><label class="w-checkbox fs-cc_checkbox w-clearfix">
                    <div class="w-checkbox-input w-checkbox-input--inputType-custom fs-cc_checkbox-button"></div><input type="checkbox" name="Fs-Personalization" id="fs__personalization" data-name="Fs Personalization" fs-cc-checkbox="personalization" style="opacity:0;position:absolute;z-index:-1"><span for="Fs-Personalization" class="fs-cc_checkbox-label w-form-label">Personalization<br></span>
                    <div class="fs-cc_checkbox-description">Cookies allowing the website to remember choices you make (such as your user name, language, or the region you are in).</div>
                  </label><label class="w-checkbox fs-cc_checkbox w-clearfix">
                    <div class="w-checkbox-input w-checkbox-input--inputType-custom fs-cc_checkbox-button"></div><input type="checkbox" name="Fs-Analytics" id="fs__analytics" data-name="Fs Analytics" fs-cc-checkbox="analytics" style="opacity:0;position:absolute;z-index:-1"><span for="Fs-Analytics" class="fs-cc_checkbox-label w-form-label">Analytics<br></span>
                    <div class="fs-cc_checkbox-description">Cookies helping understand how this website performs, how visitors interact with the site, and whether there may be technical issues.</div>
                  </label>
                </form>
                <div class="fs-cc_preference-buttons">
                  <a fs-cc="allow" href="#" class="fs-cc_button w-button">Accept all cookies</a>
                  <a fs-cc="submit" href="#" class="fs-cc_button is-secondary w-button">Save settings</a>
                </div>
                <div class="hide-all w-form-done"></div>
                <div class="hide-all w-form-fail"></div>
              </div>
            </div>
          </div>
        </div>
        <div fs-cc="close" class="cookie-preference_background"></div>
      </div>
    </div>`;

/** Insights and a few shells shipped the script without the banner markup. */
export function ensureCookieBanner(html: string): string {
  if (html.includes('fs-cc="banner"')) return html;
  if (!/navbar2_component|<body\b/i.test(html)) return html;
  const at = html.search(/<div class="main-wrapper">|<main\b/i);
  if (at >= 0) return html.slice(0, at) + COOKIE_BANNER_HTML + html.slice(at);
  return COOKIE_BANNER_HTML + html;
}

/** Add an essential-only action so the banner can refuse analytics. */
export function fixCookieBanner(html: string): string {
  if (html.includes('fs-cc="deny"')) return html;
  return html.replace(
    /(<div fs-cc="banner"[\s\S]*?<a fs-cc="allow"[^>]*>Accept all cookies<\/a>)/i,
    `$1
            <a fs-cc="deny" href="#" class="fs-cc_button is-secondary w-button">Essential only</a>`
  );
}

/** Give each Scale 2.0 timeline card a distinct, matching icon. */
export function fixScaleTimelineIcons(html: string): string {
  if (!html.includes("Program Timeline")) return html;

  return html
    .replace(
      /(<div class="step"><img src="\/images\/Group-104720-1\.svg" loading="lazy" )alt>/,
      '$1alt="Application launch">'
    )
    .replace(
      /<div class="step"><img src="\/images\/Group-104720-2\.svg" loading="lazy" alt>\s*<div class="heading-style-h6 text-color-white">Application Closing Date<\/div>/,
      '<div class="step"><img src="/images/Group-104720-4.svg" loading="lazy" alt="Application closing date">\n                      <div class="heading-style-h6 text-color-white">Application Closing Date</div>'
    )
    .replace(
      /(<div class="step"><img src="\/images\/Group-104720-3\.svg" loading="lazy" )alt>\s*<div class="heading-style-h6 text-color-white">Boot-camp Program Croatia<\/div>/,
      '$1alt="Croatia boot-camp">\n                      <div class="heading-style-h6 text-color-white">Boot-camp Program Croatia</div>'
    )
    .replace(
      /<div class="step"><img src="\/images\/Group-104720-3\.svg" loading="lazy" alt>\s*<div class="heading-style-h6 text-color-white">NYC program<\/div>/,
      '<div class="step"><img src="/images/Group-104720-2.svg" loading="lazy" alt="New York City program">\n                      <div class="heading-style-h6 text-color-white">NYC program</div>'
    );
}

/** Hide the Our Team nav and footer links while the team page is offline. */
export function hideOurTeamLinks(html: string): string {
  return html.replace(
    /\s*<a href="\/about-us\/egc-our-team"[^>]*>\s*Our [Tt]eam\s*<\/a>/g,
    ""
  );
}

const BOARD_CARD_START = '<div class="w-layout-grid layout3_component">';

const FILIP_BOARD_CARD = `<div class="w-layout-grid layout3_component">
                <div class="layout3_content" style="opacity:1">
                  <div class="margin-bottom margin-xsmall">
                    <a href="https://www.linkedin.com/in/filipsasic/" target="_blank" class="link-flex w-inline-block"><img src="/images/Vector.svg" loading="lazy" alt="" aria-hidden="true" class="icon-1x1-xsmall">
                      <div class="hide-desktop">LinkedIn profile</div>
                    </a>
                  </div>
                  <div class="margin-bottom margin-xxsmall">
                    <div class="tagline-light">CEO and Founder</div>
                  </div>
                  <div class="margin-bottom margin-xxsmall">
                    <h2 class="heading-style-h3">Filip Sasic</h2>
                  </div>
                  <div class="margin-bottom margin-small">
                    <p class="text-size-regular">Filip is the CEO and Founder of Entrepreneurs for Global Change. He leads EGC's work helping young founders from emerging ecosystems turn ideas into startups.</p>
                  </div>
                </div>
                <div class="layout3_image-wrapper" style="opacity:1"><img src="/images/filip-sasic.png" loading="lazy" alt="Filip Sasic, CEO and Founder of Entrepreneurs for Global Change" class="layout3_image"></div>
              </div>`;

function replaceContainingDiv(
  html: string,
  marker: string,
  startToken: string,
  replacement: string
): string {
  const markerAt = html.indexOf(marker);
  if (markerAt < 0) return html;

  const start = html.lastIndexOf(startToken, markerAt);
  if (start < 0) return html;

  let index = start;
  let depth = 0;
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
      return html.slice(0, start) + replacement + html.slice(index);
    }
  }

  return html;
}

/** Remove cloneable leftover links and normalize footer contact URLs. */
export function fixFooterJunk(html: string): string {
  return html
    .replace(
      /<a\b([^>]*)\bhref="[^"]*webflow-cookies\.com[^"]*"([^>]*)>([\s\S]*?)<\/a>/gi,
      '<a href="/legal/privacy-policy"$1$2>$3</a>'
    )
    .replace(
      /mailto:info@egcnyc\.org\?subject=Hello(?:%20|\s)there(?:%20|\s)%7Bname%7D(?:%20|\s)here/gi,
      "mailto:info@egcnyc.org?subject=Hello%20from%20the%20EGC%20website"
    )
    .replace(
      /mailto:info@egcnyc\.org\?subject=Hello(?:%20|\s)there(?:%20|\s)\{name\}(?:%20|\s)here/gi,
      "mailto:info@egcnyc.org?subject=Hello%20from%20the%20EGC%20website"
    )
    .replace(
      /<a href="#" class="link-footer">♥<\/a>/g,
      '<a href="/" class="link-footer" aria-label="Entrepreneurs for Global Change homepage">EGC</a>'
    )
    .replace(/href="tel:\+?1?[-.\s()]*347[-.\s]*990[-.\s]*2142"/gi, 'href="tel:+13479902142"')
    .replace(/\?displayConfirmation=true(?=&|"|'|$)/gi, "")
    .replace(/&amp;displayConfirmation=true|&displayConfirmation=true/gi, "")
    .replace(
      /https?:\/\/(?:www\.)?instagram\.com\/egcnyc\/?/gi,
      "https://www.instagram.com/egc.nyc/"
    )
    .replace(
      /https?:\/\/(?:www\.)?instagram\.com\/egc\.nyc\/?/gi,
      "https://www.instagram.com/egc.nyc/"
    );
}

const CELINE_ADVISOR_CARD = `<div class="w-layout-grid layout3_component">
                <div class="layout3_content" style="opacity:1">
                  <div class="margin-bottom margin-xsmall">
                    <a href="https://www.linkedin.com/in/celinekrzan" target="_blank" class="link-flex w-inline-block"><img src="/images/Vector.svg" loading="lazy" alt="" aria-hidden="true" class="icon-1x1-xsmall">
                      <div class="hide-desktop">LinkedIn profile</div>
                    </a>
                  </div>
                  <div class="margin-bottom margin-xxsmall">
                    <div class="tagline-light">Clinical Assistant Professor of Entrepreneurship, UB</div>
                  </div>
                  <div class="margin-bottom margin-xxsmall">
                    <h2 class="heading-style-h3"><strong>Celine Krzan</strong></h2>
                  </div>
                  <div class="margin-bottom margin-small">
                    <p class="text-size-regular">Celine is a Clinical Assistant Professor of Entrepreneurship at the University at Buffalo School of Management. She designed and facilitated the BOLD Fellowship for emerging founders from the Western Balkans, and coaches startups through NSF I-Corps and UB entrepreneurial programs.</p>
                  </div>
                </div>
                <div class="layout3_image-wrapper" style="opacity:1"><img src="/images/celine-krzan.jpg" loading="lazy" alt="Celine Krzan, Clinical Assistant Professor of Entrepreneurship at University at Buffalo" class="layout3_image"></div>
              </div>`;

function insertAfterLastLayoutCard(html: string, card: string): string {
  const start = html.lastIndexOf(BOARD_CARD_START);
  if (start < 0) return html;

  let index = start;
  let depth = 0;
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
      return html.slice(0, index) + "\n" + card + html.slice(index);
    }
  }

  return html;
}

/** Add Celine Krzan to the advisory zig-zag after the last existing card. */
export function addCelineAdvisor(html: string): string {
  if (html.includes("Celine Krzan")) return html;
  if (!html.includes("Emina Poricanin") || !html.includes("Sinisa Babcic")) return html;
  return insertAfterLastLayoutCard(html, CELINE_ADVISOR_CARD);
}

/** Move Filip Sasic onto the board and drop Brian Pasalich. */
export function reshapeBoardDirectors(html: string): string {
  if (!html.includes("layout3_component")) return html;
  if (html.includes("Filip Sasic") && !html.includes("Brian Pasalich")) return html;

  if (html.includes("Brian Pasalich")) {
    return replaceContainingDiv(html, "Brian Pasalich", BOARD_CARD_START, FILIP_BOARD_CARD);
  }

  const mirzaAt = html.indexOf("Mirza Tihic");
  if (mirzaAt < 0) return html;

  const start = html.lastIndexOf(BOARD_CARD_START, mirzaAt);
  if (start < 0) return html;
  return html.slice(0, start) + FILIP_BOARD_CARD + html.slice(start);
}

export function applyWebflowHtmlFixups(html: string): string {
  return applySeoHtmlFixups(
    addCelineAdvisor(
    reshapeBoardDirectors(
      hideOurTeamLinks(
        fixScaleTimelineIcons(
          revealHeroCopy(
            disableHeroFadeOut(
              fixCookieBanner(
                ensureCookieBanner(
                  fixLogoAlt(fixImageQuality(fixEmbedlyVideos(fixFooterJunk(html))))
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

export { slugify };
