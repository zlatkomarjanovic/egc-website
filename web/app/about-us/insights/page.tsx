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
import { stripSeoHeadExtras } from "@/lib/cms/seo-html-fixups";
import { contentPageMetadata, PAGE_META } from "@/lib/page-meta";
import { breadcrumbJsonLd, collectionJsonLd, postPath } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/client";
import { isSanityConfigured } from "@/sanity/env";
import { allPostsQuery } from "@/sanity/lib/queries";
import content from "./content.json";

const INSIGHTS_DESCRIPTION = PAGE_META["/about-us/insights"].description;

export const revalidate = 60;

type InsightsSearch = { category?: string; q?: string };

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<InsightsSearch>;
}): Promise<Metadata> {
  const params = await searchParams;
  const filtered = Boolean(params.category || params.q);
  return contentPageMetadata("/about-us/insights", content.metadata, {
    noIndex: filtered,
  });
}

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
      <main className={content.rootClass}>
        <div
          dangerouslySetInnerHTML={{
            __html:
              shellBefore +
              buildInsightsBlogSection(posts, categories, featuredPosts) +
              shellAfter,
          }}
        />
      </main>
      {content.headExtras ? (
        <div
          style={{ display: "contents" }}
          dangerouslySetInnerHTML={{ __html: stripSeoHeadExtras(content.headExtras) }}
        />
      ) : null}
      <InlineScripts scripts={content.scripts} />
    </>
  );
}
