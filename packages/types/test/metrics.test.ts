/**
 * The layout estimates text width from measured tables. Check them against
 * widths a real browser recorded for real labels, so the estimate can only
 * change on purpose: never narrower than the browser (labels would clip or
 * collide), and not so wide that titles wrap and words cut early.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { faceOf, textWidth } from "../_paint/text.js";

const here = dirname(fileURLToPath(import.meta.url));
const { labels } = JSON.parse(
  readFileSync(join(here, "fixtures/chrome-label-widths.json"), "utf8"),
) as { labels: { text: string; size: number; weight: number; font: string; width: number }[] };

describe("text width estimate against recorded browser widths", () => {
  const ratios = labels.map((l) => ({ l, ratio: l.width / textWidth(l.text, l.size, l.weight, l.font) }));

  it("covers every face the themes use", () => {
    expect(new Set(labels.map((l) => faceOf(l.font)))).toEqual(new Set(["sans", "lucida", "mono"]));
    expect(labels.length).toBeGreaterThan(1000);
  });

  it("is never narrower than the browser", () => {
    const narrow = ratios.filter((r) => r.ratio > 1.0005).map((r) => `${JSON.stringify(r.l.text)} ${r.l.font.slice(0, 20)} ${r.l.weight}: ${r.ratio.toFixed(3)}`);
    expect(narrow).toEqual([]);
  });

  it("stays close: median within 8% of the browser", () => {
    const sorted = ratios.map((r) => r.ratio).sort((a, b) => a - b);
    expect(sorted[sorted.length >> 1]!).toBeGreaterThan(0.92);
  });
});
