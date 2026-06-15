import { groq } from "next-sanity";

/** GROQ queries aligned with the CSV-modeled schema. Extend as routes are built. */

export const postSlugsQuery = groq`*[_type == "post" && defined(slug.current)]{ "slug": slug.current }`;

export const allPostsQuery = groq`
  *[_type == "post" && defined(slug.current)] | order(coalesce(publishedAt, _createdAt) desc) {
    _id,
    name,
    "slug": slug.current,
    postSummary,
    publishedAt,
    featured,
    blogPageFeature,
    minutesToRead,
    mainImage,
    thumbnailImage,
    "author": author->{ name, "slug": slug.current, picture, position },
    "category": category->{ name, "slug": slug.current, color },
    "tags": tags[]->{ name, "slug": slug.current }
  }
`;

export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    postSummary,
    postBody,
    mainImage,
    publishedAt,
    minutesToRead,
    metaTitle,
    metaDescription,
    "author": author->{ name, "slug": slug.current, picture, position, bio, linkedin },
    "coAuthors": coAuthors[]->{ name, "slug": slug.current, picture, position },
    "category": category->{ name, "slug": slug.current },
    "tags": tags[]->{ name, "slug": slug.current }
  }
`;

export const teamByGroupQuery = groq`
  *[_type == "teamMember" && group == $group] | order(sortOrder asc, name asc) {
    _id, name, "slug": slug.current, role, photo, bio, linkedin
  }
`;

export const openJobsQuery = groq`
  *[_type == "job"] | order(_createdAt desc) {
    _id, name, "slug": slug.current, jobTitle, organization, location, type, applicationDeadline, applicationLink
  }
`;

export const jobBySlugQuery = groq`
  *[_type == "job" && slug.current == $slug][0] {
    _id, name, jobTitle, coverImage, excerpt, organization, location, type,
    applicationDeadline, startDate, endDate, detailedInstructions, applicationLink
  }
`;

export const featuredAlumniQuery = groq`
  *[_type == "alumniSpotlight" && featured == true] | order(sortNumber asc) {
    _id, name, "slug": slug.current, alumniName, ventureName, oneLiner, profilePicture, country
  }
`;
