import { escapeHtml } from "./format";
import type { CmsAlumniSpotlight, CmsJob, CmsMentor, CmsPartner, CmsTeamMember } from "./types";

const PLACEHOLDER_LOGO = "/images/6191a88a1c0e39463c2bf022_placeholder-image.svg";
const PLACEHOLDER_MENTOR = "/images/6191a88a1c0e39463c2bf022_placeholder-image.svg";
const PLACEHOLDER_ALUMNI = "/images/1697797846790.jpeg";
const PLACEHOLDER_TEAM = "/images/6191a88a1c0e39463c2bf022_placeholder-image.svg";

const LINKEDIN_ICON_SVG = `<svg height="currentHeight" viewbox="0 0 176 176" width="currentWidth" xmlns="http://www.w3.org/2000/svg"><g id="Layer_2" data-name="Layer 2"><g id="linkedin"><rect id="background" fill="#0077b5" height="176" rx="24" width="176"></rect><g id="icon" fill="#fff"><path d="m63.4 48a15 15 0 1 1 -15-15 15 15 0 0 1 15 15z"></path><path d="m60 73v66.27a3.71 3.71 0 0 1 -3.71 3.73h-15.81a3.71 3.71 0 0 1 -3.72-3.72v-66.28a3.72 3.72 0 0 1 3.72-3.72h15.81a3.72 3.72 0 0 1 3.71 3.72z"></path><path d="m142.64 107.5v32.08a3.41 3.41 0 0 1 -3.42 3.42h-17a3.41 3.41 0 0 1 -3.42-3.42v-31.09c0-4.64 1.36-20.32-12.13-20.32-10.45 0-12.58 10.73-13 15.55v35.86a3.42 3.42 0 0 1 -3.37 3.42h-16.42a3.41 3.41 0 0 1 -3.41-3.42v-66.87a3.41 3.41 0 0 1 3.41-3.42h16.42a3.42 3.42 0 0 1 3.42 3.42v5.78c3.88-5.82 9.63-10.31 21.9-10.31 27.18 0 27.02 25.38 27.02 39.32z"></path></g></g></g></svg>`;

export function sortPartnersByName<T extends { name: string }>(partners: T[]): T[] {
  return [...partners].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );
}

function removeDynEmptyStates(bodyHtml: string): string {
  return bodyHtml.replace(
    /\s*<div class="w-dyn-empty">\s*<div>No items found\.<\/div>\s*<\/div>/g,
    ""
  );
}

function replaceListItems(bodyHtml: string, listClass: string, itemsHtml: string): string {
  const marker = `role="list" class="${listClass}"`;
  const start = bodyHtml.indexOf(marker);
  if (start === -1) return bodyHtml;

  const openEnd = bodyHtml.indexOf(">", start) + 1;
  const emptyIdx = bodyHtml.indexOf('<div class="w-dyn-empty">', openEnd);
  const listCloseStart =
    emptyIdx !== -1
      ? bodyHtml.lastIndexOf("</div>", emptyIdx)
      : bodyHtml.indexOf("</div>", openEnd);

  if (listCloseStart <= openEnd) return bodyHtml;

  const updated =
    bodyHtml.slice(0, openEnd) +
    "\n" +
    itemsHtml +
    "\n" +
    bodyHtml.slice(listCloseStart);

  return removeDynEmptyStates(updated);
}

function jobHref(job: CmsJob): string {
  return `/careers/${job.slug}`;
}

function jobItemHtml(job: CmsJob): string {
  const href = escapeHtml(jobHref(job));
  const external = /^https?:\/\//.test(job.applicationLink || "") ? ' target="_blank" rel="noopener noreferrer"' : "";
  const title = escapeHtml(job.jobTitle || job.name);
  const excerpt = escapeHtml(job.excerpt || "");
  const location = escapeHtml(job.location || "");
  const type = escapeHtml(job.type || "");

  return `<div role="listitem" class="career17_item w-dyn-item">
  <a href="${href}" class="career17_item-link w-inline-block"${external}>
    <div class="margin-bottom margin-xsmall">
      <div class="career17_title-wrapper">
        <h2 class="heading-style-h5">${title}</h2>
      </div>
    </div>
    <p>${excerpt}</p>
    <div class="margin-top margin-small">
      <div class="career17_job-details-wrapper">
        <div class="career17_detail-wrapper">
          <div class="career17_icon-wrapper">
            <div class="icon-embed-xsmall w-embed"><svg width=" 100%" height=" 100%" viewbox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 14C14.206 14 16 12.206 16 10C16 7.794 14.206 6 12 6C9.794 6 8 7.794 8 10C8 12.206 9.794 14 12 14ZM12 8C13.103 8 14 8.897 14 10C14 11.103 13.103 12 12 12C10.897 12 10 11.103 10 10C10 8.897 10.897 8 12 8Z" fill="currentColor"></path><path d="M11.42 21.814C11.5892 21.9349 11.792 21.9998 12 21.9998C12.208 21.9998 12.4107 21.9349 12.58 21.814C12.884 21.599 20.029 16.44 20 10C20 5.589 16.411 2 12 2C7.589 2 4 5.589 4 9.995C3.971 16.44 11.116 21.599 11.42 21.814ZM12 4C15.309 4 18 6.691 18 10.005C18.021 14.443 13.612 18.428 12 19.735C10.389 18.427 5.979 14.441 6 10C6 6.691 8.691 4 12 4Z" fill="currentColor"></path></svg></div>
          </div>
          <div class="text-size-medium">${location}</div>
        </div>
        <div class="career17_detail-wrapper">
          <div class="career17_icon-wrapper">
            <div class="icon-embed-xsmall w-embed"><svg width=" 100%" height=" 100%" viewbox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.486 2 2 6.486 2 12C2 17.514 6.486 22 12 22C17.514 22 22 17.514 22 12C22 6.486 17.514 2 12 2ZM12 20C7.589 20 4 16.411 4 12C4 7.589 7.589 4 12 4C16.411 4 20 7.589 20 12C20 16.411 16.411 20 12 20Z" fill="currentColor"></path><path d="M13 7H11V12.414L14.293 15.707L15.707 14.293L13 11.586V7Z" fill="currentColor"></path></svg></div>
          </div>
          <div class="text-size-medium">${type}</div>
        </div>
      </div>
    </div>
  </a>
</div>`;
}

function partnerItemHtml(partner: CmsPartner): string {
  const href = partner.website ? escapeHtml(partner.website) : "#";
  const external = partner.website ? ' target="_blank" rel="noopener noreferrer"' : "";
  const logo = escapeHtml(partner.logo || PLACEHOLDER_LOGO);
  const alt = escapeHtml(partner.name);

  return `<div role="listitem" class="w-dyn-item">
  <a data-wf--logo-wrapper--variant="base" href="${href}" class="logo6_wrapper w-inline-block"${external}><img alt="${alt}" loading="lazy" src="${logo}" class="logo6_logo"></a>
</div>`;
}

function mentorItemHtml(mentor: CmsMentor): string {
  const photo = escapeHtml(mentor.photo || PLACEHOLDER_MENTOR);
  const name = escapeHtml(mentor.name);
  const profession = escapeHtml(mentor.profession || "");
  const linkedinBlock = mentor.linkedin
    ? `<a href="${escapeHtml(mentor.linkedin)}" class="w-inline-block" target="_blank" rel="noopener noreferrer">
          <div class="icon-1x1-small w-embed">${LINKEDIN_ICON_SVG}</div>
        </a>`
    : "";

  return `<div role="listitem" class="w-dyn-item">
  <div class="team20_item">
    <div class="margin-bottom margin-small">
      <div class="team20_image-wrapper"><img alt="${name}" loading="lazy" src="${photo}" class="team20_image"></div>
    </div>
    <div class="margin-bottom margin-xsmall">
      <div class="team20_title-wrapper">
        <div class="linkedin-wrao">
          ${linkedinBlock}
          <div class="text-size-large text-weight-semibold">${name}</div>
        </div>
        <div class="text-size-small opacity-70">${profession}</div>
      </div>
    </div>
  </div>
</div>`;
}

export function injectCareersList(bodyHtml: string, jobs: CmsJob[]): string {
  return removeDynEmptyStates(
    replaceListItems(
      bodyHtml,
      "career17_list w-dyn-items",
      jobs.map(jobItemHtml).join("\n")
    )
  );
}

export function injectPartnerLists(
  bodyHtml: string,
  programPartners: CmsPartner[],
  globalPartners: CmsPartner[]
): string {
  let html = bodyHtml;
  const programMarker = "Program Partners";
  const globalMarker = "Global Partners";
  const programIdx = html.indexOf(programMarker);
  const globalIdx = html.indexOf(globalMarker);
  const sortedProgram = sortPartnersByName(programPartners);
  const sortedGlobal = sortPartnersByName(globalPartners);

  if (programIdx !== -1 && globalIdx !== -1) {
    const programSection = html.slice(programIdx, globalIdx);
    const updatedProgram = replaceListItems(
      programSection,
      "logo6_list w-dyn-items",
      sortedProgram.map(partnerItemHtml).join("\n")
    );
    html = html.slice(0, programIdx) + updatedProgram + html.slice(globalIdx);

    const globalSection = html.slice(globalIdx);
    html =
      html.slice(0, globalIdx) +
      replaceListItems(
        globalSection,
        "logo6_list w-dyn-items",
        sortedGlobal.map(partnerItemHtml).join("\n")
      );
  }

  return removeDynEmptyStates(html);
}

export function injectMentorsList(bodyHtml: string, mentors: CmsMentor[]): string {
  const sorted = [...mentors].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );
  return replaceListItems(
    bodyHtml,
    "mentors-list w-dyn-items",
    sorted.map(mentorItemHtml).join("\n")
  );
}

function alumniDisplayName(alumni: CmsAlumniSpotlight): string {
  return alumni.alumniName || alumni.name;
}

function alumniDescription(alumni: CmsAlumniSpotlight): string {
  return alumni.oneLiner || alumni.whyStarted || "";
}

function alumniLink(alumni: CmsAlumniSpotlight): string {
  return `/alumni-spotlight/${alumni.slug}`;
}

function alumniCardInnerHtml(alumni: CmsAlumniSpotlight): string {
  const href = escapeHtml(alumniLink(alumni));
  const image = escapeHtml(alumni.profilePicture || PLACEHOLDER_ALUMNI);
  const alt = escapeHtml(alumni.profilePictureAlt || alumniDisplayName(alumni));
  const name = escapeHtml(alumniDisplayName(alumni));
  const venture = escapeHtml(alumni.ventureName || "");
  const description = escapeHtml(alumniDescription(alumni));

  return `<a href="${href}" class="video-item w-inline-block">
    <div class="layout179_image-wrapper"><img alt="${alt}" loading="lazy" src="${image}" class="img-100"></div>
    <div class="margin-bottom margin-xsmall">
      <div class="margin-bottom margin-small">
        <h3 class="heading-style-h4 text-weight-medium">${name}</h3>
        <p class="text-color-egc">${venture}</p>
      </div>
      <div class="margin-bottom margin-small">
        <p class="text-color-egc alumni-excerpt">${description}</p>
      </div>
      <div class="team-link">
        <div>Read more</div>
      </div>
    </div>
  </a>`;
}

function alumniListItemHtml(alumni: CmsAlumniSpotlight): string {
  return `<div role="listitem" class="alumni-ite w-dyn-item">
  ${alumniCardInnerHtml(alumni)}
</div>`;
}

function alumniSlideHtml(alumni: CmsAlumniSpotlight): string {
  return `<div class="slider-item w-slide">
  ${alumniCardInnerHtml(alumni)}
</div>`;
}

function alumniHomeSlideHtml(alumni: CmsAlumniSpotlight): string {
  const name = escapeHtml(alumniDisplayName(alumni));
  const venture = escapeHtml(alumni.ventureName || "");
  const country = escapeHtml(alumni.country || "");
  const text = escapeHtml(alumni.whyStarted || alumni.oneLiner || "");
  const image = escapeHtml(alumni.profilePicture || PLACEHOLDER_ALUMNI);
  const alt = escapeHtml(alumni.profilePictureAlt || `${name} - ${venture}`);
  const title = escapeHtml(`Read about ${alumniDisplayName(alumni).split(" ")[0]}'s success`);

  return `<div class="testimonial15_slide w-slide">
  <div class="w-layout-grid testimonial15_content">
    <div class="grid-mobile">
      <div class="testimonial15_content-left">
        <div class="testimonial-top_content">
          <h3 class="text-color-white">${title}</h3>
          <div class="testimonials-tag_wrap">
            ${venture ? `<div class="testimonial-tag"><div>${venture}</div></div>` : ""}
            ${country ? `<div class="testimonial-tag"><div>${country}</div></div>` : ""}
          </div>
          <div class="testimonial-text_wrap hide-mobile">
            <div class="testimonial-text-max-h-mobile">
              <p class="text-color-white">${text}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="testimonial15_client-image-wrapper">
        <div class="gradient-overlay"></div>
        <div class="testimonial-text-wrap_abs">
          <div>
            <div class="heading-style-h4 text-color-white text-weight-semibold">${name}</div>
            <div class="text-size-16px text-color-white _70">${venture}</div>
          </div>
        </div><img src="${image}" loading="lazy" alt="${alt}" class="testimonial15_client-image">
      </div>
    </div>
    <div class="testimonial-text_wrap hide-desktop">
      <div class="testimonial-text-max-h-mobile">
        <p class="text-color-white text-weight-light">${text}</p>
      </div>
    </div>
  </div>
</div>`;
}

function replaceBetween(
  bodyHtml: string,
  startPattern: RegExp,
  endPattern: RegExp,
  replacement: string
): string {
  const startMatch = bodyHtml.match(startPattern);
  if (!startMatch || startMatch.index == null) return bodyHtml;

  const startIdx = startMatch.index + startMatch[0].length;
  const rest = bodyHtml.slice(startIdx);
  const endMatch = rest.match(endPattern);
  if (!endMatch || endMatch.index == null) return bodyHtml;

  const endIdx = startIdx + endMatch.index;
  return bodyHtml.slice(0, startIdx) + replacement + bodyHtml.slice(endIdx);
}

export function injectAlumniSpotlightSlider(bodyHtml: string, alumni: CmsAlumniSpotlight[]): string {
  if (!alumni.length) return bodyHtml;

  let html = replaceListItems(
    bodyHtml,
    "grid-testimonials-homebtm w-dyn-items",
    alumni.map(alumniListItemHtml).join("\n")
  );

  html = replaceBetween(
    html,
    /<div class="slider-mask w-slider-mask">/,
    /<\/div>\s*<div class="testimonial15_arrow is-left testimonial w-slider-arrow-left">/,
    `\n${alumni.map(alumniSlideHtml).join("\n")}\n`
  );

  return html;
}

export function injectHomeFeaturedAlumni(bodyHtml: string, alumni: CmsAlumniSpotlight[]): string {
  if (!alumni.length) return bodyHtml;

  return replaceBetween(
    bodyHtml,
    /<div class="testimonial15_mask w-slider-mask">/,
    /<\/div>\s*<div class="testimonial15_arrow is-left w-slider-arrow-left">/,
    `\n${alumni.map(alumniHomeSlideHtml).join("\n")}\n`
  );
}

function teamItemHtml(member: CmsTeamMember): string {
  const photo = escapeHtml(member.photo || PLACEHOLDER_TEAM);
  const name = escapeHtml(member.name);
  const role = escapeHtml(member.role || "");
  const linkedin = member.linkedin ? escapeHtml(member.linkedin) : "#";
  const linkedinAttrs = member.linkedin ? ' target="_blank" rel="noopener noreferrer"' : "";

  return `<div role="listitem" class="team-item w-dyn-item">
  <div class="team2_item">
    <div class="margin-bottom margin-small">
      <div class="team2_image-wrapper"><img alt="${name}" loading="lazy" src="${photo}" class="team2_image"></div>
    </div>
    <div class="margin-bottom margin-xsmall">
      <div class="team2_title-wrapper">
        <div class="linkedin-wrao">
          <a href="${linkedin}" class="w-inline-block"${linkedinAttrs}>
            <div class="icon-1x1-small w-embed"><svg height="currentHeight" viewbox="0 0 176 176" width="currentWidth" xmlns="http://www.w3.org/2000/svg" id="fi_3536505"><g id="Layer_2" data-name="Layer 2"><g id="linkedin"><rect id="background" fill="#0077b5" height="176" rx="24" width="176"></rect><g id="icon" fill="#fff"><path d="m63.4 48a15 15 0 1 1 -15-15 15 15 0 0 1 15 15z"></path><path d="m60 73v66.27a3.71 3.71 0 0 1 -3.71 3.73h-15.81a3.71 3.71 0 0 1 -3.72-3.72v-66.28a3.72 3.72 0 0 1 3.72-3.72h15.81a3.72 3.72 0 0 1 3.71 3.72z"></path><path d="m142.64 107.5v32.08a3.41 3.41 0 0 1 -3.42 3.42h-17a3.41 3.41 0 0 1 -3.42-3.42v-31.09c0-4.64 1.36-20.32-12.13-20.32-10.45 0-12.58 10.73-13 15.55v35.86a3.42 3.42 0 0 1 -3.37 3.42h-16.42a3.41 3.41 0 0 1 -3.41-3.42v-66.87a3.41 3.41 0 0 1 3.41-3.42h16.42a3.42 3.42 0 0 1 3.42 3.42v5.78c3.88-5.82 9.63-10.31 21.9-10.31 27.18 0 27.02 25.38 27.02 39.32z"></path></g></g></g></svg></div>
          </a>
          <div class="text-size-xlarge text-weight-semibold tablet">${name}</div>
        </div>
        <div class="text-color-egc">${role}</div>
      </div>
    </div>
  </div>
</div>`;
}

export function injectTeamList(bodyHtml: string, members: CmsTeamMember[]): string {
  return removeDynEmptyStates(
    replaceListItems(
      bodyHtml,
      "team2_list-copy w-dyn-items",
      members.map(teamItemHtml).join("\n")
    )
  );
}
