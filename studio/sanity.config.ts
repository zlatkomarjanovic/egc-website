import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || "nn9xx2r4";
const dataset = process.env.SANITY_STUDIO_DATASET || "production";
const apiVersion = process.env.SANITY_STUDIO_API_VERSION || "2026-05-15";

export default defineConfig({
  name: "egc",
  title: "EGC Content",
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    structureTool(),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
