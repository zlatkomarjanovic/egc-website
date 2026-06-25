import type { Metadata } from "next";
import WebflowPage from "@/components/WebflowPage";
import { injectTeamList, loadTeamMembers } from "@/lib/cms";
import content from "./content.json";

export const metadata: Metadata = content.metadata as unknown as Metadata;
export const revalidate = 60;

export default async function Page() {
  const team = await loadTeamMembers("staff");
  const bodyHtml = injectTeamList(content.bodyHtml, team);

  return (
    <WebflowPage
      headExtras={content.headExtras}
      bodyHtml={bodyHtml}
      rootClass={content.rootClass}
      scripts={content.scripts}
    />
  );
}
