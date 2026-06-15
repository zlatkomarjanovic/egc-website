import InlineScripts from "./InlineScripts";

type WebflowPageProps = {
  /** Per-page <style> blocks, JSON-LD and consent-gated (fs-cc) scripts from the original <head>. */
  headExtras: string;
  /** Inner HTML of the page's root wrapper (or the full body if there isn't one). */
  bodyHtml: string;
  /** Class of the hoisted root wrapper (e.g. "page-wrapper"); empty -> passthrough host. */
  rootClass?: string;
  /** Executable inline scripts (custom Webflow code) to run after the page mounts. */
  scripts: string[];
};

/**
 * Renders a faithfully-ported Webflow page. The original markup is injected verbatim
 * (preserving every class so the exported CSS applies and webflow.js can drive its
 * interactions). The host element stands in for Webflow's .page-wrapper so the DOM
 * is identical to the export (body > .page-wrapper > ...) — an extra wrapper level
 * breaks IX2's scroll-into-view math. React treats this subtree as opaque, so
 * webflow.js and the form enhancer manipulate it freely without hydration conflicts.
 * No user-controlled data is ever rendered here, so injection stays safe.
 */
export default function WebflowPage({
  headExtras,
  bodyHtml,
  rootClass,
  scripts,
}: WebflowPageProps) {
  return (
    <>
      <div
        {...(rootClass
          ? { className: rootClass }
          : { style: { display: "contents" } })}
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />
      {headExtras ? (
        <div
          style={{ display: "contents" }}
          dangerouslySetInnerHTML={{ __html: headExtras }}
        />
      ) : null}
      <InlineScripts scripts={scripts} />
    </>
  );
}
