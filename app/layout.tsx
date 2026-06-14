import type { Metadata } from "next";
import Script from "next/script";
import FormEnhancer from "@/components/FormEnhancer";

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
      </head>
      <body>
        {/* Webflow's no-JS / touch detector — must run before paint. */}
        <Script id="wf-mod" strategy="beforeInteractive">
          {`!function(o,c){var n=c.documentElement,t=" w-mod-";n.className+=t+"js",("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&(n.className+=t+"touch")}(window,document);`}
        </Script>

        {/* jQuery must be available before webflow.js initializes. */}
        <Script
          src="https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js"
          integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0="
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />

        {children}

        {/* Webflow interactions/animations. Runs after the page HTML is present. */}
        <Script src="/js/webflow.js" strategy="afterInteractive" />

        {/* Finsweet: cookie consent (gates analytics), attributes, scroll-disable. */}
        <Script
          src="https://cdn.jsdelivr.net/npm/@finsweet/cookie-consent@1/fs-cc.js"
          strategy="afterInteractive"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/@finsweet/attributes-scrolldisable@1/scrolldisable.js"
          strategy="afterInteractive"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/@finsweet/attributes@2/attributes.js"
          type="module"
          strategy="afterInteractive"
        />

        {/* Securely intercepts Webflow forms and posts them to our API routes. */}
        <FormEnhancer />
      </body>
    </html>
  );
}
