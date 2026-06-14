import type { Metadata, Viewport } from "next";
import { isSanityConfigured } from "@/sanity/env";
import StudioClient from "./Studio";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "EGC Studio",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <main style={{ maxWidth: 640, margin: "10vh auto", padding: "0 24px", fontFamily: "system-ui, sans-serif" }}>
        <h1>Sanity Studio not configured yet</h1>
        <p>
          Create a Sanity project, then set <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> and{" "}
          <code>NEXT_PUBLIC_SANITY_DATASET</code> in your environment (e.g. Vercel
          project settings). The Studio will load here automatically.
        </p>
      </main>
    );
  }
  return <StudioClient />;
}
