import type { Metadata } from "next";
import ConsentAnalytics from "@/components/ConsentAnalytics";
import FormEnhancer from "@/components/FormEnhancer";
import JsonLd from "@/components/JsonLd";
import wfPages from "@/lib/wf-pages.json";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_ALT,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  SITE_NAME,
  getSiteUrl,
  founderJsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";

const WF_SITE_ID = "6a2ed7db57ccd44542c25786";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: DEFAULT_TITLE,
    template: "%s",
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: getSiteUrl() }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Nonprofit",
  referrer: "strict-origin-when-cross-origin",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: getSiteUrl(),
    images: [{ url: DEFAULT_OG_IMAGE, alt: DEFAULT_OG_ALT, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
      { url: "/images/favicon.png", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
      { url: "/images/webclip.png" },
    ],
  },
  verification: {
    google: "Fw7cC4U3zzayVZ1Rdx1KFmY6GDrtg8pjgTW1jCroA_U",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-US" data-wf-site={WF_SITE_ID}>
      <head>
        {/* Webflow CSS — order matters; same precedence preserves it. */}
        <link rel="stylesheet" href="/css/normalize.css" precedence="default" />
        <link rel="stylesheet" href="/css/webflow.css" precedence="default" />
        <link
          rel="stylesheet"
          href="/css/egc-staging-27323bfac8974ca5bc4feec8fe4.webflow.css"
          precedence="default"
        />
        <link rel="stylesheet" href="/css/cms-overrides.css?v=reads-12" precedence="default" />
        {/* Set the per-route data-wf-page on <html> synchronously, before webflow.js
            runs. Without it webflow.js can't bind IX2 interactions and the scroll-in
            reveal animations stay stuck at their hidden initial state. A raw inline
            script (not next/script) guarantees it executes during initial parse. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=${JSON.stringify(
              wfPages
            )};var p=location.pathname.replace(/\\/+$/,"");if(p==="")p="/";var id=m[p];if(!id){var s=p.split("/").filter(Boolean)[0];if(s)id=m["/"+s];}if(id)document.documentElement.setAttribute("data-wf-page",id);}catch(e){}})();`,
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
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={founderJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
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
        <script src="/js/insights-filter.js" />

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
        <ConsentAnalytics />
      </body>
    </html>
  );
}
