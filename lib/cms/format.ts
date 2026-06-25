const PLACEHOLDER_AUTHOR =
  "/images/6191a88a1c0e39463c2bf022_placeholder-image.svg";
const PLACEHOLDER_IMAGE = "/images/Placeholder-Image---Landscape.svg";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function parseWebflowDate(value?: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatPostDate(value?: string): string {
  const date = parseWebflowDate(value);
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function parseMinutesToRead(value?: string): number | undefined {
  if (!value) return undefined;
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : undefined;
}

export function postDateValue(post: {
  publishedAt?: string;
  createdAt?: string;
}): string | undefined {
  return post.publishedAt || post.createdAt;
}

export function postImage(
  post: { mainImage?: string; thumbnailImage?: string },
  preferThumbnail = false
): string {
  const image = preferThumbnail
    ? post.thumbnailImage || post.mainImage
    : post.mainImage || post.thumbnailImage;
  return image || PLACEHOLDER_IMAGE;
}

export function authorImage(author?: { picture?: string }): string {
  return author?.picture || PLACEHOLDER_AUTHOR;
}

export function minutesLabel(minutes?: number): string {
  if (!minutes) return "";
  return `${minutes} min read`;
}
