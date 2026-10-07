import { describe, expect, it } from "vitest";
import { ChartIRSchema } from "@markvis/ir";
import { parseMarkdown } from "@markvis/parser";
import { renderSvg } from "@markvis/render-svg";

function render(body: string): string {
  const result = parseMarkdown(`\`\`\`chart\n${body}\n\`\`\``);
  if (!result.ok) {
    throw new Error(result.error.message);
  }
  return renderSvg(ChartIRSchema.parse(result.chart));
}

describe("dumbbell", () => {
  const svg = render(`type: dumbbell
title: Faster after the upgrade
x: line
y: minutes
series: period

line,period,minutes
Red,before,41
Red,after,36
Gold,before,30
Gold,after,33
Blue,before,
Blue,after,31`);

  it("draws the first value hollow and the second filled", () => {
    const red = [...svg.matchAll(/<circle\b[^>]*data-x="Red"[^>]*>/g)].map((m) => m[0]);
    expect(red).toHaveLength(2);
    expect(red[0]).toContain('data-series="before"');
    expect(red[0]).toContain('fill="#ffffff"');
    expect(red[1]).toContain('data-series="after"');
    expect(red[1]).not.toContain("stroke=");
  });

  it("prints the signed change from first to second", () => {
    expect(svg).toContain('data-delta="Red">-5</text>');
    expect(svg).toContain('data-delta="Gold">+3</text>');
  });

  it("leaves one dot, no rule, and no change for a missing value", () => {
    expect(svg.match(/<circle\b[^>]*data-x="Blue"/g)).toHaveLength(1);
    expect(svg).not.toMatch(/<line\b[^>]*data-x="Blue"/);
    expect(svg).not.toContain('data-delta="Blue"');
  });

  it("keeps rows in input order", () => {
    const order = [...svg.matchAll(/data-full-label="([^"]+)"/g)].map((m) => m[1]);
    expect(order).toEqual(["Red", "Gold", "Blue"]);
  });
});

describe("bullet", () => {
  const body = (extra = "") => `type: bullet
title: Quota
x: region
y: booked
target: quota
${extra}
region,booked,quota
North,420,400
South,365,
West,288,360`;

  it("marks each target and skips an empty one", () => {
    const svg = render(body());
    expect(svg.match(/data-target=/g)).toHaveLength(2);
    expect(svg).toContain('data-target="400"');
    expect(svg).toContain('data-value-label="North">420<tspan');
    expect(svg).toContain('data-value-label="South">365</text>');
  });

  it("starts the bar at zero on a fitted scale", () => {
    const svg = render(body());
    expect(svg).toContain('data-baseline="0"');
    expect(svg).not.toContain("data-clipped");
  });

  it("clips a value past max to the edge but keeps its number", () => {
    const svg = render(body("max: 400"));
    expect(svg).toMatch(/<path\b[^>]*data-x="North"[^>]*data-y="420"[^>]*data-clipped="1"/);
    expect(svg).toContain('data-value-label="North">420<tspan');
  });

  it("renders the same bytes twice", () => {
    expect(render(body())).toBe(render(body()));
  });
});
