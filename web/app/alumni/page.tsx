import InlineScripts from "@/components/InlineScripts";
import JsonLd from "@/components/JsonLd";
import { applyWebflowHtmlFixups } from "@/lib/cms/html-fixups";
import { alumniDirectoryItemsHtml } from "@/lib/cms/collection-html";
import { loadAlumniSpotlightsForFellowship } from "@/lib/cms";
import { relatedReadsSection, stripSeoHeadExtras } from "@/lib/cms/seo-html-fixups";
import { splitNavAndFooter } from "@/lib/cms/shell";
import { contentPageMetadata, PAGE_META } from "@/lib/page-meta";
import { alumniPath, breadcrumbJsonLd, collectionJsonLd } from "@/lib/seo";
import content from "../about-us/mission-and-vision/content.json";

export const metadata = contentPageMetadata("/alumni", content.metadata);
export const revalidate = 60;

export default async function Page() {
  const alumni = await loadAlumniSpotlightsForFellowship();
  const { before, after } = splitNavAndFooter(content.bodyHtml);
  const copy = PAGE_META["/alumni"];

  const main = `
      <header class="section_hero egc-alumni-hero">
        <div class="header30_background-image-wrapper">
          <img src="/images/Copy-of-IMG-20250615-WA0001-p-1600.jpg" alt="EGC alumni founders" class="header30_background-image" width="1600" height="1067">
          <div class="overlay-div"></div>
        </div>
        <div class="padding-global">
          <div class="container-large">
            <div class="header30_content text-align-center">
              <nav aria-label="Breadcrumb" class="text-size-small text-color-white">
                <a href="/">Home</a> / <span>Alumni</span>
              </nav>
              <h1 class="heading-style-h1">Alumni Spotlight</h1>
              <p class="text-size-regular">${copy.description}</p>
            </div>
          </div>
        </div>
      </header>
      <section class="section_layout236" aria-label="Alumni founders">
        <div class="padding-global">
          <div class="container-large">
            <div class="padding-section-large egc-alumni-body">
              <h2 class="heading-style-h3">EGC alumni founders</h2>
              <p class="text-size-regular">Browse founders from BOLD Fellowship and other EGC programs. Each story opens the full Alumni Spotlight interview.</p>
              <div class="grid-testimonials-homebtm egc-alumni-dir" role="list">
                ${alumniDirectoryItemsHtml(alumni)}
              </div>
            </div>
          </div>
        </div>
      </section>
      ${relatedReadsSection()}`;

  return (
    <>
      <JsonLd
        data={collectionJsonLd(
          "Alumni Spotlight",
          "/alumni",
          copy.description,
          alumni.map((person) => ({
            name: person.alumniName || person.name,
            path: alumniPath(person.slug),
          }))
        )}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Alumni", path: "/alumni" },
        ])}
      />
      <div className={content.rootClass}>
        <div
          dangerouslySetInnerHTML={{
            __html:
              applyWebflowHtmlFixups(before) +
              applyWebflowHtmlFixups(main) +
              applyWebflowHtmlFixups(after),
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
