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

export function applyWebflowHtmlFixups(html: string): string {
  return fixScaleTimelineIcons(
    disableHeroFadeOut(fixLogoAlt(fixImageQuality(fixEmbedlyVideos(html))))
  );
}

export { slugify };
