import type { Metadata } from "next";
import InlineScripts from "@/components/InlineScripts";
import PostDetailView from "@/components/insights/PostDetailView";
import {
  getPostBySlug,
  getPostSlugs,
  getRelatedPosts,
  splitInsightsShell,
} from "@/lib/cms";
import { sanityFetch } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image";
import { postBySlugQuery, postSlugsQuery } from "@/sanity/lib/queries";
import { notFound } from "next/navigation";
import type { PortableTextBlock } from "@portabletext/react";
import PortableText from "@/components/PortableText";
import content from "../content.json";

export const revalidate = 60;

type PostParam = { slug: string };

type SanityPost = {
  name: string;
  postSummary?: string;
  publishedAt?: string;
  mainImage?: unknown;
  postBody?: PortableTextBlock[];
  author?: { name?: string; position?: string } | null;
};

function getShell() {
  return splitInsightsShell(content.bodyHtml);
}

export async function generateStaticParams(): Promise<PostParam[]> {
  const sanitySlugs = await sanityFetch<PostParam[]>(postSlugsQuery, {}, []);
  const cmsSlugs = getPostSlugs().map((slug) => ({ slug }));
  const seen = new Set<string>();
  const params: PostParam[] = [];

  for (const entry of [...(sanitySlugs ?? []), ...cmsSlugs]) {
    if (seen.has(entry.slug)) continue;
    seen.add(entry.slug);
    params.push(entry);
  }

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PostParam>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sanityPost = await sanityFetch<SanityPost>(postBySlugQuery, { slug });
  const cmsPost = getPostBySlug(slug);
  const post = sanityPost ?? cmsPost;

  if (!post) return { title: "Not found" };

  return {
    title: ("metaTitle" in post && post.metaTitle) || post.name,
    description:
      ("metaDescription" in post && post.metaDescription) || post.postSummary,
    alternates: { canonical: `/about-us/insights/${slug}` },
  };
}

export default async function InsightPostPage({
  params,
}: {
  params: Promise<PostParam>;
}) {
  const { slug } = await params;
  const sanityPost = await sanityFetch<SanityPost>(postBySlugQuery, { slug });
  const cmsPost = getPostBySlug(slug);

  if (sanityPost) {
    const cover = urlForImage(sanityPost.mainImage as never);
    const { beforeBlog, afterBlog } = getShell();

    return (
      <>
        <div className={content.rootClass}>
          <div dangerouslySetInnerHTML={{ __html: beforeBlog }} />
          <main className="section_blog-post">
            <div className="padding-global">
              <div className="container-medium">
                <div className="padding-vertical padding-xxlarge">
                  <header className="margin-bottom margin-large">
                    <h1 className="heading-style-h1">{sanityPost.name}</h1>
                    {sanityPost.author?.name ? (
                      <p className="text-size-medium">
                        By {sanityPost.author.name}
                        {sanityPost.author.position
                          ? `, ${sanityPost.author.position}`
                          : ""}
                        {sanityPost.publishedAt
                          ? ` · ${new Date(sanityPost.publishedAt).toLocaleDateString()}`
                          : ""}
                      </p>
                    ) : null}
                  </header>
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover}
                      alt={sanityPost.name}
                      className="margin-bottom margin-large"
                      style={{ width: "100%", borderRadius: 12 }}
                    />
                  ) : null}
                  <article className="text-rich-text w-richtext">
                    <PortableText value={sanityPost.postBody} />
                  </article>
                </div>
              </div>
            </div>
          </main>
          <div dangerouslySetInnerHTML={{ __html: afterBlog }} />
        </div>
        {content.headExtras ? (
          <div
            style={{ display: "contents" }}
            dangerouslySetInnerHTML={{ __html: content.headExtras }}
          />
        ) : null}
        <InlineScripts scripts={content.scripts} />
      </>
    );
  }

  if (!cmsPost) notFound();

  const { beforeBlog, afterBlog } = getShell();
  const relatedPosts = getRelatedPosts(slug);

  return (
    <>
      <div className={content.rootClass}>
        <div dangerouslySetInnerHTML={{ __html: beforeBlog }} />
        <PostDetailView post={cmsPost} relatedPosts={relatedPosts} />
        <div dangerouslySetInnerHTML={{ __html: afterBlog }} />
      </div>
      {content.headExtras ? (
        <div
          style={{ display: "contents" }}
          dangerouslySetInnerHTML={{ __html: content.headExtras }}
        />
      ) : null}
      <InlineScripts scripts={content.scripts} />
    </>
  );
}
