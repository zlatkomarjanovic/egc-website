import { urlForImage } from "@/sanity/lib/image";
import { pickFeaturedPost, uniqueAuthors } from "./format";
import type {
  CmsAlumniSpotlight,
  CmsAuthor,
  CmsCategory,
  CmsJob,
  CmsMentor,
  CmsPartner,
  CmsPost,
  CmsTag,
  CmsTeamMember,
  CmsTestimonial,
} from "./types";
import type { PortableTextBlock } from "@portabletext/react";

type SanityImage = unknown;

type SanityAuthor = {
  name?: string;
  slug?: string;
  position?: string;
  picture?: SanityImage;
};

type SanityCategory = {
  name?: string;
  slug?: string;
  color?: string;
};

type SanityTag = {
  name?: string;
  slug?: string;
};

export type SanityPostDetail = SanityPostListItem & {
  postBody?: PortableTextBlock[];
  metaTitle?: string;
  metaDescription?: string;
  coAuthors?: SanityAuthor[] | null;
};

export type SanityJob = {
  slug: string;
  name: string;
  jobTitle?: string;
  excerpt?: string;
  organization?: string;
  location?: string;
  type?: string;
  applicationDeadline?: string;
  applicationLink?: string;
};

export type SanityPartner = {
  slug: string;
  name: string;
  logo?: SanityImage;
  website?: string;
  type?: string;
};

export type SanityMentor = {
  slug: string;
  name: string;
  profession?: string;
  shortBio?: string;
  photo?: SanityImage;
  linkedin?: string;
};

export type SanityAlumniSpotlight = {
  slug: string;
  name: string;
  alumniName?: string;
  ventureName?: string;
  oneLiner?: string;
  profilePicture?: SanityImage;
  profilePictureAlt?: string;
  country?: string;
  featured?: boolean;
  whyStarted?: string;
  videoLink?: string;
  sortNumber?: number;
};

export type SanityTestimonial = {
  slug: string;
  personName: string;
  whatTheyDo?: string;
  egcPosition?: string;
  testimonial?: string;
  personImage?: SanityImage;
  videoLink?: string;
};

export type SanityTeamMember = {
  slug: string;
  name: string;
  role?: string;
  photo?: SanityImage;
  bio?: string;
  linkedin?: string;
  sortOrder?: number;
};
export type SanityPostListItem = {
  name: string;
  slug: string;
  postSummary?: string;
  publishedAt?: string;
  featured?: boolean;
  blogPageFeature?: boolean;
  minutesToRead?: number;
  sortOrder?: number;
  mainImage?: SanityImage;
  thumbnailImage?: SanityImage;
  author?: SanityAuthor | null;
  category?: SanityCategory | null;
  tags?: SanityTag[] | null;
};

function imageUrl(image?: SanityImage): string | undefined {
  const url = urlForImage(image as never);
  return url || undefined;
}

function adaptAuthor(author?: SanityAuthor | null): CmsAuthor | undefined {
  if (!author?.name || !author.slug) return undefined;
  return {
    slug: author.slug,
    name: author.name,
    position: author.position,
    picture: imageUrl(author.picture),
  };
}

function adaptCategory(category?: SanityCategory | null): CmsCategory | undefined {
  if (!category?.name || !category.slug) return undefined;
  return {
    slug: category.slug,
    name: category.name,
    color: category.color,
  };
}

function adaptTags(tags?: SanityTag[] | null): CmsTag[] {
  if (!tags?.length) return [];
  return tags
    .filter((tag): tag is SanityTag & { name: string; slug: string } =>
      Boolean(tag.name && tag.slug)
    )
    .map((tag) => ({ slug: tag.slug, name: tag.name }));
}

export function sanityPostToCmsPost(post: SanityPostListItem): CmsPost {
  return {
    slug: post.slug,
    name: post.name,
    postSummary: post.postSummary,
    mainImage: imageUrl(post.mainImage),
    thumbnailImage: imageUrl(post.thumbnailImage),
    featured: Boolean(post.featured),
    blogPageFeature: Boolean(post.blogPageFeature),
    minutesToRead: post.minutesToRead,
    sortOrder: post.sortOrder,
    publishedAt: post.publishedAt,
    author: adaptAuthor(post.author),
    coAuthors: [],
    category: adaptCategory(post.category),
    tags: adaptTags(post.tags),
  };
}

export function sanityPostsToFeatured(posts: CmsPost[]): CmsPost[] {
  return pickFeaturedPost(posts);
}

export function sanityPostDetailToCmsPost(post: SanityPostDetail): CmsPost {
  return {
    ...sanityPostToCmsPost(post),
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    coAuthors: uniqueAuthors(
      (post.coAuthors ?? [])
        .map((author) => adaptAuthor(author))
        .filter((author): author is CmsAuthor => Boolean(author))
    ).filter((author) => author.slug !== post.author?.slug),
    tags: adaptTags(post.tags),
  };
}

export function sanityJobToCmsJob(job: SanityJob): CmsJob {
  return {
    slug: job.slug,
    name: job.name,
    jobTitle: job.jobTitle,
    excerpt: job.excerpt,
    organization: job.organization,
    location: job.location,
    type: job.type,
    applicationDeadline: job.applicationDeadline,
    applicationLink: job.applicationLink,
  };
}

export function sanityPartnerToCmsPartner(partner: SanityPartner): CmsPartner {
  return {
    slug: partner.slug,
    name: partner.name,
    logo: imageUrl(partner.logo),
    website: partner.website,
    type: partner.type,
  };
}

export function sanityMentorToCmsMentor(mentor: SanityMentor): CmsMentor {
  return {
    slug: mentor.slug,
    name: mentor.name,
    profession: mentor.profession,
    shortBio: mentor.shortBio,
    photo: imageUrl(mentor.photo),
    linkedin: mentor.linkedin,
  };
}

export function sanityPostsToCategories(posts: CmsPost[]): CmsCategory[] {
  const categories = new Map<string, CmsCategory>();
  for (const post of posts) {
    if (post.category) categories.set(post.category.slug, post.category);
  }
  return [...categories.values()];
}

export function sanityAlumniToCmsAlumni(alumni: SanityAlumniSpotlight): CmsAlumniSpotlight {
  return {
    slug: alumni.slug,
    name: alumni.name,
    alumniName: alumni.alumniName,
    ventureName: alumni.ventureName,
    oneLiner: alumni.oneLiner,
    profilePicture: imageUrl(alumni.profilePicture),
    profilePictureAlt: alumni.profilePictureAlt,
    country: alumni.country,
    featured: Boolean(alumni.featured),
    whyStarted: alumni.whyStarted,
    videoLink: alumni.videoLink,
    sortNumber: alumni.sortNumber,
  };
}

export function sanityTestimonialToCmsTestimonial(item: SanityTestimonial): CmsTestimonial {
  return {
    slug: item.slug,
    personName: item.personName,
    whatTheyDo: item.whatTheyDo,
    egcPosition: item.egcPosition,
    testimonial: item.testimonial,
    personImage: imageUrl(item.personImage),
    videoLink: item.videoLink,
  };
}

export function sanityTeamMemberToCmsTeamMember(member: SanityTeamMember): CmsTeamMember {
  return {
    slug: member.slug,
    name: member.name,
    role: member.role,
    photo: imageUrl(member.photo),
    bio: member.bio,
    linkedin: member.linkedin,
    sortOrder: member.sortOrder,
  };
}
