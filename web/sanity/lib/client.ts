import { createClient, type SanityClient } from "next-sanity";
import { apiVersion, dataset, isSanityConfigured, projectId } from "../env";

const readToken =
  process.env.SANITY_API_TOKEN ||
  process.env.SANITY_AUTH_TOKEN ||
  process.env.SANITY_READ_TOKEN;

/**
 * Server-side Sanity client. Uses a read token when available so imported CMS
 * content is returned reliably (the public API can stay empty until schema/CDN sync).
 */
export const client: SanityClient | null = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: Boolean(!readToken),
      token: readToken,
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
