import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { exampleQuery, playAppIframeSrc } from "../src/play.js";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");

describe("play embed", () => {
  it("forwards ?example= into the play-app iframe", () => {
    expect(exampleQuery("?example=01-bar-basic")).toBe("?example=01-bar-basic");
    expect(playAppIframeSrc("?example=01-bar-basic")).toBe(
      "/play-app/index.html?example=01-bar-basic",
    );
  });

  it("accepts gallery ?id= as example", () => {
    expect(playAppIframeSrc("?id=05-pie-raw.md")).toBe(
      "/play-app/index.html?example=05-pie-raw",
    );
  });

  it("uses bare play-app when no example", () => {
    expect(playAppIframeSrc("")).toBe("/play-app/index.html");
    expect(playAppIframeSrc("?foo=bar")).toBe("/play-app/index.html");
  });

  it("web build embeds playground into public/play-app", () => {
    const pkg = JSON.parse(
      readFileSync(join(webRoot, "package.json"), "utf8"),
    ) as { scripts: Record<string, string> };
    expect(pkg.scripts.build).toContain("build:embed");
  });
});
