import type { Metadata } from "next";
import InlineScripts from "@/components/InlineScripts";
import InsightsBlogSection from "@/components/insights/InsightsBlogSection";
import {
  sanityPostsToCategories,
  sanityPostsToFeatured,
  sanityPostToCmsPost,
  type SanityPostListItem,
} from "@/lib/cms/adapt-sanity";
import {
  getAllPosts,
  getCategoriesWithPosts,
  getFeaturedPosts,
  splitInsightsShell,
} from "@/lib/cms";
import { sortCmsPosts } from "@/lib/cms/format";
import { applyWebflowHtmlFixups } from "@/lib/cms/html-fixups";
import { sanityFetch } from "@/sanity/lib/client";
import { isSanityConfigured } from "@/sanity/env";
import { allPostsQuery } from "@/sanity/lib/queries";
import content from "./content.json";

export const metadata: Metadata = content.metadata as unknown as Metadata;
export const revalidate = 60;

export default async function Page() {
  const sanityPosts = isSanityConfigured
    ? await sanityFetch<SanityPostListItem[]>(allPostsQuery, {}, [])
    : null;
  const posts =
    sanityPosts !== null
      ? sanityPosts.map(sanityPostToCmsPost).sort(sortCmsPosts)
      : getAllPosts();
  const categories =
    sanityPosts !== null ? sanityPostsToCategories(posts) : getCategoriesWithPosts();
  const featuredPosts =
    sanityPosts !== null ? sanityPostsToFeatured(posts) : getFeaturedPosts();

  const { beforeBlog, afterBlog } = splitInsightsShell(content.bodyHtml);
  const shellBefore = applyWebflowHtmlFixups(beforeBlog);
  const shellAfter = applyWebflowHtmlFixups(afterBlog);

  return (
    <>
      <div className={content.rootClass}>
        <div dangerouslySetInnerHTML={{ __html: shellBefore }} />
        <InsightsBlogSection
          posts={posts}
          categories={categories}
          featuredPosts={featuredPosts}
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
