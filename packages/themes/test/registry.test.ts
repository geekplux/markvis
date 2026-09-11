import { describe, expect, it } from "vitest";
import { PALETTES, THEMES } from "@markvis/ir";
import {
  ant,
  applyPaletteToTheme,
  docs,
  folio,
  highcharts,
  ink,
  paletteRegistry,
  recharts,
  resolvePalette,
  resolveThemePack,
  shadcn,
  themeRegistry,
  vivid,
} from "../registry.js";

describe("theme registry", () => {
  it("resolves all registered packs", () => {
    expect(resolveThemePack("folio")).toBe(folio);
    expect(resolveThemePack("highcharts")).toBe(highcharts);
    expect(resolveThemePack("shadcn")).toBe(shadcn);
    expect(resolveThemePack("docs")).toBe(docs);
    expect(resolveThemePack("ant")).toBe(ant);
    expect(resolveThemePack("recharts")).toBe(recharts);
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

describe("palette registry", () => {
  it("resolves all locked palettes with designer hex", () => {
    expect(resolvePalette("ink")).toBe(ink);
    expect(resolvePalette("vivid")).toBe(vivid);
    expect(ink.SERIES[0]).toBe("#2A2F2A");
    expect(vivid.SERIES[0]).toBe("#E11D48");
    for (const id of PALETTES) {
      expect(paletteRegistry[id]).toBe(resolvePalette(id));
      expect(paletteRegistry[id].SERIES.length).toBe(8);
    }
  });

  it("fails loudly when a palette is missing", () => {
    expect(() => resolvePalette("neon")).toThrow(/E_MISSING_PALETTE/);
    expect(() => resolvePalette("")).toThrow(/E_MISSING_PALETTE/);
  });

  it("omit palette leaves theme colors alone", () => {
    expect(applyPaletteToTheme(folio, undefined)).toBe(folio);
    expect(applyPaletteToTheme(highcharts, undefined).PALETTE).toEqual(
      highcharts.PALETTE,
    );
  });

  it("palette overlays series only — grammar + ink untouched", () => {
    const next = applyPaletteToTheme(folio, "vivid");
    expect(next.PALETTE[0]).toBe(vivid.SERIES[0]);
    expect(next.INK).toBe(folio.INK);
    expect(next.QUIET).toBe(folio.QUIET);
    expect(next.BAR_RX).toBe(folio.BAR_RX);
    expect(next.MARGIN).toEqual(folio.MARGIN);
    expect(next.AXIS_TITLES).toBe(folio.AXIS_TITLES);
    expect(next.PLOT_BG).toBe(folio.PLOT_BG);
    expect(next.TYPE).toEqual(folio.TYPE);
  });

  it("highcharts + ink keeps HC grammar with ink series", () => {
    const hc = applyPaletteToTheme(highcharts, "ink");
    expect(hc.PALETTE[0]).toBe(ink.SERIES[0]);
    expect(hc.BAR_RX).toBe(highcharts.BAR_RX);
    expect(hc.AXIS_TITLES).toBe(true);
    expect(hc.PLOT_BG).toBe(highcharts.PLOT_BG);
    expect(hc.INK).toBe(highcharts.INK);
  });
});
