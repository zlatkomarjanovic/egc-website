import Image from "next/image";

type CmsImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
};

export default function CmsImage({
  src,
  alt,
  className,
  priority,
  width = 1200,
  height = 800,
}: CmsImageProps) {
  const localOrSanity = src.startsWith("/") || src.includes("cdn.sanity.io");
  if (!localOrSanity) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={className} loading={priority ? "eager" : "lazy"} />
    );
  }

  return (
    <Image
      src={src}
      alt={alt || "Entrepreneurs for Global Change"}
      className={className}
      width={width}
      height={height}
      sizes="(max-width: 767px) 100vw, 900px"
      priority={priority}
      style={{ width: "100%", height: "auto" }}
    />
  );
}
