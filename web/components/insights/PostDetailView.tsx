import type { ReactNode } from "react";
import Link from "next/link";
import type { CmsAuthor, CmsPost } from "@/lib/cms/types";
import {
  authorImage,
  formatPostDate,
  minutesLabel,
  postDateValue,
  postImage,
  uniqueAuthors,
} from "@/lib/cms/format";

type PostDetailViewProps = {
  post: CmsPost;
  relatedPosts: CmsPost[];
  body?: ReactNode;
};

function Contributor({ author }: { author: CmsAuthor }) {
  return (
    <div role="listitem" className="w-dyn-item">
      <div className="blog-post5-content_author-wrapper">
        <div className="blog-post5-content_author-image-wrapper">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={authorImage(author)}
            loading="lazy"
            alt={author.name}
            className="blog-post5-content_author-image"
          />
        </div>
        <div>
          <div className="text-weight-semibold">{author.name}</div>
          {author.position ? (
            <div className="text-size-small">{author.position}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function RelatedPostCard({ post }: { post: CmsPost }) {
  const date = formatPostDate(postDateValue(post));
  const minutes = minutesLabel(post.minutesToRead);

  return (
    <div role="listitem" className="blog37_item w-dyn-item">
      <Link href={`/post/${post.slug}`} className="blog37_item-link w-inline-block">
        <div className="margin-bottom margin-small">
          <div className="blog37_image-wrapper">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={post.name}
              loading="lazy"
              src={postImage(post, true)}
              className="blog37_image"
            />
          </div>
        </div>
        <div className="margin-bottom margin-xxsmall">
          <div className="tag is-text">{post.category?.name}</div>
        </div>
        <div className="margin-bottom margin-xxsmall">
          <h3 className="heading-style-h5">{post.name}</h3>
        </div>
        <div className="text-size-regular">{post.postSummary}</div>
        <div className="margin-top margin-small">
          <div className="blog37_author-wrapper">
            <div className="blog37_author-image-wrapper">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={post.author?.name ?? ""}
                loading="lazy"
                src={authorImage(post.author)}
                className="blog37_author-image"
              />
            </div>
            <div className="blog37_author-text">
              <div className="text-size-small text-weight-semibold">
                {post.author?.name}
              </div>
              <div className="blog37_date-wrapper">
                <div className="text-size-small">{date}</div>
                {minutes ? (
                  <>
                    <div className="blog37_text-divider">•</div>
                    <div className="text-size-small">{minutes}</div>
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

export default function PostDetailView({ post, relatedPosts, body }: PostDetailViewProps) {
  const contributors = uniqueAuthors([post.author, ...post.coAuthors]);
  const publishedDate = formatPostDate(postDateValue(post));
  const minutes = minutesLabel(post.minutesToRead);

  return (
    <>
      <header className="section_blog-post5-header">
        <div className="padding-global">
          <div className="container-large">
            <div className="padding-section-large">
              <div className="w-layout-grid blog-post5-header_component">
                <div className="blog-post5-header_title-wrapper">
                  <div className="margin-bottom margin-medium">
                    <div className="button-group">
                      <Link
                        href="/about-us/insights"
                        className="button is-link is-icon w-inline-block"
                      >
                        <div className="icon-embed-xxsmall w-embed">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M11 13L6 8L11 3"
                              stroke="CurrentColor"
                              strokeWidth="1.5"
                            />
                          </svg>
                        </div>
                        <div>All Posts</div>
                      </Link>
                    </div>
                  </div>
                  <div className="blog-post5-header_meta-wrapper">
                    {post.category?.name ? (
                      <div className="tagline">{post.category.name}</div>
                    ) : null}
                    {minutes ? <div className="text-size-small">{minutes}</div> : null}
                  </div>
                  <div className="margin-bottom margin-medium">
                    <h1 className="heading-style-h3">{post.name}</h1>
                  </div>
                  {publishedDate ? (
                    <div className="blog-post5-header_date-wrapper">
                      <div className="text-size-small">Published on</div>
                      <div className="blog-post5-header_date">{publishedDate}</div>
                    </div>
                  ) : null}
                </div>
                <div className="blog-post5-header_image-wrapper">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    height={100}
                    loading="eager"
                    width={100}
                    src={postImage(post)}
                    alt={post.name}
                    className="blog-post5-header_image"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <header className="section_blog-post5-content">
        <div className="padding-global">
          <div className="container-large">
            <div className="padding-bottom padding-xhuge">
              <div className="padding-section-large btm-0">
                <div className="blog-post5-content_component">
                  <div className="blog-post5-content_content-left">
                    {contributors.length ? (
                      <div className="blog-post5-content_contributers">
                        <div className="margin-bottom margin-small">
                          <div className="text-size-medium">Contributors</div>
                        </div>
                        <div className="w-dyn-list">
                          <div role="list" className="w-dyn-items">
                            {contributors.map((author) => (
                              <Contributor key={author.slug} author={author} />
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {contributors.length && post.tags.length ? (
                      <div className="blog-post5-content_divider" />
                    ) : null}

                    {post.tags.length ? (
                      <div className="blog-post5-content_contributers">
                        <div className="margin-bottom margin-small">
                          <div className="text-size-medium">Tags</div>
                        </div>
                        <div className="tags-wrap w-dyn-list">
                          <div role="list" className="tags-list w-dyn-items">
                            {post.tags.map((tag) => (
                              <div key={tag.slug} role="listitem" className="tag-item w-dyn-item">
                                <div className="blog-tag">
                                  <div>{tag.name}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : null}

                    <div className="blog-post5-content_divider" />
                  </div>

                  <div className="blog-post5-content_content">
                    {body ?? (
                      <article
                        className="text-rich-text w-richtext"
                        dangerouslySetInnerHTML={{ __html: post.postBody ?? "" }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {relatedPosts.length ? (
        <section className="section_blog37">
          <div className="padding-global">
            <div className="container-large">
              <div className="padding-section-large">
                <div className="blog37_component">
                  <div className="margin-bottom margin-xxlarge">
                    <div className="max-width-large">
                      <div className="margin-bottom margin-small">
                        <div className="tagline">
                          <div className="text-style-tagline">continue reading</div>
                        </div>
                      </div>
                      <div className="margin-bottom margin-small">
                        <h2 className="heading-style-h2">More from Our Blog</h2>
                      </div>
                      <p className="text-size-medium">
                        Welcome to the EGC Blog, where we delve into the world of
                        entrepreneurship and innovation. Here, you&apos;ll find inspiring
                        stories, practical tips, and insightful discussions aimed at
                        empowering the next generation of global changemakers.
                      </p>
                    </div>
                  </div>
                  <div className="blog37_list-wrapper w-dyn-list">
                    <div role="list" className="blog37_list w-dyn-items">
                      {relatedPosts.map((relatedPost) => (
                        <RelatedPostCard key={relatedPost.slug} post={relatedPost} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
