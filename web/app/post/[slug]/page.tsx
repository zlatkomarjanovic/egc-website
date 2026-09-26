import type { Metadata } from "next";
import InlineScripts from "@/components/InlineScripts";
import JsonLd from "@/components/JsonLd";
import PostDetailView from "@/components/insights/PostDetailView";
import PortableText from "@/components/PortableText";
import {
  getPostBySlug,
  getPostSlugs,
  getRelatedPosts,
  splitInsightsShell,
} from "@/lib/cms";
import { sortCmsPosts } from "@/lib/cms/format";
import { applyWebflowHtmlFixups } from "@/lib/cms/html-fixups";
import {
  sanityPostDetailToCmsPost,
  sanityPostToCmsPost,
  type SanityPostDetail,
  type SanityPostListItem,
} from "@/lib/cms/adapt-sanity";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  postMetadata,
  postPath,
} from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/client";
import { isSanityConfigured } from "@/sanity/env";
import { allPostsQuery, postBySlugQuery, postSlugsQuery } from "@/sanity/lib/queries";
import { notFound } from "next/navigation";
import content from "../../about-us/insights/content.json";

export const revalidate = 60;

type PostParam = { slug: string };

function getShell() {
  return splitInsightsShell(content.bodyHtml);
}

export async function generateStaticParams(): Promise<PostParam[]> {
  if (isSanityConfigured) {
    return (await sanityFetch<PostParam[]>(postSlugsQuery, {}, [])) ?? [];
  }
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PostParam>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (isSanityConfigured) {
    const sanityPost = await sanityFetch<SanityPostDetail>(postBySlugQuery, { slug });
    if (sanityPost) {
      return postMetadata(sanityPostDetailToCmsPost(sanityPost));
    }
    return { title: "Not found", robots: { index: false, follow: false } };
  }

  const cmsPost = getPostBySlug(slug);
  if (!cmsPost) return { title: "Not found", robots: { index: false, follow: false } };
  return postMetadata(cmsPost);
}

async function getRelatedCmsPosts(slug: string) {
  if (isSanityConfigured) {
    const sanityRelated = await sanityFetch<SanityPostListItem[]>(allPostsQuery, {}, []);
    return (sanityRelated ?? [])
      .filter((post) => post.slug !== slug)
      .map(sanityPostToCmsPost)
      .sort(sortCmsPosts)
      .slice(0, 3);
  }
  return getRelatedPosts(slug);
}

export default async function InsightPostPage({
  params,
}: {
  params: Promise<PostParam>;
}) {
  const { slug } = await params;
  const { beforeBlog, afterBlog } = getShell();
  const shellBefore = applyWebflowHtmlFixups(beforeBlog);
  const shellAfter = applyWebflowHtmlFixups(afterBlog);
  const relatedPosts = await getRelatedCmsPosts(slug);

  if (isSanityConfigured) {
    const sanityPost = await sanityFetch<SanityPostDetail>(postBySlugQuery, { slug });
    if (!sanityPost) notFound();
    const post = sanityPostDetailToCmsPost(sanityPost);
    return (
      <>
        <JsonLd data={articleJsonLd(post)} />
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Insights", path: "/about-us/insights" },
            { name: post.name, path: postPath(post.slug) },
          ])}
        />
        <div className={content.rootClass}>
          <div dangerouslySetInnerHTML={{ __html: shellBefore }} />
          <PostDetailView
            post={post}
            relatedPosts={relatedPosts}
            body={
              <article className="text-rich-text w-richtext">
                <PortableText value={sanityPost.postBody} />
              </article>
            }
          />
          <div dangerouslySetInnerHTML={{ __html: shellAfter }} />
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

  const cmsPost = getPostBySlug(slug);
  if (!cmsPost) notFound();

  return (
    <>
      <JsonLd data={articleJsonLd(cmsPost)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Insights", path: "/about-us/insights" },
          { name: cmsPost.name, path: postPath(cmsPost.slug) },
        ])}
      />
      <div className={content.rootClass}>
        <div dangerouslySetInnerHTML={{ __html: shellBefore }} />
        <PostDetailView post={cmsPost} relatedPosts={relatedPosts} />
        <div dangerouslySetInnerHTML={{ __html: shellAfter }} />
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
