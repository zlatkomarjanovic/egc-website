/** Shared security helpers for the API routes. */

/** Allowed origins for state-changing requests (CSRF defense). */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!host) return false;

  // Explicit allow-list (production domain[s] + any configured site URL).
  const allowed = new Set<string>();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    try {
      allowed.add(new URL(siteUrl).host);
    } catch {
      /* ignore malformed env */
    }
  }
  allowed.add(host);

  if (origin) {
    try {
      return allowed.has(new URL(origin).host);
    } catch {
      return false;
    }
  }

  // No Origin header (some same-origin form posts): fall back to Referer.
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return allowed.has(new URL(referer).host);
    } catch {
      return false;
    }
  }

  // No Origin and no Referer — reject to be safe.
  return false;
}

/** Best-effort client IP from common proxy headers (Vercel sets x-forwarded-for). */
export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

/** Escape user-supplied text before embedding it in an HTML email. */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const CONTROL_CHARS = new RegExp("[\\x00-\\x1F\\x7F]", "g");

/** Replace control chars (incl. CR/LF) to block email header injection. */
export function stripControlChars(input: string): string {
  return input.replace(CONTROL_CHARS, " ").trim();
}
