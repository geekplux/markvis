import { describe, expect, it } from "vitest";
import { ChartIRSchema } from "@markvis/ir";
import { parseMarkdown } from "@markvis/parser";
import { renderSvg } from "@markvis/render-svg";
import { labelBox, scanSvg } from "./svg-scan.js";

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

describe("boxplot", () => {
  const svg = render(`type: boxplot
title: Latency
x: service
y: ms

service,ms
Search,12
Search,15
Search,14
Search,13
Search,16
Search,15
Search,14
Search,40
Search,2
Checkout,90
Checkout,92
Checkout,88`);

  it("draws a Tukey box with type-7 quartiles and outliers", () => {
    expect(svg).toMatch(/<rect\b[^>]*data-x="Search"[^>]*data-n="9"[^>]*data-median="14"[^>]*data-q1="13"[^>]*data-q3="15"/);
    const outliers = [...svg.matchAll(/data-x="Search" data-y="([^"]+)" data-outlier="1"/g)].map((m) => m[1]);
    expect(outliers).toEqual(["2", "40"]);
  });

  it("shows points and a median tick, not a box, under five values", () => {
    expect(svg).not.toMatch(/<rect\b[^>]*data-x="Checkout"/);
    expect(svg.match(/data-x="Checkout" data-y="[^"]+" data-point="1"/g)).toHaveLength(3);
    expect(svg).toMatch(/<line\b[^>]*data-x="Checkout"[^>]*data-median="90"[^>]*data-median-tick="1"/);
  });

  it("labels the median and the count", () => {
    expect(svg).toContain('data-value-label="Search">14<tspan');
    expect(svg).toContain(" · n=9</tspan>");
  });
});

describe("calendar", () => {
  const svg = render(`type: calendar
title: Runs
x: date
y: km

date,km
2026-03-08,10
2026-03-01,12
2026-03-04,
2026-03-14,16`);

  it("places days by weekday, Monday first", () => {
    const cell = (date: string) =>
      svg.match(new RegExp(`<rect x="([^"]+)" y="([^"]+)"[^>]*data-date="${date}"`))!;
    // 2026-03-01 is a Sunday (bottom row); 2026-03-02 a Monday, one column right, top row.
    const sunday = cell("2026-03-01");
    const monday = cell("2026-03-02");
    expect(Number(monday[1])).toBeGreaterThan(Number(sunday[1]));
    expect(Number(monday[2])).toBeLessThan(Number(sunday[2]));
  });

  it("keeps absent days faint and empty values hatched, never zero", () => {
    expect(svg).toMatch(/data-date="2026-03-02"/);
    expect(svg).toMatch(/fill-opacity="0.06" data-date="2026-03-02"/);
    expect(svg).toMatch(/fill="url\(#[^)]+-missing\)"[^>]*data-date="2026-03-04"[^>]*data-missing="1"/);
    expect(svg).toMatch(/data-date="2026-03-14" data-y="16"/);
  });

  it("covers only the dated range and keys the color domain", () => {
    expect(svg).not.toContain('data-date="2026-02-28"');
    expect(svg).not.toContain('data-date="2026-03-15"');
    expect(svg).toContain('data-key="low">10<');
    expect(svg).toContain('data-key="high">16<');
  });
});

describe("whatever the parser accepts renders", () => {
  // Adversarial fences: if check says ok, render must not throw or explode.
  const fences = [
    "type: calendar\ntitle: Span\nx: d\ny: n\n\nd,n\n2020-01-01,1\n2024-12-31,2",
    "type: calendar\ntitle: One\nx: d\ny: n\n\nd,n\n2026-02-28,",
    "type: boxplot\ntitle: One\nx: k\ny: v\n\nk,v\na,1",
    "type: boxplot\ntitle: Same\nx: k\ny: v\n\nk,v\na,5\na,5\na,5\na,5\na,5\na,5",
    "type: bullet\ntitle: Off scale\nx: k\ny: v\ntarget: t\nmin: 0\nmax: 10\n\nk,v,t\na,-50,900",
    "type: dumbbell\ntitle: Huge\nx: k\ny: v\nseries: s\n\nk,s,v\na,p,1e15\na,q,-1e15",
    "type: bar\ntheme: graphite\ntitle: Tiny\nx: k\ny: v\n\nk,v\na,500\nb,-40",
  ];
  it.each(fences)("%s", (body) => {
    const result = parseMarkdown(`\`\`\`chart\n${body}\n\`\`\``);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const svg = renderSvg(ChartIRSchema.parse(result.chart));
    expect(svg.length).toBeLessThan(1_000_000);
    expect(svg).not.toMatch(/NaN|undefined|Infinity/);
  });

  it("draws at most five years even from an IR that skipped the parser", () => {
    const ok = parseMarkdown("```chart\ntype: calendar\ntitle: C\nx: d\ny: n\n\nd,n\n2020-01-01,1\n2021-01-01,2\n```");
    if (!ok.ok) throw new Error(ok.error.message);
    const chart = ChartIRSchema.parse({
      ...ok.chart,
      table: { columns: ["d", "n"], rows: [["0001-01-01", "1"], ["9999-12-31", "2"]] },
    });
    const svg = renderSvg(chart);
    expect(svg.match(/<g data-year=/g)).toHaveLength(5);
  });
});

describe("calendar year label", () => {
  it("shows both the year and Jan when 1 January is a Monday", () => {
    const svg = render(`type: calendar
title: Turn of 2024
x: d
y: n

d,n
2023-12-25,1
2024-01-01,2
2024-01-14,3`);
    const scan = scanSvg(svg);
    const year = scan.labels.find((l) => /data-year="2024"/.test(l.line))!;
    const jan = scan.labels.filter((l) => /data-month="Jan"/.test(l.line));
    expect(jan).toHaveLength(1);
    for (const month of jan) {
      // The year sits on its own line above the months.
      expect(labelBox(month).top).toBeGreaterThan(labelBox(year).bottom);
    }
  });
});
