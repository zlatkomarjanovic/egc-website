export type CmsAuthor = {
  slug: string;
  name: string;
  position?: string;
  picture?: string;
  bioSummary?: string;
  linkedin?: string;
};

export type CmsCategory = {
  slug: string;
  name: string;
  color?: string;
};

export type CmsTag = {
  slug: string;
  name: string;
};

export type CmsPost = {
  slug: string;
  name: string;
  postSummary?: string;
  postBody?: string;
  mainImage?: string;
  thumbnailImage?: string;
  featured: boolean;
  blogPageFeature: boolean;
  minutesToRead?: number;
  sortOrder?: number;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
  author?: CmsAuthor;
  coAuthors: CmsAuthor[];
  category?: CmsCategory;
  tags: CmsTag[];
};

export type CmsJob = {
  slug: string;
  name: string;
  jobTitle?: string;
  excerpt?: string;
  organization?: string;
  location?: string;
  type?: string;
  applicationDeadline?: string;
  applicationLink?: string;
  coverImage?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  descriptionText?: string;
};

export type CmsPartner = {
  slug: string;
  name: string;
  logo?: string;
  website?: string;
  type?: string;
};

export type CmsMentor = {
  slug: string;
  name: string;
  profession?: string;
  shortBio?: string;
  photo?: string;
  linkedin?: string;
};

export type CmsAlumniSpotlight = {
  slug: string;
  name: string;
  alumniName?: string;
  ventureName?: string;
  oneLiner?: string;
  profilePicture?: string;
  profilePictureAlt?: string;
  country?: string;
  featured: boolean;
  whyStarted?: string;
  fundraised?: string;
  trends?: string;
  biggestChallenge?: string;
  adviceFirstTime?: string;
  whatDrives?: string;
  extraNote?: string;
  videoLink?: string;
  sortNumber?: number;
};

export type CmsTestimonial = {
  slug: string;
  personName: string;
  whatTheyDo?: string;
  egcPosition?: string;
  testimonial?: string;
  personImage?: string;
  videoLink?: string;
};

export type CmsTeamMember = {
  slug: string;
  name: string;
  role?: string;
  photo?: string;
  bio?: string;
  linkedin?: string;
  sortOrder?: number;
};
