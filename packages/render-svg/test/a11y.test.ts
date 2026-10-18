/**
 * Contrast of the fixed colors a chart falls back to when the page sets no
 * `--markvis-*` variable (and of everything `bake` writes). Text holds WCAG
 * AA (4.5:1) on its surface paper; series colors hold 3:1 for graphics, or
 * are listed below as exceptions (also listed in docs/themes.md). Light has
 * no plate, so its paper is a white page; dark and export paint their own.
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ChartIRSchema, THEMES, type ChartIR } from "@markvis/ir";
import { parseMarkdown } from "@markvis/parser";
import { renderSvg, themeTokens } from "@markvis/render-svg";
import { paletteRegistry, themeRegistry } from "@markvis/themes";
import { contrast, scanSvg, shapeUnder } from "./svg-scan.js";

const here = dirname(fileURLToPath(import.meta.url));
const validDir = join(here, "../../../examples/valid");
const SURFACES = ["light", "dark", "export"] as const;
type Surface = (typeof SURFACES)[number];

const TEXT_MIN = 4.5;
const GRAPHIC_MIN = 3;

function paperOf(theme: (typeof THEMES)[number], surface: Surface): string {
  const s = themeTokens(theme).SURFACES[surface];
  return s.PLATE === null ? "#ffffff" : s.PAPER;
}

/**
 * Series colors under 3:1 on their surface paper, by 1-based series number.
 * The packs keep the palettes their names promise; a chart still separates
 * these series by position, legend, and labels. Keep in step with
 * docs/themes.md.
 */
const SERIES_EXCEPTIONS: Record<string, number[]> = {
  "folio/light": [2, 3, 5, 6],
  "folio/export": [2, 3, 5, 6],
  "highcharts/light": [1, 3, 4, 7],
  "highcharts/export": [1, 3, 4, 7],
  "shadcn/light": [4, 5],
  "shadcn/dark": [1],
  "shadcn/export": [4, 5],
  "ant/light": [1, 4, 5, 7],
  "ant/export": [1, 4, 5, 7],
  "recharts/light": [2, 3, 4, 6, 7, 8],
  "recharts/export": [2, 3, 4, 6, 7, 8],
  "graphite/light": [5, 6, 7],
  "graphite/dark": [6, 7],
  "graphite/export": [4, 5, 6, 7],
};

/** Fence palettes (`palette:`) on a white page and on the default dark paper. */
const PALETTE_EXCEPTIONS: Record<string, number[]> = {
  "ink/dark": [1, 2, 4, 5, 6, 8],
  "porcelain/light": [2, 4, 6, 8],
  "warm/light": [2, 4, 8],
  "warm/dark": [3, 5],
  "cool/light": [8],
  "cool/dark": [5],
  "vivid/dark": [8],
};

function lowSeries(colors: readonly string[], paper: string): number[] {
  return colors
    .map((hex, i) => [i + 1, contrast(hex, paper)] as const)
    .filter(([, ratio]) => ratio < GRAPHIC_MIN)
    .map(([n]) => n);
}

describe("text fallbacks", () => {
  const cases = THEMES.flatMap((theme) => SURFACES.map((surface) => [theme, surface] as const));

  it.each(cases)("%s/%s: every text ink holds 4.5:1 on its paper", (theme, surface) => {
    const t = themeTokens(theme);
    const s = t.SURFACES[surface];
    const paper = paperOf(theme, surface);
    const inks: Record<string, string> = {
      ink: s.INK ?? t.INK,
      muted: s.QUIET ?? t.QUIET,
      tick: s.TICK ?? s.QUIET ?? t.TYPE.tick.fill,
      title: s.INK ?? t.TYPE.title.fill,
      unit: s.QUIET ?? t.TYPE.unit.fill,
      value: s.INK ?? t.TYPE.value.fill,
      note: s.QUIET ?? t.TYPE.note.fill,
      legend: s.INK ?? t.TYPE.legend.fill,
    };
    const low = Object.entries(inks)
      .map(([role, hex]) => [role, hex, contrast(hex, paper)] as const)
      .filter(([, , ratio]) => ratio < TEXT_MIN)
      .map(([role, hex, ratio]) => `${role} ${hex} on ${paper} = ${ratio.toFixed(2)}`);
    expect(low).toEqual([]);
  });

  const charts: [string, ChartIR][] = readdirSync(validDir)
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((file) => {
      const result = parseMarkdown(readFileSync(join(validDir, file), "utf8"), { filename: file });
      if (!result.ok) throw new Error(`${file}: ${result.error.message}`);
      return [file, ChartIRSchema.parse(result.chart)];
    });

  it("every <text> on the paper of a host-colors chart has a 4.5:1 fallback", () => {
    const failures: string[] = [];
    let onPaper = 0;
    for (const [file, chart] of charts) {
      for (const theme of THEMES) {
        for (const surface of SURFACES) {
          const svg = renderSvg(ChartIRSchema.parse({ ...chart, theme }), { surface, colors: "host" });
          const scan = scanSvg(svg);
          const paper = scan.plate ?? paperOf(theme, surface);
          for (const label of scan.labels) {
            // Labels on a mark pick their own ink for the fill under them (invariants.test.ts).
            if (shapeUnder(scan, label)) continue;
            onPaper++;
            const ratio = contrast(label.fill, paper);
            if (ratio < TEXT_MIN) {
              failures.push(`${theme}/${surface}/${file}: "${label.text}" ${label.fill} on ${paper} = ${ratio.toFixed(2)}`);
            }
          }
        }
      }
    }
    expect(failures.slice(0, 20), `${failures.length} low-contrast labels`).toEqual([]);
    expect(onPaper).toBeGreaterThan(10000);
  });

  it("shows why the variables exist: light ink on a dark page is unreadable", () => {
    // A light-surface chart inlined on a dark page keeps its dark ink unless the
    // page sets --markvis-ink: about 1.03:1 against the default dark paper.
    const ink = themeTokens("folio").INK;
    const darkPage = themeRegistry.folio.SURFACES.dark.PAPER;
    expect(contrast(ink, darkPage)).toBeLessThan(1.1);
    const svg = renderSvg(ChartIRSchema.parse(charts[0]![1]), { colors: "host" });
    expect(svg).toContain(`fill:var(--markvis-ink,${ink})`);
  });
});

describe("series fallbacks", () => {
  it("hold 3:1 on their surface paper, or are listed exceptions", () => {
    const found: Record<string, number[]> = {};
    for (const theme of THEMES) {
      const t = themeTokens(theme);
      for (const surface of SURFACES) {
        const palette = t.SURFACES[surface].PALETTE ?? t.PALETTE;
        const low = lowSeries(palette, paperOf(theme, surface));
        if (low.length > 0) found[`${theme}/${surface}`] = low;
      }
    }
    expect(found).toEqual(SERIES_EXCEPTIONS);
  });

  it("fence palettes hold 3:1 on a white page and on the default dark paper, or are listed", () => {
    const found: Record<string, number[]> = {};
    const papers = { light: "#ffffff", dark: themeRegistry.folio.SURFACES.dark.PAPER };
    for (const [id, palette] of Object.entries(paletteRegistry)) {
      for (const [name, paper] of Object.entries(papers)) {
        const low = lowSeries(palette.SERIES, paper);
        if (low.length > 0) found[`${id}/${name}`] = low;
      }
    }
    expect(found).toEqual(PALETTE_EXCEPTIONS);
  });
});
