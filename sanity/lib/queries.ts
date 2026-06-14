import { groq } from "next-sanity";

/** Example GROQ queries. Extend/adjust once the CSV-defined structure is final. */

export const postSlugsQuery = groq`*[_type == "post" && defined(slug.current)]{ "slug": slug.current }`;

export const allPostsQuery = groq`
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    featured,
    coverImage,
    "author": author->{ name, "slug": slug.current, image, role },
    "categories": categories[]->{ title, "slug": slug.current },
    "tags": tags[]->{ title, "slug": slug.current }
  }
`;

export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    coverImage,
    body,
    "author": author->{ name, "slug": slug.current, image, role, bio, linkedin },
    "categories": categories[]->{ title, "slug": slug.current },
    "tags": tags[]->{ title, "slug": slug.current }
  }
`;

export const teamByGroupQuery = groq`
  *[_type == "teamMember" && group == $group] | order(order asc, name asc) {
    _id, name, "slug": slug.current, role, photo, bio, linkedin
  }
`;

export const openJobsQuery = groq`
  *[_type == "job" && open == true] | order(postedAt desc) {
    _id, title, "slug": slug.current, department, location, type, postedAt, applyUrl
  }
`;

export const jobBySlugQuery = groq`
  *[_type == "job" && slug.current == $slug][0] {
    _id, title, department, location, type, postedAt, applyUrl, description
  }
`;
