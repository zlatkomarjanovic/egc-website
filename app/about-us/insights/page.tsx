import type { Metadata } from "next";
import WebflowPage from "@/components/WebflowPage";
import {
  buildInsightsBodyHtml,
  getAllPosts,
  getCategoriesWithPosts,
  getFeaturedPosts,
  splitInsightsShell,
} from "@/lib/cms";
import content from "./content.json";

export const metadata: Metadata = content.metadata as unknown as Metadata;

export default function Page() {
  const posts = getAllPosts();
  const categories = getCategoriesWithPosts();
  const featuredPosts = getFeaturedPosts();
  const { beforeBlog, afterBlog } = splitInsightsShell(content.bodyHtml);
  const bodyHtml = buildInsightsBodyHtml(
    beforeBlog,
    afterBlog,
    posts,
    categories,
    featuredPosts
  );

  return (
    <WebflowPage
      headExtras={content.headExtras}
      bodyHtml={bodyHtml}
      rootClass={content.rootClass}
      scripts={content.scripts}
    />
  );
}
