import { env } from "cloudflare:workers";

/** Private durable inbox used while an external delivery provider is unavailable. */
export async function storeSubmission(
  kind: "contact" | "newsletter",
  fields: Record<string, string | undefined>,
): Promise<boolean> {
  try {
    if (!env.EGC_SUBMISSIONS) return false;
    const createdAt = new Date().toISOString();
    const result = await env.EGC_SUBMISSIONS.prepare(
      "INSERT INTO submissions (id, kind, created_at, payload) VALUES (?, ?, ?, ?)",
    ).bind(crypto.randomUUID(), kind, createdAt, JSON.stringify(fields)).run();
    if (!result.success) return false;
    return true;
  } catch (error) {
    console.error("[submissions] Durable inbox unavailable.", error instanceof Error ? error.message : "Unknown storage error");
    return false;
  }
}
