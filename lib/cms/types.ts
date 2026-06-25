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
  metaTitle?: string;
  metaDescription?: string;
  author?: CmsAuthor;
  coAuthors: CmsAuthor[];
  category?: CmsCategory;
  tags: CmsTag[];
};
