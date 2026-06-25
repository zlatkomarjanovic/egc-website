import type { CmsCategory, CmsPost } from "./types";
import {
  authorImage,
  escapeHtml,
  formatPostDate,
  minutesLabel,
  postDateValue,
  postImage,
} from "./format";

function postHref(slug: string): string {
  return `/about-us/insights/${slug}`;
}

function featuredPostHtml(post: CmsPost): string {
  const date = formatPostDate(postDateValue(post));
  const minutes = minutesLabel(post.minutesToRead);
  const authorName = post.author?.name ?? "";
  const category = post.category?.name ?? "";

  return `<div role="listitem" class="blog21_featured-item w-dyn-item">
  <a href="${postHref(post.slug)}" class="blog21_featured-item-link w-inline-block">
    <div class="blog21_featured-image-wrapper"><img alt="${escapeHtml(post.name)}" loading="lazy" src="${escapeHtml(postImage(post))}" class="blog21_featured-image"></div>
    <div class="blog21_featured-item-content">
      <div class="margin-bottom margin-xxsmall">
        <div class="tagline">${escapeHtml(category)}</div>
      </div>
      <div class="margin-bottom margin-xsmall">
        <h3 class="heading-style-h4">${escapeHtml(post.name)}</h3>
      </div>
      <div class="text-size-regular opacity-70">${escapeHtml(post.postSummary ?? "")}</div>
      <div class="margin-top margin-small">
        <div class="blog21_author-wrapper">
          <div class="blog21_author-image-wrapper"><img alt="${escapeHtml(authorName)}" loading="lazy" src="${escapeHtml(authorImage(post.author))}" class="blog21_author-image"></div>
          <div class="blog21_author-text">
            <div class="text-size-small text-weight-semibold">${escapeHtml(authorName)}</div>
            <div class="blog21_date-wrapper">
              <div class="text-size-small">${escapeHtml(date)}</div>
              <div class="blog21_text-divider">•</div>
              <div class="text-size-small">${escapeHtml(minutes)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </a>
</div>`;
}

function listPostHtml(post: CmsPost): string {
  const date = formatPostDate(postDateValue(post));
  const minutes = minutesLabel(post.minutesToRead);
  const authorName = post.author?.name ?? "";
  const category = post.category?.name ?? "";

  return `<div role="listitem" class="blog21_item w-dyn-item">
  <a href="${postHref(post.slug)}" class="blog21_item-link w-inline-block">
    <div class="margin-bottom margin-small">
      <div class="blog21_image-wrapper"><img alt="${escapeHtml(post.name)}" loading="lazy" src="${escapeHtml(postImage(post, true))}" class="blog21_image"></div>
    </div>
    <div class="margin-bottom margin-xxsmall">
      <div fs-cmsfilter-field="category" class="tagline">${escapeHtml(category)}</div>
    </div>
    <div class="margin-bottom margin-xxsmall">
      <h3 fs-cmsfilter-field="title" class="heading-style-h5">${escapeHtml(post.name)}</h3>
    </div>
    <div class="text-size-regular opacity-70">${escapeHtml(post.postSummary ?? "")}</div>
    <div class="margin-top margin-small">
      <div class="blog21_author-wrapper">
        <div class="blog21_author-image-wrapper"><img alt="${escapeHtml(authorName)}" loading="lazy" src="${escapeHtml(authorImage(post.author))}" class="blog21_author-image"></div>
        <div class="blog21_author-text">
          <div class="text-size-small text-weight-semibold">${escapeHtml(authorName)}</div>
          <div class="blog21_date-wrapper">
            <div class="text-size-small opacity-70">${escapeHtml(date)}</div>
            <div class="blog21_text-divider opacity-70">•</div>
            <div class="text-size-small opacity-70">${escapeHtml(minutes)}</div>
          </div>
        </div>
      </div>
    </div>
  </a>
</div>`;
}

function categoryFilterHtml(category: CmsCategory): string {
  const inputId = `category-${category.slug}`;
  return `<div role="listitem" class="categories-item w-dyn-item"><label class="finsweet-radio w-radio">
    <div class="w-form-formradioinput w-form-formradioinput--inputType-custom finsweet-radio-btn w-radio-input"></div><input type="radio" data-name="Radio" id="${inputId}" name="radio" style="opacity:0;position:absolute;z-index:-1" value="${escapeHtml(category.slug)}"><span fs-cmsfilter-field="category" class="finsweet-radio-label w-form-label" for="${inputId}">${escapeHtml(category.name)}</span>
  </label></div>`;
}

export function buildInsightsBlogSection(
  posts: CmsPost[],
  categories: CmsCategory[],
  featuredPosts: CmsPost[]
): string {
  const featuredItems = featuredPosts.map(featuredPostHtml).join("\n");
  const categoryItems = categories.map(categoryFilterHtml).join("\n");
  const listItems = posts.map(listPostHtml).join("\n");

  return `<header id="blog-header-21" class="section_blog21">
        <div class="padding-global">
          <div class="container-large">
            <div class="padding-section-large">
              <div class="blog21_component">
                <div class="margin-bottom margin-xxlarge">
                  <div>
                    <div class="margin-bottom margin-xsmall">
                      <div class="tagline">INSIGHTS</div>
                    </div>
                    <div class="margin-bottom margin-small">
                      <h1 class="heading-style-h2">Read about key trends and insights shaping youth entrepreneurship</h1>
                    </div>
                    <p class="text-size-medium opacity-70">Explore the latest trends in entrepreneurship, innovation, and networking. Learn how to transform ideas into successful ventures and create lasting networks.</p>
                  </div>
                </div>
                <div class="margin-bottom margin-xxlarge">
                  <div class="blog21_featured-list-wrapper w-dyn-list">
                    <div role="list" class="blog21_featured-list w-dyn-items">
                      ${featuredItems}
                    </div>
                  </div>
                </div>
                <div class="blog21_content">
                  <div class="category-filter-menu">
                    <div fs-cmsfilter-element="filters" class="form-block w-form">
                      <form id="email-form" name="email-form" data-name="Email Form" method="get" data-wf-page-id="6a2ed7db57ccd44542c25777" data-wf-element-id="fdc0adbb-006f-2a5e-dce1-7c5384e846e9">
                        <div class="margin-bottom margin-medium">
                          <div class="search-wrap"><img src="/images/search.svg" loading="lazy" alt="" class="search-icon"><input class="search-box w-input" maxlength="256" name="Search" fs-cmsfilter-field="title" data-name="Search" placeholder="Search..." type="text" id="Search" required=""></div>
                        </div>
                        <div class="categories-wrap w-dyn-list">
                          <div role="list" class="categories-list w-dyn-items">
                            ${categoryItems}
                          </div>
                        </div>
                      </form>
                      <div class="w-form-done">
                        <div>Thank you! Your submission has been received!</div>
                      </div>
                      <div class="w-form-fail">
                        <div>Oops! Something went wrong while submitting the form.</div>
                      </div>
                    </div>
                  </div>
                  <div class="blog21_list-wrapper w-dyn-list">
                    <div fs-cmsfilter-element="list" role="list" class="blog21_list w-dyn-items">
                      ${listItems}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>`;
}

export function buildInsightsBodyHtml(
  shellBefore: string,
  shellAfter: string,
  posts: CmsPost[],
  categories: CmsCategory[],
  featuredPosts: CmsPost[]
): string {
  return (
    shellBefore +
    buildInsightsBlogSection(posts, categories, featuredPosts) +
    shellAfter
  );
}
