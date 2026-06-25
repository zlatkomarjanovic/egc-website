import WebflowPage from "@/components/WebflowPage";
import content from "./not-found.content.json";

export default function NotFound() {
  return (
    <WebflowPage
      headExtras={content.headExtras}
      bodyHtml={content.bodyHtml}
      rootClass={content.rootClass}
      scripts={content.scripts}
    />
  );
}
