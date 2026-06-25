const BLOG_HEADER = '<header id="blog-header-21"';
const AFTER_BLOG = '<div class="section-padding btm">';

export type InsightsShell = {
  beforeBlog: string;
  afterBlog: string;
};

/** Split the insights page shell into nav/header and footer/CTA sections. */
export function splitInsightsShell(bodyHtml: string): InsightsShell {
  const blogStart = bodyHtml.indexOf(BLOG_HEADER);
  const afterBlogStart = bodyHtml.indexOf(AFTER_BLOG);

  if (blogStart === -1 || afterBlogStart === -1) {
    throw new Error("Could not split insights page shell from content.json");
  }

  return {
    beforeBlog: bodyHtml.slice(0, blogStart),
    afterBlog: bodyHtml.slice(afterBlogStart),
  };
}
