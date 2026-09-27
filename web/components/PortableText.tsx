import {
  PortableText as BasePortableText,
  type PortableTextComponents,
  type PortableTextBlock,
} from "@portabletext/react";
import { urlForImage } from "@/sanity/lib/image";

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      const url = urlForImage(value);
      if (!url) return null;
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={url} alt={value?.alt || ""} loading="lazy" className="rich-text_image" />;
    },
  },
  block: {
    h1: ({ children }) => <h2 className="heading-style-h2">{children}</h2>,
    h2: ({ children }) => <h2 className="heading-style-h2">{children}</h2>,
    h3: ({ children }) => <h3 className="heading-style-h3">{children}</h3>,
    h4: ({ children }) => <h4 className="heading-style-h4">{children}</h4>,
  },
  marks: {
    link: ({ children, value }) => {
      const href = value?.href || "#";
      const external = /^https?:\/\//.test(href);
      return (
        <a
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    },
  },
};

export default function PortableText({
  value,
}: {
  value: PortableTextBlock | PortableTextBlock[] | null | undefined;
}) {
  if (!value) return null;
  return <BasePortableText value={value} components={components} />;
}
