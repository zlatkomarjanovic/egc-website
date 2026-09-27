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

/** Prefer the largest image from srcset and drop responsive downscaling hints. */
export function fixImageQuality(html: string): string {
  return html
    .replace(/<img([^>]*)\ssrcset="([^"]*)"([^>]*)>/gi, (match, before, srcset, after) => {
      const candidates = srcset
        .split(",")
        .map((part: string) => part.trim().split(/\s+/)[0])
        .filter(Boolean);
      const largest = candidates[candidates.length - 1];
      if (!largest) return match;

      const withoutSrcset = `${before}${after}`.replace(/\ssrc="[^"]*"/, "");
      return `<img${withoutSrcset} src="${largest}">`;
    })
    .replace(/\ssrcset="[^"]*"/gi, "")
    .replace(/\ssizes="[^"]*"/gi, "");
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
                    <a href="https://www.linkedin.com/in/filipsasic/" target="_blank" class="link-flex w-inline-block"><img src="/images/Vector.svg" loading="lazy" alt class="icon-1x1-xsmall">
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
  return reshapeBoardDirectors(
    hideOurTeamLinks(
      fixScaleTimelineIcons(
        disableHeroFadeOut(fixLogoAlt(fixImageQuality(fixEmbedlyVideos(html))))
      )
    )
  );
}

export { slugify };
