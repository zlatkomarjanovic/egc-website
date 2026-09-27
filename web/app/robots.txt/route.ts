import { getSiteUrl } from "@/lib/seo";

export function GET() {
  const site = getSiteUrl();
  const body = `# EGC robots
# LLM site map: ${site}/llms.txt
User-agent: *
Allow: /
Disallow: /studio
Disallow: /api/

User-agent: Googlebot
Allow: /
Disallow: /studio
Disallow: /api/

User-agent: GPTBot
Allow: /
Disallow: /studio
Disallow: /api/

User-agent: ChatGPT-User
Allow: /
Disallow: /studio
Disallow: /api/

User-agent: OAI-SearchBot
Allow: /
Disallow: /studio
Disallow: /api/

User-agent: anthropic-ai
Allow: /
Disallow: /studio
Disallow: /api/

User-agent: ClaudeBot
Allow: /
Disallow: /studio
Disallow: /api/

User-agent: Claude-SearchBot
Allow: /
Disallow: /studio
Disallow: /api/

User-agent: PerplexityBot
Allow: /
Disallow: /studio
Disallow: /api/

User-agent: Perplexity-User
Allow: /
Disallow: /studio
Disallow: /api/

User-agent: Google-Extended
Allow: /
Disallow: /studio
Disallow: /api/

User-agent: CCBot
Allow: /
Disallow: /studio
Disallow: /api/

User-agent: Bytespider
Allow: /
Disallow: /studio
Disallow: /api/

User-agent: Amazonbot
Allow: /
Disallow: /studio
Disallow: /api/

User-agent: meta-externalagent
Allow: /
Disallow: /studio
Disallow: /api/

Sitemap: ${site}/sitemap.xml
Host: https://www.egcnyc.org
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
