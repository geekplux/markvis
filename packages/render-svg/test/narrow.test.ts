/**
 * Narrow widths (a phone column, a chat bubble): height follows width up to
 * the theme's own height, a title wraps at most once and pushes the plot
 * down, and no label is clipped or lands on another. 720 px, the default,
 * is pinned by the goldens in fixtures.test.ts.
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ChartIRSchema, THEMES, type ChartIR } from "@markvis/ir";
import { parseBlock, parseMarkdown } from "@markvis/parser";
import { renderSvg, themeTokens } from "@markvis/render-svg";
import { labelBox, scanSvg } from "./svg-scan.js";

const here = dirname(fileURLToPath(import.meta.url));
const validDir = join(here, "../../../examples/valid");
const NARROW = [360, 480] as const;

const charts: [string, ChartIR][] = readdirSync(validDir)
  .filter((name) => name.endsWith(".md"))
  .sort()
  .map((file) => {
    const result = parseMarkdown(readFileSync(join(validDir, file), "utf8"), { filename: file });
    if (!result.ok) throw new Error(`${file}: ${result.error.message}`);
    return [file, ChartIRSchema.parse(result.chart)];
  });

function heightOf(svg: string): number {
  return Number(/^<svg [^>]*\sheight="([\d.]+)"/.exec(svg)?.[1]);
}

function block(text: string): ChartIR {
  const result = parseBlock(text);
  if (!result.ok) throw new Error(result.error.message);
  return result.chart;
}

describe("height follows width", () => {
  it.each(THEMES)("%s: shorter when narrower, capped at the theme height when wider", (theme) => {
    const t = themeTokens(theme);
    let shorter = 0;
    for (const [file, base] of charts) {
      const chart = ChartIRSchema.parse({ ...base, theme });
      const at720 = heightOf(renderSvg(chart, { width: 720 }));
      expect(heightOf(renderSvg(chart)), file).toBe(at720);
      expect(heightOf(renderSvg(chart, { width: 1080 })), file).toBe(at720);
      const at360 = heightOf(renderSvg(chart, { width: 360 }));
      // Charts sized by their rows (boxplot, bullet, calendar) follow their rows instead,
      // and a frame still grows when rotated labels need the room.
      if (at720 !== t.SVG_HEIGHT) continue;
      expect(at360, file).toBeGreaterThanOrEqual(200);
      if (at360 < at720) shorter++;
    }
    // Charts whose chrome fits keep the theme's aspect.
    expect(shorter).toBeGreaterThan(charts.length / 2);
  });

  it("keeps the theme aspect for a plain bar at 360", () => {
    const chart = block("type: bar\ntitle: Visits\nx: day\ny: visits\n\nday,visits\nMon,3\nTue,5\nWed,4");
    expect(heightOf(renderSvg(chart, { width: 360 }))).toBe(240);
    expect(heightOf(renderSvg(chart, { width: 720 }))).toBe(480);
  });
});

describe("titles at narrow widths", () => {
  const long =
    "type: bar\ntitle: Midtown box office tickets climbed every month through the winter and peaked in March at nine thousand\nunit: tickets\nx: month\ny: tickets\n\nmonth,tickets\nSep,5200\nOct,6100\nNov,7800\nDec,8500";

  it("wraps at most once, ends the second line with an ellipsis, and keeps the full title", () => {
    for (const theme of THEMES) {
      const svg = renderSvg(ChartIRSchema.parse({ ...block(long), theme }), { width: 360 });
      const title = svg.split("\n").find((line) => line.trimStart().startsWith("<text"))!;
      const lines = title.match(/<tspan x=/g)?.length ?? 1;
      expect(lines, theme).toBeLessThanOrEqual(2);
      expect(title, theme).toContain("…");
      expect(title, theme).toContain("<title>Midtown box office tickets climbed");
    }
  });

  it("wraps at most once at 720 too", () => {
    const svg = renderSvg(block(long.replace(/title: .*/, `title: ${"Midtown box office tickets climbed every month ".repeat(4).trim()}`)));
    const title = svg.split("\n").find((line) => line.trimStart().startsWith("<text"))!;
    expect(title.match(/<tspan x=/g)?.length).toBe(2);
    expect(title).toContain("…");
    expect(title).toContain(`<title>${"Midtown box office tickets climbed every month ".repeat(4).trim()}</title>`);
  });

  it("pushes the plot below the title", () => {
    const one = renderSvg(block(long.replace(/title: .*/, "title: Tickets")), { width: 360 });
    const two = renderSvg(block(long), { width: 360 });
    const firstTick = (svg: string) => scanSvg(svg).labels.find((l) => l.text === "10,000")!;
    expect(firstTick(two).y).toBeGreaterThan(firstTick(one).y);
  });
});

describe("labels at narrow widths", () => {
  it.each(NARROW)("stay inside the frame, and clear of the title, at %i px", (width) => {
    const failures: string[] = [];
    for (const [file, base] of charts) {
      for (const theme of THEMES) {
        const svg = renderSvg(ChartIRSchema.parse({ ...base, theme }), { width });
        const scan = scanSvg(svg);
        const boxes = scan.labels.map((label) => ({ label, box: labelBox(label) }));
        for (const { label, box } of boxes) {
          if (box.left < -1 || box.right > scan.width + 1 || box.top < -1 || box.bottom > scan.height + 1) {
            failures.push(`${theme}/${file}: "${label.text}" clipped`);
          }
        }
        // The title is the first label; the subtitle unit, when there is one, sits under it.
        const title = boxes[0]!;
        for (const { label, box } of boxes.slice(1)) {
          const dx = Math.min(title.box.right, box.right) - Math.max(title.box.left, box.left);
          const dy = Math.min(title.box.bottom, box.bottom) - Math.max(title.box.top, box.top);
          if (dx > 1 && dy > 1) failures.push(`${theme}/${file}: title × "${label.text}"`);
        }
      }
    }
    expect(failures.slice(0, 20), `${failures.length} failures`).toEqual([]);
  });
});

describe("whole-number x on a line or area", () => {
  const weeks = (type: string) =>
    block(`type: ${type}\ntitle: Signups\nx: week\ny: signups\n\nweek,signups\n1,10\n2,14\n3,12\n4,18`);
  const xTicks = (svg: string) => [...svg.matchAll(/data-full-label="([^"]*)"/g)].map((m) => m[1]);

  it.each(["line", "area"])("%s: ticks only the weeks the data has", (type) => {
    for (const width of [360, 720]) {
      expect(xTicks(renderSvg(weeks(type), { width }))).toEqual(["1", "2", "3", "4"]);
    }
  });

  it("never ticks a half step between whole numbers", () => {
    const two = (a: number, b: number) =>
      block(`type: line\ntitle: Two\nx: x\ny: y\n\nx,y\n${a},3\n${b},5`);
    expect(xTicks(renderSvg(two(1, 2)))).toEqual(["1", "2"]);
    expect(xTicks(renderSvg(two(10, 11)))).toEqual(["10", "11"]);
  });

  it("ticks each year when there are 12 or fewer", () => {
    const years = block("type: line\ntitle: Riders\nx: year\ny: riders\n\nyear,riders\n2018,4\n2020,6\n2022,5");
    expect(xTicks(renderSvg(years))).toEqual(["2018", "2020", "2022"]);
  });

  it("keeps whole-number nice ticks inside the data past 12 values", () => {
    const rows = Array.from({ length: 50 }, (_, i) => `${i + 1},${(i * 7) % 13}`).join("\n");
    const ticks = xTicks(renderSvg(block(`type: line\ntitle: Days\nx: day\ny: n\n\nday,n\n${rows}`))).map(Number);
    expect(ticks.length).toBeGreaterThanOrEqual(2);
    for (const n of ticks) {
      expect(Number.isInteger(n)).toBe(true);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(50);
    }
  });

  it("scatter keeps its padded axis", () => {
    const svg = renderSvg(weeks("scatter"));
    const labels = scanSvg(svg).labels.map((l) => l.text);
    expect(labels).toContain("0");
  });
});
