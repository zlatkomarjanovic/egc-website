"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CmsCategory, CmsPost } from "@/lib/cms/types";
import {
  authorImage,
  formatPostDate,
  minutesLabel,
  postDateValue,
  postImage,
} from "@/lib/cms/format";

const POSTS_PER_PAGE = 6;

type InsightsBlogSectionProps = {
  posts: CmsPost[];
  categories: CmsCategory[];
  featuredPosts: CmsPost[];
};

function FeaturedPostCard({ post }: { post: CmsPost }) {
  const date = formatPostDate(postDateValue(post));
  const minutes = minutesLabel(post.minutesToRead);

  return (
    <div role="listitem" className="blog21_featured-item w-dyn-item">
      <Link href={`/about-us/insights/${post.slug}`} className="blog21_featured-item-link w-inline-block">
        <div className="blog21_featured-image-wrapper">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={post.name}
            loading="lazy"
            src={postImage(post)}
            className="blog21_featured-image"
          />
        </div>
        <div className="blog21_featured-item-content">
          <div className="margin-bottom margin-xxsmall">
            <div className="tagline">{post.category?.name}</div>
          </div>
          <div className="margin-bottom margin-xsmall">
            <h3 className="heading-style-h4">{post.name}</h3>
          </div>
          <div className="text-size-regular opacity-70">{post.postSummary}</div>
          <div className="margin-top margin-small">
            <div className="blog21_author-wrapper">
              <div className="blog21_author-image-wrapper">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={post.author?.name ?? ""}
                  loading="lazy"
                  src={authorImage(post.author)}
                  className="blog21_author-image"
                />
              </div>
              <div className="blog21_author-text">
                <div className="text-size-small text-weight-semibold">{post.author?.name}</div>
                <div className="blog21_date-wrapper">
                  <div className="text-size-small">{date}</div>
                  {minutes ? (
                    <>
                      <div className="blog21_text-divider">•</div>
                      <div className="text-size-small">{minutes}</div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

function PostListCard({ post }: { post: CmsPost }) {
  const date = formatPostDate(postDateValue(post));
  const minutes = minutesLabel(post.minutesToRead);

  return (
    <div role="listitem" className="blog21_item w-dyn-item">
      <Link href={`/about-us/insights/${post.slug}`} className="blog21_item-link w-inline-block">
        <div className="margin-bottom margin-small">
          <div className="blog21_image-wrapper">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={post.name}
              loading="lazy"
              src={postImage(post, true)}
              className="blog21_image"
            />
          </div>
        </div>
        <div className="margin-bottom margin-xxsmall">
          <div className="tagline">{post.category?.name}</div>
        </div>
        <div className="margin-bottom margin-xxsmall">
          <h3 className="heading-style-h5">{post.name}</h3>
        </div>
        <div className="text-size-regular opacity-70">{post.postSummary}</div>
        <div className="margin-top margin-small">
          <div className="blog21_author-wrapper">
            <div className="blog21_author-image-wrapper">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={post.author?.name ?? ""}
                loading="lazy"
                src={authorImage(post.author)}
                className="blog21_author-image"
              />
            </div>
            <div className="blog21_author-text">
              <div className="text-size-small text-weight-semibold">{post.author?.name}</div>
              <div className="blog21_date-wrapper">
                <div className="text-size-small opacity-70">{date}</div>
                {minutes ? (
                  <>
                    <div className="blog21_text-divider opacity-70">•</div>
                    <div className="text-size-small opacity-70">{minutes}</div>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function InsightsBlogSection({
  posts,
  categories,
  featuredPosts,
}: InsightsBlogSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [page, setPage] = useState(1);

  const sortedCategories = useMemo(
    () =>
      [...categories].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      ),
    [categories]
  );

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesCategory =
        selectedCategory === "all" || post.category?.slug === selectedCategory;
      if (!matchesCategory) return false;
      if (!query) return true;

      const haystack = [post.name, post.postSummary, post.category?.name, post.author?.name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [posts, searchQuery, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pagePosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  function updateSearch(value: string) {
    setSearchQuery(value);
    setPage(1);
  }

  function updateCategory(value: string) {
    setSelectedCategory(value);
    setPage(1);
  }

  return (
    <header id="blog-header-21" className="section_blog21">
      <div className="padding-global">
        <div className="container-large">
          <div className="padding-section-large">
            <div className="blog21_component">
              <div className="margin-bottom margin-xxlarge">
                <div>
                  <div className="margin-bottom margin-xsmall">
                    <div className="tagline">INSIGHTS</div>
                  </div>
                  <div className="margin-bottom margin-small">
                    <h1 className="heading-style-h2">
                      Read about key trends and insights shaping youth entrepreneurship
                    </h1>
                  </div>
                  <p className="text-size-medium opacity-70">
                    Explore the latest trends in entrepreneurship, innovation, and networking.
                    Learn how to transform ideas into successful ventures and create lasting
                    networks.
                  </p>
                </div>
              </div>

              {featuredPosts.length ? (
                <div className="margin-bottom margin-xxlarge">
                  <div className="blog21_featured-list-wrapper w-dyn-list">
                    <div role="list" className="blog21_featured-list w-dyn-items">
                      {featuredPosts.map((post) => (
                        <FeaturedPostCard key={post.slug} post={post} />
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="blog21_content">
                <div className="category-filter-menu">
                  <div className="form-block insights-filter">
                    <div id="insights-filter-form">
                      <div className="margin-bottom margin-medium">
                        <div className="search-wrap">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/images/search.svg"
                            loading="lazy"
                            alt=""
                            className="search-icon"
                          />
                          <input
                            className="search-box w-input"
                            maxLength={256}
                            name="insights-search"
                            placeholder="Search..."
                            type="search"
                            autoComplete="off"
                            aria-label="Search insights"
                            value={searchQuery}
                            onChange={(event) => updateSearch(event.target.value)}
                          />
                        </div>
                      </div>
                      <div
                        className="categories-wrap w-dyn-list"
                        role="radiogroup"
                        aria-label="Filter by category"
                      >
                        <div role="list" className="categories-list w-dyn-items">
                          <div role="listitem" className="categories-item w-dyn-item">
                            <button
                              type="button"
                              className="finsweet-radio w-radio insights-filter-btn"
                              aria-pressed={selectedCategory === "all"}
                              onClick={() => updateCategory("all")}
                            >
                              <span
                                className={`w-form-formradioinput w-form-formradioinput--inputType-custom finsweet-radio-btn w-radio-input${
                                  selectedCategory === "all" ? " w--redirected-checked" : ""
                                }`}
                              />
                              <span className="finsweet-radio-label w-form-label">All</span>
                            </button>
                          </div>
                          {sortedCategories.map((category) => (
                            <div
                              key={category.slug}
                              role="listitem"
                              className="categories-item w-dyn-item"
                            >
                              <button
                                type="button"
                                className="finsweet-radio w-radio insights-filter-btn"
                                aria-pressed={selectedCategory === category.slug}
                                onClick={() => updateCategory(category.slug)}
                              >
                                <span
                                  className={`w-form-formradioinput w-form-formradioinput--inputType-custom finsweet-radio-btn w-radio-input${
                                    selectedCategory === category.slug
                                      ? " w--redirected-checked"
                                      : ""
                                  }`}
                                />
                                <span className="finsweet-radio-label w-form-label">
                                  {category.name}
                                </span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="blog21_list-wrapper w-dyn-list">
                  {pagePosts.length ? (
                    <div role="list" className="blog21_list w-dyn-items">
                      {pagePosts.map((post) => (
                        <PostListCard key={post.slug} post={post} />
                      ))}
                    </div>
                  ) : (
                    <div className="insights-empty">No posts match your search or filter.</div>
                  )}

                  {filteredPosts.length > POSTS_PER_PAGE ? (
                    <div className="insights-pagination">
                      <button
                        type="button"
                        className="button is-secondary w-button"
                        disabled={currentPage === 1}
                        onClick={() => setPage((value) => Math.max(1, value - 1))}
                      >
                        Previous
                      </button>
                      <div className="insights-pagination__status">
                        Page {currentPage} of {totalPages}
                      </div>
                      <button
                        type="button"
                        className="button is-secondary w-button"
                        disabled={currentPage === totalPages}
                        onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                      >
                        Next
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
