import InlineScripts from "./InlineScripts";

type WebflowPageProps = {
  /** Per-page <style> blocks, JSON-LD and consent-gated (fs-cc) scripts from the original <head>. */
  headExtras: string;
  /** The original <body> inner HTML, with asset paths and internal links rewritten. */
  bodyHtml: string;
  /** Executable inline scripts (custom Webflow code) to run after the page mounts. */
  scripts: string[];
};

/**
 * Renders a faithfully-ported Webflow page. The original markup is injected verbatim
 * (preserving every class so the exported CSS applies and webflow.js can drive its
 * interactions). React owns the document shell; this subtree is treated as opaque,
 * so webflow.js and the form enhancer can manipulate it freely without hydration
 * conflicts. No user-controlled data is ever rendered here, so injection stays safe.
 */
export default function WebflowPage({
  headExtras,
  bodyHtml,
  scripts,
}: WebflowPageProps) {
  return (
    <>
      {headExtras ? (
        <div
          style={{ display: "contents" }}
          dangerouslySetInnerHTML={{ __html: headExtras }}
        />
      ) : null}
      <div
        style={{ display: "contents" }}
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />
      <InlineScripts scripts={scripts} />
    </>
  );
}
