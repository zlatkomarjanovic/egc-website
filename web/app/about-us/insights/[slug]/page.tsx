import { permanentRedirect } from "next/navigation";

type PostParam = { slug: string };

export default async function LegacyInsightPostRedirect({
  params,
}: {
  params: Promise<PostParam>;
}) {
  const { slug } = await params;
  permanentRedirect(`/post/${slug}`);
}
