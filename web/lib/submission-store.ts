/** Private durable inbox used while an external delivery provider is unavailable. */
export async function storeSubmission(
  kind: "contact" | "newsletter",
  fields: Record<string, string | undefined>,
): Promise<boolean> {
  try {
    const { env } = await import("cloudflare:workers");
    if (!env.EGC_SUBMISSIONS) return false;
    const createdAt = new Date().toISOString();
    await env.EGC_SUBMISSIONS.put(
      `${kind}/${createdAt}/${crypto.randomUUID()}`,
      JSON.stringify({ kind, createdAt, ...fields }),
    );
    return true;
  } catch {
    console.error("[submissions] Durable inbox unavailable.");
    return false;
  }
}
