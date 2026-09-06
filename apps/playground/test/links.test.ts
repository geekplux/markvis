import { describe, expect, it } from "vitest";
import {
  exampleIdFromSearch,
  galleryHref,
  playgroundSearch,
  stemFromId,
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
  });

  it("writes playground search for the switcher", () => {
    expect(playgroundSearch("01-bar-basic.md")).toBe("?example=01-bar-basic");
    expect(playgroundSearch("01-bar-basic", "docs")).toBe(
      "?example=01-bar-basic&theme=docs",
    );
  });
});
