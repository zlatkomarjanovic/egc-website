import { createClient, type SanityClient } from "next-sanity";
import { apiVersion, dataset, isSanityConfigured, projectId } from "../env";

/**
 * Read-only Sanity client. `null` until a project is connected (NEXT_PUBLIC_SANITY_PROJECT_ID),
 * so the site builds and runs perfectly before the CMS is set up.
 */
export const client: SanityClient | null = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true, // fast, cached reads; fine for published content
      perspective: "published",
    })
  : null;

/**
 * Convenience fetch that returns a fallback (default: null) when Sanity isn't
 * configured yet, instead of throwing. Use this everywhere content is read.
 */
export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  fallback: T | null = null
): Promise<T | null> {
  if (!client) return fallback;
  try {
    return await client.fetch<T>(query, params, {
      next: { revalidate: 60 },
    });
  } catch (err) {
    console.error("[sanity] fetch failed:", err);
    return fallback;
  }
}
