import InlineScripts from "@/components/InlineScripts";
import JsonLd from "@/components/JsonLd";
import { applyWebflowHtmlFixups } from "@/lib/cms/html-fixups";
import { stripSeoHeadExtras } from "@/lib/cms/seo-html-fixups";
import { splitNavAndFooter } from "@/lib/cms/shell";
import { breadcrumbJsonLd, collectionJsonLd } from "@/lib/seo";
import content from "@/app/about-us/mission-and-vision/content.json";

type HubLink = {
  href: string;
  name: string;
  description: string;
};

type HubPageProps = {
  title: string;
  description: string;
  path: string;
  crumbs: Array<{ name: string; path: string }>;
  links: HubLink[];
  extraHtml?: string;
};

export default function HubPage({
  title,
  description,
  path,
  crumbs,
  links,
  extraHtml = "",
}: HubPageProps) {
  const { before, after } = splitNavAndFooter(content.bodyHtml);
  const escape = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const items = links
    .map(
      (link) => `
                <div class="margin-bottom margin-medium">
                  <h2 class="heading-style-h3"><a href="${escape(link.href)}">${escape(link.name)}</a></h2>
                  <p class="text-size-regular">${escape(link.description)}</p>
                </div>`
    )
    .join("");

  const main = `
      <section class="section_layout236">
        <div class="padding-global">
          <div class="container-large">
            <div class="padding-section-large">
              <div class="margin-bottom margin-medium">
                <h1 class="heading-style-h1">${title}</h1>
              </div>
              <p class="text-size-regular">${description}</p>
              <div class="margin-top margin-large">${items}</div>
              ${extraHtml}
            </div>
          </div>
        </div>
      </section>`;

  return (
    <>
      <JsonLd
        data={collectionJsonLd(
          title,
          path,
          description,
          links.map((link) => ({ name: link.name, path: link.href }))
        )}
      />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <div className={content.rootClass}>
        <div
          dangerouslySetInnerHTML={{
            __html:
              applyWebflowHtmlFixups(before) + main + applyWebflowHtmlFixups(after),
          }}
        />
      </div>
      {content.headExtras ? (
        <div
          style={{ display: "contents" }}
          dangerouslySetInnerHTML={{ __html: stripSeoHeadExtras(content.headExtras) }}
        />
      ) : null}
      <InlineScripts scripts={content.scripts} />
    </>
  );
}
