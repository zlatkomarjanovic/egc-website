import Link from "next/link";
import CmsImage from "@/components/CmsImage";
import type { CmsAlumniSpotlight } from "@/lib/cms/types";
import { alumniPath } from "@/lib/seo";

const PLACEHOLDER = "/images/1697797846790.jpeg";

const CHEVRON = (
  <div className="icon-wrapper-2">
    <div className="icon-embed-xsmall w-embed">
      <svg width="100%" height="100%" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16.5303 20.8839C16.2374 21.1768 15.7626 21.1768 15.4697 20.8839L7.82318 13.2374C7.53029 12.9445 7.53029 12.4697 7.82318 12.1768L8.17674 11.8232C8.46963 11.5303 8.9445 11.5303 9.2374 11.8232L16 18.5858L22.7626 11.8232C23.0555 11.5303 23.5303 11.5303 23.8232 11.8232L24.1768 12.1768C24.4697 12.4697 24.4697 12.9445 24.1768 13.2374L16.5303 20.8839Z"
          fill="currentColor"
        />
      </svg>
    </div>
  </div>
);

function displayName(alumni: CmsAlumniSpotlight): string {
  return alumni.alumniName || alumni.name;
}

type AlumniSpotlightViewProps = {
  alumni: CmsAlumniSpotlight;
  related: CmsAlumniSpotlight[];
};

export default function AlumniSpotlightView({
  alumni,
  related,
}: AlumniSpotlightViewProps) {
  const name = displayName(alumni);
  const image = alumni.profilePicture || PLACEHOLDER;
  const alt =
    alumni.profilePictureAlt ||
    [name, alumni.ventureName ? `founder of ${alumni.ventureName}` : "", "EGC alum"]
      .filter(Boolean)
      .join(", ");
  const questions = [
    { q: "Why did you start this venture?", a: alumni.whyStarted },
    { q: "Have you successfully fundraised?", a: alumni.fundraised },
    { q: "What trends are impacting your business?", a: alumni.trends },
    { q: "What has been the biggest growth related challenge?", a: alumni.biggestChallenge },
    { q: "What advice would you give to first time founders?", a: alumni.adviceFirstTime },
    { q: "What drives your forward when facing challenges?", a: alumni.whatDrives },
  ];
  const unanswered = "This fellow has not published an answer yet.";

  return (
    <>
      <section className="section_layout236 overflow-hidden">
        <div className="padding-global">
          <div className="container-large">
            <div className="padding-section-large mobile-top-10">
              <div className="margin-bottom">
                <div className="text-align-center">
                  <div className="max-width-xlarge align-center">
                    <div className="margin-bottom margin-medium">
                      <div className="meet_fellow">
                        <h1 className="heading-style-h2">
                          {name}
                          {alumni.ventureName ? (
                            <span className="text-highlight"> · {alumni.ventureName}</span>
                          ) : null}
                        </h1>
                      </div>
                    </div>
                    <div className="w-layout-grid fellow-grid">
                      <div className="fellow-img">
                        <CmsImage src={image} alt={alt} width={640} height={800} />
                      </div>
                      <div className="fellow-accordions">
                        {questions.map((item) => (
                          <div
                            key={item.q}
                            data-w-id="d59a610c-b480-b02f-afc3-af955eb12070"
                            className="faq-v2"
                          >
                            <div className="question-v2">
                              <h2 className="heading-style-h5 text-weight-semibold faq">
                                {item.q}
                              </h2>
                              {CHEVRON}
                            </div>
                            <div className="answer-v2">
                              <div className="margin-bottom _1rem">
                                <p className="text-weight-light">
                                  {item.a?.trim() ? item.a : unanswered}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {related.length ? (
        <section className="section_layout236 overflow-hidden">
          <div className="padding-global">
            <div className="container-large">
              <div className="padding-section-large mobile-top-10">
                <div className="margin-bottom margin-small">
                  <div className="text-align-center">
                    <div className="max-width-xlarge align-center">
                      <h2 className="heading-style-h2">Meet the Founders Shaping Tomorrow</h2>
                    </div>
                  </div>
                </div>
                <div className="margin-bottom margin-medium">
                  <div className="text-align-center">
                    <div className="max-width-xlarge align-center">
                      <p className="text-size-medium opacity-70">
                        Stories of young changemakers building ventures across the globe with EGC.
                        <br />
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  data-delay="1000"
                  data-animation="slide"
                  className="slider-primary w-slider"
                  data-autoplay="true"
                  data-easing="ease"
                  data-hide-arrows="false"
                  data-disable-swipe="false"
                  data-autoplay-limit="0"
                  data-nav-spacing="3"
                  data-duration="500"
                  data-infinite="true"
                >
                  <div className="slider-mask w-slider-mask">
                    {related.map((item) => {
                      const itemName = displayName(item);
                      return (
                        <div key={item.slug} className="slider-item w-slide">
                          <Link
                            href={alumniPath(item.slug)}
                            className="video-item w-inline-block"
                          >
                            <div className="layout179_image-wrapper">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                alt={
                                  item.profilePictureAlt ||
                                  [itemName, item.ventureName ? `founder of ${item.ventureName}` : "", "EGC alum"]
                                    .filter(Boolean)
                                    .join(", ")
                                }
                                loading="lazy"
                                src={item.profilePicture || PLACEHOLDER}
                                className="img-100"
                              />
                            </div>
                            <div className="margin-bottom margin-xsmall">
                              <div className="margin-bottom margin-small">
                                <h3 className="heading-style-h4 text-weight-medium">{itemName}</h3>
                                <p className="text-color-egc">{item.ventureName}</p>
                              </div>
                              <div className="margin-bottom margin-small">
                                <p className="text-color-egc">
                                  {item.oneLiner || item.whyStarted}
                                </p>
                              </div>
                              <div className="team-link">
                                <div>View Story</div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                  <div className="testimonial15_arrow is-left testimonial w-slider-arrow-left">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/arrow-left.svg"
                      loading="lazy"
                      alt=""
                      aria-hidden="true"
                      className="testimonial15_arrow-icon"
                    />
                  </div>
                  <div className="testimonial15_arrow testimonial w-slider-arrow-right">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/arrow-left.svg"
                      loading="lazy"
                      alt=""
                      aria-hidden="true"
                      className="testimonial15_arrow-icon right"
                    />
                  </div>
                  <div className="hide w-slider-nav w-round w-num" />
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
