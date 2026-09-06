import { describe, expect, it } from "vitest";
import { THEMES } from "@markvis/ir";
import {
  docs,
  folio,
  highcharts,
  resolveThemePack,
  shadcn,
  themeRegistry,
} from "../registry.js";

describe("theme registry", () => {
  it("resolves all four packs", () => {
    expect(resolveThemePack("folio")).toBe(folio);
    expect(resolveThemePack("highcharts")).toBe(highcharts);
    expect(resolveThemePack("shadcn")).toBe(shadcn);
    expect(resolveThemePack("docs")).toBe(docs);
    for (const id of THEMES) {
      expect(themeRegistry[id]).toBe(resolveThemePack(id));
    }
  });

  it("fails loudly when a pack is missing", () => {
    expect(() => resolveThemePack("not-a-theme")).toThrow(
      /E_MISSING_THEME_PACK/,
    );
    expect(() => resolveThemePack("")).toThrow(/E_MISSING_THEME_PACK/);
  });
});
