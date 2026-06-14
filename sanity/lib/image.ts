import createImageUrlBuilder from "@sanity/image-url";
import type { Image } from "sanity";
import { dataset, isSanityConfigured, projectId } from "../env";

const builder = isSanityConfigured
  ? createImageUrlBuilder({ projectId, dataset })
  : null;

/** Build a CDN URL for a Sanity image source. Returns "" until configured. */
export function urlForImage(source: Image | undefined | null): string {
  if (!builder || !source) return "";
  return builder.image(source).auto("format").fit("max").url();
}
