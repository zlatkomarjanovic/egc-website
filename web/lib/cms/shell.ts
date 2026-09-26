const BLOG_HEADER = '<header id="blog-header-21"';
const AFTER_BLOG = '<div class="section-padding btm">';

export type InsightsShell = {
  beforeBlog: string;
  afterBlog: string;
};

export type PageChrome = {
  before: string;
  after: string;
};

/** Split any Webflow page into nav chrome and footer chrome. */
export function splitNavAndFooter(bodyHtml: string): PageChrome {
  const mainStart = bodyHtml.search(/<(section|header)\b/i);
  const footerStart = bodyHtml.indexOf("<footer");

  if (mainStart === -1 || footerStart === -1) {
    throw new Error("Could not split page chrome from content.json");
  }

  return {
    before: bodyHtml.slice(0, mainStart),
    after: bodyHtml.slice(footerStart),
  };
}

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
