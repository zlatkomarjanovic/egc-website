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
    "createdAt": _createdAt,
    "updatedAt": _updatedAt,
    featured,
    blogPageFeature,
    minutesToRead,
    sortOrder,
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
    "createdAt": _createdAt,
    "updatedAt": _updatedAt,
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
  *[_type == "job" && defined(slug.current)] | order(_createdAt desc) {
    _id,
    name,
    "slug": slug.current,
    jobTitle,
    excerpt,
    organization,
    location,
    type,
    postedAt,
    applicationDeadline,
    startDate,
    endDate,
    applicationLink,
    coverImage,
    "updatedAt": _updatedAt
  }
`;

export const allPartnersQuery = groq`
  *[_type == "partner" && defined(slug.current)] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    logo,
    website,
    type
  }
`;

export const allMentorsQuery = groq`
  *[_type == "mentor" && defined(slug.current)] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    profession,
    shortBio,
    photo,
    linkedin
  }
`;

export const jobSlugsQuery = groq`*[_type == "job" && defined(slug.current)]{
  "slug": slug.current,
  postedAt,
  applicationDeadline,
  startDate,
  endDate,
  "updatedAt": _updatedAt
}`;

export const jobBySlugQuery = groq`
  *[_type == "job" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    jobTitle,
    coverImage,
    excerpt,
    organization,
    location,
    type,
    applicationDeadline,
    startDate,
    endDate,
    detailedInstructions,
    applicationLink,
    postedAt,
    "createdAt": _createdAt,
    "updatedAt": _updatedAt
  }
`;

export const alumniSlugsQuery = groq`*[_type == "alumniSpotlight" && defined(slug.current)]{
  "slug": slug.current,
  "updatedAt": _updatedAt
}`;

export const alumniBySlugQuery = groq`
  *[_type == "alumniSpotlight" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    alumniName,
    ventureName,
    oneLiner,
    profilePicture,
    profilePictureAlt,
    country,
    featured,
    whyStarted,
    fundraised,
    trends,
    biggestChallenge,
    adviceFirstTime,
    whatDrives,
    extraNote,
    videoLink,
    sortNumber
  }
`;

export const allAlumniSpotlightsQuery = groq`
  *[_type == "alumniSpotlight" && defined(slug.current)] | order(coalesce(sortNumber, 999) asc, name asc) {
    _id,
    name,
    "slug": slug.current,
    alumniName,
    ventureName,
    oneLiner,
    profilePicture,
    profilePictureAlt,
    country,
    featured,
    whyStarted,
    videoLink,
    sortNumber
  }
`;

export const featuredAlumniQuery = groq`
  *[_type == "alumniSpotlight" && featured == true && defined(slug.current)] | order(coalesce(sortNumber, 999) asc) {
    _id,
    name,
    "slug": slug.current,
    alumniName,
    ventureName,
    oneLiner,
    profilePicture,
    profilePictureAlt,
    country,
    featured,
    whyStarted,
    videoLink,
    sortNumber
  }
`;

export const allTestimonialsQuery = groq`
  *[_type == "testimonial" && defined(slug.current)] | order(personName asc) {
    _id,
    "slug": slug.current,
    personName,
    whatTheyDo,
    egcPosition,
    testimonial,
    personImage,
    videoLink
  }
`;
