import { describe, expect, it } from "vitest";
import {
  exampleIdFromSearch,
  galleryHref,
  paletteFromSearch,
  pickSearch,
  playgroundSearch,
  stemFromId,
  surfaceFromSearch,
  themeFromSearch,
} from "../src/links.js";

describe("playground links", () => {
  it("stems filenames", () => {
    expect(stemFromId("01-bar-basic.md")).toBe("01-bar-basic");
    expect(stemFromId("01-bar-basic")).toBe("01-bar-basic");
  });

  it("reads ?example= from gallery Open in playground", () => {
    expect(exampleIdFromSearch("?example=01-bar-basic")).toBe("01-bar-basic");
    expect(exampleIdFromSearch("example=05-pie-raw.md")).toBe("05-pie-raw");
  });

  it("also accepts ?id=", () => {
    expect(exampleIdFromSearch("?id=02-line-multi")).toBe("02-line-multi");
  });

  it("reads ?theme=", () => {
    expect(themeFromSearch("?example=01-bar-basic&theme=highcharts")).toBe(
      "highcharts",
    );
    expect(themeFromSearch("?theme=docs")).toBe("docs");
    expect(themeFromSearch("?theme=neon")).toBeNull();
    expect(themeFromSearch("")).toBeNull();
  });

  it("reads ?palette=", () => {
    expect(paletteFromSearch("?example=01-bar-basic&palette=vivid")).toBe(
      "vivid",
    );
    expect(paletteFromSearch("?palette=neon")).toBeNull();
    expect(paletteFromSearch("")).toBeNull();
  });

  it("returns null when missing", () => {
    expect(exampleIdFromSearch("")).toBeNull();
    expect(exampleIdFromSearch("?foo=bar")).toBeNull();
  });

  it("Open in gallery uses examples id query", () => {
    expect(galleryHref("01-bar-basic.md")).toBe("/examples?id=01-bar-basic");
    expect(galleryHref("01-bar-basic")).toBe("/examples?id=01-bar-basic");
    expect(galleryHref("01-bar-basic", "shadcn")).toBe(
      "/examples?id=01-bar-basic&theme=shadcn",
    );
    expect(galleryHref("01-bar-basic", "folio", "cool")).toBe(
      "/examples?id=01-bar-basic&palette=cool",
    );
  });

  it("writes playground search for the switcher", () => {
    expect(playgroundSearch("01-bar-basic.md")).toBe("?example=01-bar-basic");
    expect(playgroundSearch("01-bar-basic", "docs")).toBe(
      "?example=01-bar-basic&theme=docs",
    );
    expect(playgroundSearch("01-bar-basic", "folio", "ink")).toBe(
      "?example=01-bar-basic&theme=folio&palette=ink",
    );
  });

  it("round-trips a non-default surface through the URL", () => {
    expect(playgroundSearch("01-bar-basic", "ant", null, "dark")).toBe(
      "?example=01-bar-basic&theme=ant&surface=dark",
    );
    expect(playgroundSearch("01-bar-basic", "ant", null, "light")).toBe(
      "?example=01-bar-basic&theme=ant",
    );
    expect(surfaceFromSearch("?surface=dark")).toBe("dark");
    expect(surfaceFromSearch("?surface=light")).toBeNull();
    expect(surfaceFromSearch("?surface=neon")).toBeNull();
  });
});

describe("pickSearch", () => {
  it("uses its own query when it names a surface only", () => {
    expect(pickSearch("?surface=dark", "?example=01-bar-basic")).toBe("?surface=dark");
  });

  it("falls back to the parent page when its own query is empty", () => {
    expect(pickSearch("", "?example=02-line-multi&surface=export")).toBe(
      "?example=02-line-multi&surface=export",
    );
    expect(pickSearch("", null)).toBe("");
  });
});
