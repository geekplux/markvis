import { catalogFromMaps, mapsFromGlobs, type GalleryItem } from "./catalog.js";

const markdownModules = import.meta.glob("../../../examples/valid/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const svgModules = import.meta.glob("../../../examples/out/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const maps = mapsFromGlobs(markdownModules, svgModules);

export const GALLERY_ITEMS: GalleryItem[] = catalogFromMaps(
  maps.markdownByStem,
  maps.svgByStem,
);
