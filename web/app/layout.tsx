import type { Metadata } from "next";
import FormEnhancer from "@/components/FormEnhancer";
import wfPages from "@/lib/wf-pages.json";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://egcnyc.org";
const WF_SITE_ID = "6a2ed7db57ccd44542c25786";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "EGC | Entrepreneurs for Global Change",
    template: "%s",
  },
  description:
    "EGC empowers aspiring young founders from emerging global ecosystems to plant seeds of positive change, driving innovation with a sustainable future.",
  generator: "Next.js",
  icons: {
    icon: "/images/favicon.png",
    apple: "/images/webclip.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-wf-site={WF_SITE_ID}>
      <head>
        {/* Webflow CSS — order matters; same precedence preserves it. */}
        <link rel="stylesheet" href="/css/normalize.css" precedence="default" />
        <link rel="stylesheet" href="/css/webflow.css" precedence="default" />
        <link
          rel="stylesheet"
          href="/css/egc-staging-27323bfac8974ca5bc4feec8fe4.webflow.css"
          precedence="default"
        />
        <link rel="stylesheet" href="/css/cms-overrides.css" precedence="default" />
        {/* Set the per-route data-wf-page on <html> synchronously, before webflow.js
            runs. Without it webflow.js can't bind IX2 interactions and the scroll-in
            reveal animations stay stuck at their hidden initial state. A raw inline
            script (not next/script) guarantees it executes during initial parse. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=${JSON.stringify(
              wfPages
            )};var p=location.pathname.replace(/\\/+$/,"");if(p==="")p="/";var id=m[p];if(id)document.documentElement.setAttribute("data-wf-page",id);}catch(e){}})();`,
          }}
        />
        {/* Webflow's no-JS / touch detector — adds w-mod-js / w-mod-touch on <html>. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(o,c){var n=c.documentElement,t=" w-mod-";n.className+=t+"js",("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&(n.className+=t+"touch")}(window,document);`,
          }}
        />
      </head>
      <body>
        {children}

        {/* Scripts are plain tags (not next/script) loaded at the end of <body>,
            exactly like the original Webflow export. This guarantees jQuery loads
            before webflow.js and that webflow.js initializes on the real page load
            in BOTH dev and production (next/script's beforeInteractive is flaky in
            dev). Order here is execution order. */}
        <script
          src="https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js"
          integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0="
          crossOrigin="anonymous"
        />
        <script src="/js/webflow.js" />

        {/* Finsweet: cookie consent (gates analytics), attributes, scroll-disable. */}
        <script src="https://cdn.jsdelivr.net/npm/@finsweet/cookie-consent@1/fs-cc.js" async />
        <script
          src="https://cdn.jsdelivr.net/npm/@finsweet/attributes-scrolldisable@1/scrolldisable.js"
          defer
        />
        <script
          src="https://cdn.jsdelivr.net/npm/@finsweet/attributes@2/attributes.js"
          type="module"
          async
        />

        {/* Securely intercepts Webflow forms and posts them to our API routes. */}
        <FormEnhancer />
      </body>
    </html>
  );
}
