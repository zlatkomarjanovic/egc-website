import {
  sanityAlumniToCmsAlumni,
  sanityTeamMemberToCmsTeamMember,
  type SanityAlumniSpotlight,
  type SanityTeamMember,
} from "./adapt-sanity";
import { getAllAlumniSpotlights, getFeaturedAlumniSpotlights } from "./alumni-spotlights";
import { STAFF_TEAM_MEMBERS } from "./team-staff";
import type { CmsAlumniSpotlight, CmsTeamMember } from "./types";
import { sanityFetch } from "@/sanity/lib/client";
import { isSanityConfigured } from "@/sanity/env";
import {
  allAlumniSpotlightsQuery,
  featuredAlumniQuery,
  teamByGroupQuery,
} from "@/sanity/lib/queries";

export async function loadAlumniSpotlightsForFellowship(): Promise<CmsAlumniSpotlight[]> {
  if (!isSanityConfigured) return getAllAlumniSpotlights();
  const sanityAlumni = await sanityFetch<SanityAlumniSpotlight[]>(
    allAlumniSpotlightsQuery,
    {},
    []
  );
  return (sanityAlumni ?? []).map(sanityAlumniToCmsAlumni);
}

export async function loadFeaturedAlumniSpotlights(): Promise<CmsAlumniSpotlight[]> {
  if (!isSanityConfigured) return getFeaturedAlumniSpotlights();
  const sanityAlumni = await sanityFetch<SanityAlumniSpotlight[]>(featuredAlumniQuery, {}, []);
  return (sanityAlumni ?? []).map(sanityAlumniToCmsAlumni);
}

export async function loadTeamMembers(group: "staff" | "board" | "advisory"): Promise<CmsTeamMember[]> {
  if (group === "staff" && !isSanityConfigured) return STAFF_TEAM_MEMBERS;

  if (!isSanityConfigured) return [];

  const sanityTeam = await sanityFetch<SanityTeamMember[]>(teamByGroupQuery, { group }, []);
  const team = (sanityTeam ?? []).map(sanityTeamMemberToCmsTeamMember);
  if (group === "staff" && !team.length) return STAFF_TEAM_MEMBERS;
  return team;
}
