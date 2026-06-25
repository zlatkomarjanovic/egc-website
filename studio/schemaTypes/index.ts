import type { SchemaTypeDefinition } from "sanity";

import { category, tag, areaOfExpertise } from "./taxonomies";
import { author, mentor, boldFellow, teamMember } from "./people";
import {
  post,
  job,
  partner,
  partnerSpotlight,
  alumniSpotlight,
  testimonial,
} from "./content";

/**
 * EGC CMS schema — modeled directly from the Webflow CSV exports in /cms-data.
 *
 * Reference conventions used by the exports (relevant for the future import):
 *  - Single references store the target's slug (e.g. post.author = "marko-matovic").
 *  - Multi-references are semicolon-separated slugs (e.g. post.tags).
 *  - Images are Webflow CDN URLs that should be uploaded to Sanity on import.
 */
export const schemaTypes: SchemaTypeDefinition[] = [
  // Taxonomies
  category,
  tag,
  areaOfExpertise,
  // People
  author,
  mentor,
  boldFellow,
  teamMember,
  // Content
  post,
  job,
  partner,
  partnerSpotlight,
  alumniSpotlight,
  testimonial,
];
