import type { ReactNode } from "react";
import type { CmsJob } from "@/lib/cms/types";

const PLACEHOLDER = "/images/egc-careers-cover.png";

function formatDate(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

type CareerDetailViewProps = {
  job: CmsJob;
  body?: ReactNode;
};

export default function CareerDetailView({ job, body }: CareerDetailViewProps) {
  const title = job.jobTitle || job.name;
  const applyHref = job.applicationLink || "mailto:careers@egcnyc.org";
  const applyExternal = /^https?:\/\//.test(applyHref);
  const image = job.coverImage || PLACEHOLDER;
  const meta = [
    { label: "Location", value: job.location },
    { label: "Job Type", value: job.type },
    { label: "Deadline", value: formatDate(job.applicationDeadline) },
    { label: "Start Date", value: formatDate(job.startDate) },
    { label: "End Date", value: formatDate(job.endDate) },
  ].filter((item) => item.value);

  return (
    <section className="section_content14">
      <div className="padding-global">
        <div className="container-large">
          <div className="padding-section-large">
            <div className="content14_component">
              <div className="margin-bottom margin-xxlarge">
                <div className="content14_image-wrapper">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt={title} loading="lazy" src={image} className="content14_image" />
                </div>
                {meta.length ? (
                  <div className="w-layout-grid content14_metatag-list">
                    {meta.map((item) => (
                      <div key={item.label} className="content14_metatag-item">
                        <h3 className="heading-style-h6 text-color-blue">{item.label}</h3>
                        <div>{item.value}</div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="max-width-large align-center">
                <h1 className="heading-style-h3">{title}</h1>
                {body ? (
                  <div className="text-rich-text w-richtext">{body}</div>
                ) : job.excerpt ? (
                  <div className="text-rich-text w-richtext">
                    <p>{job.excerpt}</p>
                  </div>
                ) : null}
                <div className="margin-top margin-small">
                  <a
                    href={applyHref}
                    className="button w-button"
                    {...(applyExternal
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    Click here to apply
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
