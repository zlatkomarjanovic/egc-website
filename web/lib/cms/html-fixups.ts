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

export function applyWebflowHtmlFixups(html: string): string {
  return fixImageQuality(fixEmbedlyVideos(html));
}

export { slugify };
