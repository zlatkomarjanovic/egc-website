"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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
      <Link href={`/post/${post.slug}`} className="blog21_featured-item-link w-inline-block">
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
      <Link href={`/post/${post.slug}`} className="blog21_item-link w-inline-block">
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
  const searchRef = useRef<HTMLInputElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

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
      const categorySlug = (post.category?.slug || "").toLowerCase();
      const categoryName = (post.category?.name || "").toLowerCase();
      const matchesCategory =
        selectedCategory === "all" ||
        categorySlug === selectedCategory ||
        categoryName === selectedCategory.replace(/-/g, " ");
      if (!matchesCategory) return false;
      if (!query) return true;

      const haystack = [
        post.name,
        post.postSummary,
        post.category?.name,
        post.author?.name,
        ...post.tags.map((tag) => tag.name),
      ]
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

  useEffect(() => {
    const input = searchRef.current;
    if (!input) return;

    const syncSearch = () => updateSearch(input.value);
    const onInput = () => syncSearch();

    const onPointerDown = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest<HTMLButtonElement>("[data-insights-category]");
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      updateCategory(button.dataset.insightsCategory || "all");
    };

    input.addEventListener("input", onInput);
    input.addEventListener("keyup", onInput);
    window.addEventListener("pointerdown", onPointerDown, true);
    const poll = window.setInterval(syncSearch, 250);

    return () => {
      input.removeEventListener("input", onInput);
      input.removeEventListener("keyup", onInput);
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.clearInterval(poll);
    };
  }, []);

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
                  <div className="form-block insights-filter" ref={filterRef}>
                    <div
                      id="insights-filter-form"
                      onClick={(event) => event.stopPropagation()}
                      onKeyDown={(event) => event.stopPropagation()}
                    >
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
                            ref={searchRef}
                            className="search-box insights-search-input"
                            maxLength={256}
                            name="insights-search"
                            placeholder="Search..."
                            type="text"
                            autoComplete="off"
                            aria-label="Search insights"
                            defaultValue=""
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
                              className="finsweet-radio insights-filter-btn"
                              data-insights-category="all"
                              aria-pressed={selectedCategory === "all"}
                            >
                              <span
                                className={`finsweet-radio-btn insights-filter-dot${
                                  selectedCategory === "all" ? " is-active" : ""
                                }`}
                              />
                              <span className="finsweet-radio-label">All</span>
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
                                className="finsweet-radio insights-filter-btn"
                                data-insights-category={category.slug}
                                aria-pressed={selectedCategory === category.slug}
                              >
                                <span
                                  className={`finsweet-radio-btn insights-filter-dot${
                                    selectedCategory === category.slug ? " is-active" : ""
                                  }`}
                                />
                                <span className="finsweet-radio-label">
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
