/**
 * In a theme with rounded bars, a stacked or percent bar reads as one bar:
 * only its outermost segment is capped, the segments under it are plain
 * rectangles, and the cap sits on the last series that has a value in that
 * category (a missing or zero last series does not leave the stack flat).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { render } from "../../../src/index.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
/** The fenced block of an example file, without the intent comment above it. */
const example = (name: string) => {
  const text = readFileSync(join(root, "examples/valid", name), "utf8");
  return /```(?:chart|markvis|vis)[\s\S]*?```/.exec(text)![0];
};

type Segment = { x: string; series: string; y: number; curved: boolean };

function segments(svg: string): Segment[] {
  const out: Segment[] = [];
  for (const m of svg.matchAll(/<path ([^>]*data-layout="(?:stacked|percent)"[^>]*)\/>/g)) {
    const a = m[1]!;
    const d = /(?:^|\s)d="([^"]*)"/.exec(a)?.[1] ?? "";
    out.push({
      x: /data-x="([^"]*)"/.exec(a)?.[1] ?? "",
      series: /data-series="([^"]*)"/.exec(a)?.[1] ?? "",
      y: Number(/data-y="([^"]*)"/.exec(a)?.[1]),
      curved: d.includes("Q"),
    });
  }
  return out;
}

const energy = `\`\`\`chart
type: bar
layout: stacked
theme: graphite
title: US energy, 2023
unit: quads
x: source
y: quads
series: sector

source,sector,quads
Petroleum,Transport,24.9
Petroleum,Industry,8.6
Petroleum,Buildings,1.8
Natural gas,Electricity,13.3
Natural gas,Industry,10.9
Natural gas,Buildings,8.1
Coal,Electricity,7.2
Nuclear,Electricity,8.1
Renewables,Electricity,3.2
Renewables,Industry,2.4
\`\`\``;

describe("stacked bar caps", () => {
  it("caps only the top segment of each stack, on the last series with a value", () => {
    const r = render(energy, { width: 640 });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const segs = segments(r.svg);
    expect(segs).toHaveLength(10);
    const byX = new Map<string, Segment[]>();
    for (const s of segs) byX.set(s.x, [...(byX.get(s.x) ?? []), s]);
    expect([...byX.keys()]).toEqual(["Petroleum", "Natural gas", "Coal", "Nuclear", "Renewables"]);
    for (const [, stack] of byX) {
      const top = stack[stack.length - 1]!;
      expect(top.curved, `${top.x} top (${top.series}) is capped`).toBe(true);
      for (const s of stack.slice(0, -1)) {
        expect(s.curved, `${s.x} ${s.series} under the top is a plain rectangle`).toBe(false);
      }
    }
    // Petroleum has no row for the last series (Electricity): the cap is on Buildings.
    expect(byX.get("Petroleum")!.at(-1)!.series).toBe("Buildings");
  });

  it("holds for the stacked and percent examples in every theme with rounded bars", () => {
    for (const name of ["53-bar-stacked.md", "54-bar-percent.md"]) {
      for (const theme of ["graphite", "shadcn", "folio", "ant"]) {
        const text = example(name).replace(/^(type: bar)$/m, `$1\ntheme: ${theme}`);
        const r = render(text, { width: 640 });
        expect(r.ok, `${name} ${theme}`).toBe(true);
        if (!r.ok) continue;
        const stacks = new Map<string, Segment[]>();
        for (const s of segments(r.svg)) stacks.set(s.x, [...(stacks.get(s.x) ?? []), s]);
        expect(stacks.size).toBeGreaterThan(0);
        for (const [, stack] of stacks) {
          const curved = stack.filter((s) => s.curved);
          expect(curved, `${name} ${theme}: one cap per stack`).toHaveLength(1);
          expect(curved[0], `${name} ${theme}: the cap is the top segment`).toBe(stack[stack.length - 1]);
        }
      }
    }
  });

  it("moves the cap down when the last series is zero or too thin to draw", () => {
    const block = (last: string) => `\`\`\`chart
type: bar
layout: stacked
theme: graphite
x: k
y: v
series: s

k,s,v
A,p,1000
A,q,${last}
B,p,10
B,q,5
\`\`\``;
    for (const last of ["0", "0.001"]) {
      const r = render(block(last), { width: 640 });
      expect(r.ok, last).toBe(true);
      if (!r.ok) continue;
      const a = segments(r.svg).filter((s) => s.x === "A");
      expect(a.map((s) => [s.series, s.curved]), `A with q=${last}: the cap is on p`).toEqual([["p", true], ["q", false]]);
      const b = segments(r.svg).filter((s) => s.x === "B");
      expect(b.map((s) => [s.series, s.curved]), "B: the cap is on q").toEqual([["p", false], ["q", true]]);
    }
  });

  it("a theme with square bars draws no curve; grouped bars in a rounded theme cap every bar", () => {
    const stacked = render(example("53-bar-stacked.md").replace(/^(type: bar)$/m, "$1\ntheme: docs"), { width: 640 });
    expect(stacked.ok).toBe(true);
    if (stacked.ok) expect(segments(stacked.svg).some((s) => s.curved)).toBe(false);
    const grouped = render(
      example("53-bar-stacked.md").replace(/^layout: stacked\n/m, "").replace(/^(type: bar)$/m, "$1\ntheme: graphite"),
      { width: 640 },
    );
    expect(grouped.ok).toBe(true);
    if (!grouped.ok) return;
    const bars = [...grouped.svg.matchAll(/<path d="([^"]*)"[^>]*data-series="[^"]*"[^>]*data-y="([^"]*)"/g)];
    expect(bars.length).toBeGreaterThan(0);
    for (const m of bars) if (Number(m[2]) !== 0) expect(m[1], m[2]).toContain("Q");
  });
});
