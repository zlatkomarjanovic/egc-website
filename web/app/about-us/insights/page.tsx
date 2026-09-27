import type { Metadata } from "next";
import InlineScripts from "@/components/InlineScripts";
import JsonLd from "@/components/JsonLd";
import { buildInsightsBlogSection } from "@/lib/cms/insights-html";
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
import { breadcrumbJsonLd, collectionJsonLd, postPath } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/client";
import { isSanityConfigured } from "@/sanity/env";
import { allPostsQuery } from "@/sanity/lib/queries";
import content from "./content.json";

const INSIGHTS_TITLE = "EGC Insights | Youth Entrepreneurship Articles";
const INSIGHTS_DESCRIPTION =
  "Articles from Entrepreneurs for Global Change on youth entrepreneurship, startup programs, and founder stories from emerging ecosystems.";

export const metadata: Metadata = {
  ...(content.metadata as Metadata),
  title: INSIGHTS_TITLE,
  description: INSIGHTS_DESCRIPTION,
  openGraph: {
    ...(content.metadata as Metadata).openGraph,
    title: INSIGHTS_TITLE,
    description: INSIGHTS_DESCRIPTION,
    type: "website",
  },
  twitter: {
    ...(content.metadata as Metadata).twitter,
    card: "summary_large_image",
    title: INSIGHTS_TITLE,
    description: INSIGHTS_DESCRIPTION,
  },
};
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
      <JsonLd
        data={collectionJsonLd(
          "Insights by EGC",
          "/about-us/insights",
          INSIGHTS_DESCRIPTION,
          posts.map((post) => ({ name: post.name, path: postPath(post.slug) }))
        )}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Insights", path: "/about-us/insights" },
        ])}
      />
      <div className={content.rootClass}>
        <div
          dangerouslySetInnerHTML={{
            __html:
              shellBefore +
              buildInsightsBlogSection(posts, categories, featuredPosts) +
              shellAfter,
          }}
        />
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
