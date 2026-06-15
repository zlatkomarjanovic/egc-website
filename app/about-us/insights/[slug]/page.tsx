import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { PortableTextBlock } from "@portabletext/react";
import { sanityFetch } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image";
import { postBySlugQuery, postSlugsQuery } from "@/sanity/lib/queries";
import PortableText from "@/components/PortableText";

/**
 * EXAMPLE Sanity-backed detail route (Insights / blog posts). This is the template
 * pattern for every CMS collection (careers, mentors, partners, …). It returns 404
 * until the CMS is connected and a matching post exists, so nothing breaks pre-launch.
 */

export const revalidate = 60;

type PostParam = { slug: string };

type Post = {
  name: string;
  postSummary?: string;
  publishedAt?: string;
  mainImage?: unknown;
  postBody?: PortableTextBlock[];
  author?: { name?: string; position?: string } | null;
};

export async function generateStaticParams(): Promise<PostParam[]> {
  const slugs = await sanityFetch<PostParam[]>(postSlugsQuery, {}, []);
  return slugs ?? [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PostParam>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await sanityFetch<Post>(postBySlugQuery, { slug });
  if (!post) return { title: "Not found" };
  return {
    title: post.name,
    description: post.postSummary,
    alternates: { canonical: `/about-us/insights/${slug}` },
  };
}

export default async function InsightPostPage({
  params,
}: {
  params: Promise<PostParam>;
}) {
  const { slug } = await params;
  const post = await sanityFetch<Post>(postBySlugQuery, { slug });
  if (!post) notFound();

  const cover = urlForImage(post.mainImage as never);

  return (
    <main className="section_blog-post">
      <div className="padding-global">
        <div className="container-medium">
          <div className="padding-vertical padding-xxlarge">
            <header className="margin-bottom margin-large">
              <h1 className="heading-style-h1">{post.name}</h1>
              {post.author?.name ? (
                <p className="text-size-medium">
                  By {post.author.name}
                  {post.author.position ? `, ${post.author.position}` : ""}
                  {post.publishedAt
                    ? ` · ${new Date(post.publishedAt).toLocaleDateString()}`
                    : ""}
                </p>
              ) : null}
            </header>
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt={post.name} className="margin-bottom margin-large" style={{ width: "100%", borderRadius: 12 }} />
            ) : null}
            <article className="text-rich-text w-richtext">
              <PortableText value={post.postBody} />
            </article>
          </div>
        </div>
      </div>
    </main>
  );
}
