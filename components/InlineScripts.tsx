"use client";

import { useEffect } from "react";

/**
 * Executes the custom inline scripts that lived in a Webflow page's <head>/<body>.
 * Scripts injected through dangerouslySetInnerHTML never run, so we re-create them as
 * real <script> elements after mount. Many Webflow snippets register a
 * `DOMContentLoaded` listener; since that event has long fired by the time we run, we
 * dispatch a synthetic one so those listeners still fire exactly once.
 *
 * These scripts are static, build-time content authored in Webflow — never user input.
 */
export default function InlineScripts({ scripts }: { scripts: string[] }) {
  useEffect(() => {
    if (!scripts || scripts.length === 0) return;

    const appended: HTMLScriptElement[] = [];
    for (const code of scripts) {
      if (!code || !code.trim()) continue;
      const el = document.createElement("script");
      el.type = "text/javascript";
      el.textContent = code;
      el.setAttribute("data-egc-inline", "true");
      document.body.appendChild(el);
      appended.push(el);
    }

    if (appended.length > 0) {
      // Let any freshly-registered DOMContentLoaded listeners run.
      document.dispatchEvent(new Event("DOMContentLoaded"));
    }

    return () => {
      for (const el of appended) el.remove();
    };
  }, [scripts]);

  return null;
}
