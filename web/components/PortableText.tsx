import type { ReactNode } from "react";
import {
  PortableText as BasePortableText,
  type PortableTextComponents,
  type PortableTextBlock,
} from "@portabletext/react";
import { urlForImage } from "@/sanity/lib/image";

function childText(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(childText).join("");
  return "";
}

const baseComponents: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      const url = urlForImage(value);
      if (!url) return null;
      // eslint-disable-next-line @next/next/no-img-element
      return (
        <img
          src={url}
          alt={value?.alt || "EGC article image"}
          loading="lazy"
          className="rich-text_image"
        />
      );
    },
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
  skipHeading,
}: {
  value: PortableTextBlock | PortableTextBlock[] | null | undefined;
  skipHeading?: string;
}) {
  if (!value) return null;
  let skipped = false;
  const skip = skipHeading?.replace(/\s+/g, " ").trim().toLowerCase();
  const heading = (Tag: "h2" | "h3" | "h4", className: string) =>
    function Heading({ children }: { children?: ReactNode }) {
      const text = childText(children).replace(/\s+/g, " ").trim().toLowerCase();
      if (!skipped && skip && text === skip) {
        skipped = true;
        return null;
      }
      return <Tag className={className}>{children}</Tag>;
    };

  const components: PortableTextComponents = {
    ...baseComponents,
    block: {
      h1: heading("h2", "heading-style-h2"),
      h2: heading("h2", "heading-style-h2"),
      h3: heading("h3", "heading-style-h3"),
      h4: heading("h4", "heading-style-h4"),
    },
  };

  return <BasePortableText value={value} components={components} />;
}
