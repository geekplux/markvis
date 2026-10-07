import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const family = readFileSync(join(here, "../.vitepress/theme/family.css"), "utf8");

/** The body of the first `@media (min-width: 1024px)` block. */
function desktopRules(css: string): string {
  const start = css.indexOf("@media (min-width: 1024px)");
  expect(start, "desktop media block").toBeGreaterThan(-1);
  let depth = 0;
  for (let i = css.indexOf("{", start); i < css.length; i++) {
    if (css[i] === "{") depth += 1;
    if (css[i] === "}") depth -= 1;
    if (depth === 0) return css.slice(start, i + 1);
  }
  throw new Error("unclosed desktop media block");
}

describe("site header on desktop", () => {
  const desktop = desktopRules(family);

  it("centers the links on the header with equal side columns", () => {
    // space-between centers the links between unequal neighbors, not on the page.
    expect(desktop).toMatch(/\.home-nav\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*1fr auto 1fr;/);
    expect(desktop).toMatch(/\.home-wordmark\s*\{[^}]*justify-self:\s*start;/);
    expect(desktop).toMatch(/\.home-nav-right\s*\{[^}]*justify-self:\s*end;/);
  });

  it("keeps the mobile header a wrapping flex row with a menu", () => {
    const mobile = family.slice(family.indexOf("@media (max-width: 1023px)"));
    expect(mobile).toMatch(/\.home-nav\s*\{[^}]*flex-wrap:\s*wrap;/);
    expect(mobile).toMatch(/\.home-nav-menu\s*\{[^}]*display:\s*inline-flex;/);
  });
});
