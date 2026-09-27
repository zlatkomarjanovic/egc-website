/** @type {import('next').NextConfig} */

// Content Security Policy.
// NOTE: 'unsafe-inline' is required for scripts because the Webflow export ships
// inline <script>/<style> blocks (the w-mod detector, JSON-LD, font smoothing).
// User-submitted data is never reflected into HTML (forms post JSON to API routes
// and responses are validated server-side), so the XSS surface stays closed.
const ContentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://d3e54v103j8qbb.cloudfront.net https://cdn.prod.website-files.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "media-src 'self' https:",
  "connect-src 'self' https://cdn.jsdelivr.net https://*.sanity.io https://*.apicdn.sanity.io https://api.resend.com",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: ContentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "cdn.prod.website-files.com" },
    ],
  },
  trailingSlash: false,
  async redirects() {
    // Webflow category collection slugs (current + aliases). These must never
    // 308 to /post/:slug because those paths 404.
    const insightsCategorySlug =
      "communication|communication-and-marketing|communication-marketing|marketing|entrepreneurship|leadership|leadership-and-management|leadership-management|management|networking|networking-and-relationships|networking-relationships|relationships|trends|trends-and-insights|trends-insights|insights";

    return [
      {
        source: `/about-us/insights/:slug(${insightsCategorySlug})`,
        destination: "/about-us/insights",
        permanent: true,
      },
      {
        source: `/insights/:slug(${insightsCategorySlug})`,
        destination: "/about-us/insights",
        permanent: true,
      },
      {
        source: `/blog/:slug(${insightsCategorySlug})`,
        destination: "/about-us/insights",
        permanent: true,
      },
      {
        source: "/about-us/insights/:slug",
        destination: "/post/:slug",
        permanent: true,
      },
      {
        source: "/about-us/egc-our-team",
        destination: "/about-us/egc-board-of-directors",
        permanent: true,
      },
      {
        source: "/mentorship",
        destination: "/become-an-egc-mentor",
        permanent: true,
      },
      {
        source: "/mentorship/:path*",
        destination: "/become-an-egc-mentor",
        permanent: true,
      },
      {
        source: "/programs/bold-fellowship",
        destination: "/programs/bold-fellowship/general",
        permanent: true,
      },
      {
        source: "/apply",
        destination: "/programs",
        permanent: true,
      },
      {
        source: "/blog",
        destination: "/about-us/insights",
        permanent: true,
      },
      {
        source: "/blog/:slug",
        destination: "/post/:slug",
        permanent: true,
      },
      {
        source: "/team",
        destination: "/about-us/egc-board-of-directors",
        permanent: true,
      },
      {
        source: "/index.html",
        destination: "/",
        permanent: true,
      },
      {
        source: "/insights",
        destination: "/about-us/insights",
        permanent: true,
      },
      {
        source: "/insights/:slug",
        destination: "/post/:slug",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/sitemap.xml",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, must-revalidate",
          },
        ],
      },
      {
        source: "/robots.txt",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, must-revalidate",
          },
        ],
      },
      {
        // Long-lived caching for the immutable Webflow assets.
        source: "/:dir(images|fonts|videos|css|js)/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
