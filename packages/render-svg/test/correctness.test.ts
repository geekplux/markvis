import { describe, expect, it } from "vitest";
import { ChartIRSchema } from "@markvis/ir";
import { parseMarkdown } from "@markvis/parser";
import { renderSvg } from "../src/index.js";
import { formatNumber, labelTicks } from "../src/scale.js";
import { textWidth } from "../../types/_paint/text.js";

function chart(body: string) {
  const result = parseMarkdown(`\`\`\`chart\n${body}\n\`\`\``);
  if (!result.ok) {
    throw new Error(result.error.message);
  }
  return ChartIRSchema.parse(result.chart);
}

function svg(body: string, width?: number) {
  const ir = chart(body);
  return width === undefined ? renderSvg(ir) : renderSvg(ir, { width });
}

function ribbonThickness(path: string): { start: number; end: number } {
  const nums = [...path.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
  const y0Top = nums[1] ?? 0;
  const y1Top = nums[7] ?? 0;
  const y1Bot = nums[9] ?? 0;
  const y0Bot = nums[15] ?? 0;
  return { start: Math.abs(y0Bot - y0Top), end: Math.abs(y1Bot - y1Top) };
}

describe("shared formatter", () => {
  it("keeps 0.001, 0.002, and 0.003 distinct and avoids negative zero", () => {
    expect(formatNumber(0.001)).toBe("0.001");
    expect(formatNumber(0.002)).toBe("0.002");
    expect(formatNumber(0.003)).toBe("0.003");
    expect(new Set([formatNumber(0.001), formatNumber(0.002), formatNumber(0.003)]).size).toBe(3);
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(-0)).toBe("0");
    expect(formatNumber(-1.5)).toBe("-1.5");
    expect(formatNumber(1500000)).toBe("1,500,000");
    const labels = labelTicks([0.001, 0.002, 0.003]);
    expect(new Set(labels).size).toBe(3);
    expect(labels).not.toContain("0");
    expect(labels).not.toContain("-0");
  });
});

describe("line gaps and sankey thickness", () => {
  it("does not draw a marker at an interpolated or zero y for a missing line cell", () => {
    const out = svg(`type: line
title: Gap
x: k
y: v

k,v
a,1
b,
c,3
`);
    const circles = [...out.matchAll(/<circle[^>]*cy="([^"]+)"/g)].map((m) => m[1]);
    expect(circles.length).toBe(2);
    const ys = circles.map(Number);
    expect(new Set(ys.map((y) => y.toFixed(2))).size).toBe(2);
  });

  it("gives equal sankey values equal thickness, including an early terminal", () => {
    const out = svg(`type: sankey
title: Equal
x: source
y: value
series: target

source,target,value
A,B,100
A,C,100
B,D,100
`);
    const paths = [...out.matchAll(/<path\b[^>]*>/g)]
      .map((match) => match[0])
      .filter((tag) => tag.includes('data-y="100"'))
      .map((tag) => tag.match(/\bd="([^"]+)"/)?.[1] ?? "");
    expect(paths).toHaveLength(3);
    const bands = paths.map(ribbonThickness);
    const first = bands[0]!.start;
    for (const band of bands) {
      expect(Math.abs(band.start - band.end)).toBeLessThanOrEqual(1);
      expect(Math.abs(band.start - first)).toBeLessThanOrEqual(1);
      expect(band.start).toBeGreaterThan(1);
    }
    expect(out).toContain("A");
    expect(out).toContain("D");
  });

  it("does not inflate a zero link or a very small link", () => {
    const out = svg(`type: sankey
title: Small
x: source
y: value
series: target

source,target,value
A,B,100
A,C,0
A,D,0.001
`);
    expect(out).not.toMatch(/<path\b[^>]*data-y="0"/);
    const thick = [...out.matchAll(/<path\b[^>]*data-y="([^"]+)"[^>]*>/g)];
    const byValue = new Map(
      thick.map((match) => {
        const tag = match[0];
        const d = tag.match(/\bd="([^"]+)"/)?.[1] ?? "";
        const nums = [...d.matchAll(/-?\d+(?:\.\d+)?/g)].map((n) => Number(n[0]));
        return [match[1], Math.abs((nums[15] ?? 0) - (nums[1] ?? 0))] as const;
      }),
    );
    const big = byValue.get("100") ?? 0;
    const small = byValue.get("0.001") ?? 0;
    expect(big).toBeGreaterThan(20);
    expect(small).toBeLessThan(1);
  });
});

describe("intended width and horizontal bars", () => {
  it("reflows a narrow figure without shrinking type below a readable size", () => {
    const narrow = svg(
      `type: bar
title: Quarterly pipeline review for the north region after the partner enablement push
x: quarter
y: deals

quarter,deals
Q1,12
Q2,18
Q3,9
`,
      390,
    );
    const wide = svg(
      `type: bar
title: Quarterly pipeline review for the north region after the partner enablement push
x: quarter
y: deals

quarter,deals
Q1,12
Q2,18
Q3,9
`,
      960,
    );
    expect(narrow).toContain('width="390"');
    expect(narrow).toContain('viewBox="0 0 390');
    expect(wide).toContain('width="960"');
    expect(narrow).not.toBe(wide);
    const tick = narrow.match(/font-size="(\d+)"[^>]*font-weight="400"/);
    const title = narrow.match(/font-size="(\d+)" font-weight="600"/);
    expect(Number(tick?.[1])).toBeGreaterThanOrEqual(12);
    expect(Number(title?.[1])).toBeGreaterThanOrEqual(18);
    const titleText = narrow.match(/<text[^>]*font-weight="600"[^>]*>([\s\S]*?)<\/text>/);
    expect(titleText?.[0]).toContain("<tspan");
    const height = Number(narrow.match(/\bheight="(\d+(?:\.\d+)?)"/)?.[1]);
    const width = 390;
    const visible = (titleText?.[1] ?? "").replace(/<title>[\s\S]*?<\/title>/, "");
    const chunks = [...visible.matchAll(/>([^<]+)</g)].map((m) => m[1] ?? "");
    for (const chunk of chunks) {
      if (chunk.trim() === "") continue;
      expect(textWidth(chunk, Number(title?.[1] ?? 21))).toBeLessThanOrEqual(width);
    }
    expect(height).toBeGreaterThan(40);
    expect(renderSvg(chart(`type: bar
title: Same
x: k
y: v

k,v
a,1
b,2
`), { width: 390 })).toBe(
      renderSvg(chart(`type: bar
title: Same
x: k
y: v

k,v
a,1
b,2
`), { width: 390 }),
    );
  });

  it("draws the horizontal acceptance chart in input order without rotated labels", () => {
    const horizontal = svg(`type: bar
orient: horizontal
title: Synthetic regional program costs
unit: USD
x: program
y: amount

program,amount
"North America enterprise expansion Q3",420000
"APAC partner enablement and training program",185000
"Legacy platform decommission wave 2",95000
`);
    const vertical = svg(`type: bar
title: Synthetic regional program costs
unit: USD
x: program
y: amount

program,amount
"North America enterprise expansion Q3",420000
"APAC partner enablement and training program",185000
"Legacy platform decommission wave 2",95000
`);
    expect(horizontal).toContain('data-orient="horizontal"');
    expect(horizontal).not.toContain("rotate(");
    expect(horizontal).toContain("North America enterprise expansion Q3");
    expect(horizontal).toContain("APAC partner enablement and training program");
    expect(horizontal).toContain("Legacy platform decommission wave 2");
    expect(horizontal).toContain("420,000");
    expect(horizontal).toContain("185,000");
    expect(horizontal).toContain("95,000");
    expect(horizontal).toContain("USD");
    expect(horizontal).toContain('data-baseline="0"');
    const h = Number(horizontal.match(/\bheight="(\d+(?:\.\d+)?)"/)?.[1]);
    const v = Number(vertical.match(/\bheight="(\d+(?:\.\d+)?)"/)?.[1]);
    expect(h).toBeLessThan(v);
    const order = [
      horizontal.indexOf("North America enterprise expansion Q3"),
      horizontal.indexOf("APAC partner enablement and training program"),
      horizontal.indexOf("Legacy platform decommission wave 2"),
    ];
    expect(order[0]).toBeLessThan(order[1]!);
    expect(order[1]).toBeLessThan(order[2]!);
  });

  it("keeps a narrow horizontal title above the first bar, unit included", () => {
    const out = svg(
      `type: bar
orient: horizontal
title: Synthetic regional program costs
unit: USD
x: program
y: amount

program,amount
"North America enterprise expansion Q3",420000
"APAC partner enablement and training program",185000
"Legacy platform decommission wave 2",95000
`,
      390,
    );
    const title = out.match(/<text\b[^>]*font-weight="600"[\s\S]*?<\/text>/)?.[0] ?? "";
    const x = Number(title.match(/\bx="([^"]+)"/)?.[1]);
    let baseline = Number(title.match(/\by="([^"]+)"/)?.[1]);
    const inner = title.replace(/<title>[\s\S]*?<\/title>/, "");
    let lastLine = "";
    let unit = "";
    const parts = [...inner.matchAll(/<tspan\b([^>]*)>([^<]*)<\/tspan>/g)];
    if (parts.length === 0) {
      lastLine = inner.replace(/<[^>]+>/g, "");
    }
    for (const part of parts) {
      const attrs = part[1] ?? "";
      const text = part[2] ?? "";
      if (text.trim().startsWith("·")) {
        unit = text;
        continue;
      }
      const dy = attrs.match(/\bdy="([^"]+)"/);
      if (dy) {
        baseline += Number(dy[1]);
      }
      lastLine = text;
    }
    const barY = Number(
      [...out.matchAll(/<rect\b[^>]*\by="([^"]+)"[^>]*\bdata-y=/g)][0]?.[1],
    );
    const lineCount = parts.filter((part) => {
      const attrs = part[1] ?? "";
      const text = part[2] ?? "";
      return !text.trim().startsWith("·") && (attrs.includes("x=") || attrs.includes("dy="));
    }).length;
    const labelY = Number(
      out.match(/<text\b[^>]*\by="([^"]+)"[^>]*data-full-label="North America/)?.[1],
    );
    expect(unit).toContain("USD");
    expect(lineCount).toBe(2);
    expect(x).toBeLessThan(80);
    expect(barY).toBeGreaterThan(baseline);
    expect(labelY).toBeGreaterThan(baseline);
    expect(textWidth(lastLine, 21) + textWidth(unit, 13)).toBeLessThanOrEqual(390 - x + 0.5);
  });
});

describe("value labels stay out of the title", () => {
  it("keeps the tallest small-fraction label below the title", () => {
    const out = svg(`type: bar
title: Synthetic small fractions
x: sample
y: value

sample,value
a,0.001
b,0.002
c,0.003
`);
    const title = out.match(/<text\b[^>]*font-weight="600"[^>]*>/)?.[0] ?? "";
    const titleY = Number(title.match(/\by="([^"]+)"/)?.[1]);
    const label = out.match(/<text\b[^>]*data-value-label="c"[^>]*>/)?.[0] ?? "";
    const labelY = Number(label.match(/\by="([^"]+)"/)?.[1]);
    expect(out).toContain(">0.003</text>");
    expect(labelY).toBeGreaterThan(titleY + 8);
  });
});

describe("funnel labels and sankey names", () => {
  it("draws a centered funnel and keeps stage labels off the fill", () => {
    const out = svg(`type: funnel
title: Signup
x: stage
y: people

stage,people
Visit,1200
Signup,480
Verify,310
`);
    expect(out).toContain('data-funnel="1"');
    expect(out).not.toContain("64.5833");
    const band = out.match(/<path\b[^>]*data-stage="Signup"[^>]*>/)?.[0] ?? "";
    const d = band.match(/\bd="([^"]+)"/)?.[1] ?? "";
    const nums = [...d.matchAll(/-?\d+(?:\.\d+)?/g)].map((n) => Number(n[0]));
    const topLeft = nums[0] ?? 0;
    const topRight = nums[2] ?? 0;
    const botRight = nums[4] ?? 0;
    const botLeft = nums[6] ?? 0;
    const topMid = (topLeft + topRight) / 2;
    const botMid = (botLeft + botRight) / 2;
    expect(topRight - topLeft).toBeGreaterThan(botRight - botLeft);
    expect(Math.abs(topMid - botMid)).toBeLessThan(1);
    const label = out.match(/<text\b[^>]*data-label="Signup"[^>]*>[\s\S]*?<\/text>/)?.[0] ?? "";
    expect(label).toContain("Signup · 480");
    expect(label).not.toContain("#fafaf9");
    const visit =
      out.match(/<text\b[^>]*data-label="Visit"[^>]*>[\s\S]*?<\/text>/)?.[0] ?? "";
    const visitVisible = visit
      .replace(/<title>[\s\S]*?<\/title>/, "")
      .replace(/<[^>]+>/g, "");
    expect(visitVisible).toBe("Visit · 1,200");
    const textX = Number(label.match(/\bx="([^"]+)"/)?.[1]);
    expect(textX).toBeGreaterThan(Math.max(topRight, botRight) - 0.5);
  });

  it("keeps a long sankey name in a title and sizes the visible label to the outer margin", () => {
    const name = "North America enterprise expansion Q3";
    const out = svg(
      `type: sankey
title: Flows
x: source
y: value
series: target

source,target,value
"${name}",Sink,100
`,
      390,
    );
    const node = out.match(/<rect\b[^>]*data-node="North America enterprise expansion Q3"[^>]*>/)?.[0] ?? "";
    const nodeX = Number(node.match(/\bx="([^"]+)"/)?.[1]);
    const label =
      out.match(
        /<text\b[^>]*data-node-label="North America enterprise expansion Q3"[^>]*>[\s\S]*?<\/text>/,
      )?.[0] ?? "";
    expect(label).toContain(`<title>${name}</title>`);
    const visible = label.replace(/<title>[\s\S]*?<\/title>/, "").replace(/<[^>]+>/g, "");
    expect(visible.length).toBeGreaterThan("Nort…".length);
    expect(textWidth(visible, 12)).toBeGreaterThan(40);
    expect(textWidth(visible, 12)).toBeLessThanOrEqual(nodeX - 4 - 8 + 0.5);
  });
});

describe("type rules", () => {
  it("draws a heatmap scale and does not paint a missing cell like zero", () => {
    const out = svg(`type: heatmap
title: Grid
x: col
y: v
series: row

col,row,v
A,r,0
B,r,5
C,r,
`);
    expect(out).toContain('data-color-scale="1"');
    expect(out).toContain('data-scale-min="1"');
    expect(out).toContain('data-missing="1"');
    const missing = out.match(/<rect[^>]*data-missing="1"[^>]*>/)?.[0] ?? "";
    const zero = out.match(/<rect[^>]*data-y="0"[^>]*>/)?.[0] ?? "";
    expect(missing).toContain("url(#");
    expect(zero).not.toContain("url(#");
    expect(missing).not.toBe(zero);
  });

  it("states a gauge range instead of filling the arc to the current value", () => {
    const out = svg(`type: gauge
title: Level
x: name
y: value
unit: pct

name,value
A,40
`);
    expect(out).toContain(">40 pct<");
    expect(out).toContain(">0<");
    expect(out).toContain(">100<");
    expect(out).not.toContain('data-max="40"');
  });
});

function decodeXml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

/** Horizontal ink of each <text>, using the element's font size or the nearest group size. */
function textOverflows(svgText: string): string[] {
  const width = Number(svgText.match(/<svg\b[^>]*\bwidth="([\d.]+)"/)?.[1]);
  const problems: string[] = [];
  for (const match of svgText.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)) {
    const attr = match[1] ?? "";
    if (attr.includes("rotate(")) {
      continue;
    }
    const own = attr.match(/\bfont-size="([^"]+)"/);
    const before = svgText.slice(0, match.index ?? 0);
    const groups = [...before.matchAll(/<g\b[^>]*\bfont-size="([^"]+)"/g)];
    const size = Number(own?.[1] ?? groups[groups.length - 1]?.[1] ?? 12);
    const anchor = attr.match(/\btext-anchor="([^"]+)"/)?.[1] ?? "start";
    const x = Number(attr.match(/\bx="([^"]+)"/)?.[1]);
    const body = (match[2] ?? "").replace(/<title>[\s\S]*?<\/title>/g, "");
    const spans = [...body.matchAll(/<tspan\b[^>]*>([\s\S]*?)<\/tspan>/g)].map(
      (part) => part[1] ?? "",
    );
    const chunks = spans.length > 0 ? spans : [body.replace(/<[^>]+>/g, "")];
    for (const chunk of chunks) {
      const label = decodeXml(chunk);
      if (label.trim() === "") {
        continue;
      }
      const w = textWidth(label, size);
      const left = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
      const right = anchor === "middle" ? x + w / 2 : anchor === "end" ? x : x + w;
      if (left < -0.5 || right > width + 0.5) {
        problems.push(`${label} [${left.toFixed(1)}, ${right.toFixed(1)}] width ${width}`);
      }
    }
  }
  return problems;
}

describe("labels stay inside the frame", () => {
  it("keeps a narrow pie title and its slice labels inside the SVG", () => {
    const out = svg(
      `type: pie
title: Billing leads support tickets at 40
x: topic
y: tickets

topic,tickets
"Billing and invoice disputes",40
"Account access and MFA reset",25
"Product how-to questions",20
"Other miscellaneous",15
`,
      390,
    );
    expect(textOverflows(out)).toEqual([]);
    const title = out.match(/<text\b[^>]*font-weight="600"[^>]*>/)?.[0] ?? "";
    const titleX = Number(title.match(/\bx="([^"]+)"/)?.[1]);
    expect(titleX).toBeGreaterThanOrEqual(0);
    expect(titleX).toBeLessThan(390);
    expect(out).toContain("Billing and invoice disputes");
  });

  it("keeps a large scatter end tick inside the SVG", () => {
    const out = svg(`type: scatter
title: Big
x: pop
y: gdp

pop,gdp
1000000,1
8500000,2
`);
    expect(textOverflows(out)).toEqual([]);
    expect(out).toContain(">10,000,000<");
  });

  it("keeps a wide heatmap scale label inside the SVG", () => {
    const out = svg(`type: heatmap
title: Big scale
x: col
y: v
series: row

col,row,v
A,r,0
B,r,1500000
`);
    expect(textOverflows(out)).toEqual([]);
    expect(out).toContain(">1,500,000</text>");
  });

  it("keeps waterfall delta labels inside a narrow frame", () => {
    const out = svg(
      `type: waterfall
title: Cash
x: step
y: delta

step,delta
A,4200
B,6100
C,900
D,450
E,-3800
F,-2200
G,-2400
H,-380
`,
      390,
    );
    expect(textOverflows(out)).toEqual([]);
    const utilities = out.match(/<text\b[^>]*data-delta="H"[^>]*>[\s\S]*?<\/text>/)?.[0] ?? "";
    const visible = utilities
      .replace(/<title>[\s\S]*?<\/title>/, "")
      .replace(/<[^>]+>/g, "");
    expect(visible).toContain("380");
    expect(visible).toContain("2,870");
  });
});
