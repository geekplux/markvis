import { describe, expect, it } from "vitest";
import { parseMarkdown } from "../src/index.js";

function parse(body: string) {
  return parseMarkdown(`\`\`\`chart\n${body}\n\`\`\``);
}

describe("numeric classes", () => {
  it("keeps a real zero and rejects text that is not a number", () => {
    const zero = parse(`type: bar
title: Z
x: k
y: v

k,v
a,0
b,0.0
`);
    expect(zero.ok).toBe(true);
    if (!zero.ok) return;
    expect(zero.chart.table.rows[0]?.[1]).toBe("0");
    expect(zero.chart.table.rows[1]?.[1]).toBe("0.0");

    const bad = parse(`type: bar
title: Bad
x: k
y: v

k,v
a,5
b,N/A
c,abc
`);
    expect(bad.ok).toBe(false);
    if (bad.ok) return;
    expect(bad.error.code).toBe("E_BAD_NUMBER");
    expect(bad.error.row).toBe(2);
    expect(bad.error.column).toBe("v");
    expect(bad.error.message).toContain("N/A");
    expect(bad.table.rows.map((row) => row[1])).toEqual(["5", "N/A", "abc"]);
  });

  it("allows an empty line or area cell and rejects an empty pie cell", () => {
    const line = parse(`type: line
title: Gap
x: k
y: v

k,v
a,1
b,
c,3
`);
    expect(line.ok).toBe(true);

    const pie = parse(`type: pie
title: Hole
x: k
y: v

k,v
a,1
b,
`);
    expect(pie.ok).toBe(false);
    if (pie.ok) return;
    expect(pie.error.code).toBe("E_MISSING_VALUE");
    expect(pie.error.row).toBe(2);
    expect(pie.table.rows[1]?.[1]).toBe("");
  });

  it("rejects a repeated category and keeps scatter repeats", () => {
    const dup = parse(`type: bar
title: Dup
x: k
y: v

k,v
a,1
a,2
`);
    expect(dup.ok).toBe(false);
    if (dup.ok) return;
    expect(dup.error.code).toBe("E_DUP_KEY");
    expect(dup.table.rows).toEqual([
      ["a", "1"],
      ["a", "2"],
    ]);

    const scatter = parse(`type: scatter
title: Repeats
x: x
y: y

x,y
1,2
1,2
1,3
`);
    expect(scatter.ok).toBe(true);

    const hist = parse(`type: hist
title: Repeats
x: x

x
1
1
2
`);
    expect(hist.ok).toBe(true);
  });

  it("rejects markvis 99 and accepts an omitted version as 2", () => {
    const future = parse(`markvis: 99
type: bar
title: Future
x: k
y: v

k,v
a,1
`);
    expect(future.ok).toBe(false);
    if (future.ok) return;
    expect(future.error.code).toBe("E_BAD_VERSION");
    expect(future.error.message).toContain("99");
    expect(future.table.rows[0]).toEqual(["a", "1"]);

    const omitted = parse(`type: bar
title: Current
x: k
y: v

k,v
a,1
`);
    expect(omitted.ok).toBe(true);
    if (!omitted.ok) return;
    expect(omitted.chart.markvis).toBe(2);
  });

  it("rejects a sankey cycle and keeps the table", () => {
    const cycle = parse(`type: sankey
title: Cycle
x: source
y: value
series: target

source,target,value
A,B,10
B,A,4
`);
    expect(cycle.ok).toBe(false);
    if (cycle.ok) return;
    expect(cycle.error.code).toBe("E_SANKEY_CYCLE");
    expect(cycle.table.rows).toHaveLength(2);
  });

  it("keeps a ragged extra cell on the parsed table", () => {
    const ragged = parse(`type: bar
title: Ragged
x: k
y: v

k,v
a,1,leftover
b,2
`);
    expect(ragged.ok).toBe(false);
    if (ragged.ok) return;
    expect(ragged.error.code).toBe("E_EXTRA_COLUMN");
    expect(ragged.table.rows[0]).toEqual(["a", "1", "leftover"]);
  });
});

describe("dumbbell rules", () => {
  const body = (rows: string, series = "series: period\n") => `type: dumbbell
title: D
x: line
y: minutes
${series}
line,period,minutes
${rows}`;

  it("keeps the pair in input order and allows a missing value", () => {
    const ok = parse(body("Red,before,41\nRed,after,36\nGold,before,\nGold,after,35\n"));
    expect(ok.ok).toBe(true);
    if (!ok.ok) return;
    expect(ok.chart.series).toBe("period");
  });

  it("requires series", () => {
    const out = parse(body("Red,before,41\n", ""));
    expect(out.ok).toBe(false);
    if (out.ok) return;
    expect(out.error.code).toBe("E_UNKNOWN_FIELD");
    expect(out.error.message).toContain("dumbbell requires series");
  });

  it("needs exactly two series values", () => {
    const three = parse(body("Red,before,41\nRed,after,36\nRed,later,34\n"));
    expect(three.ok).toBe(false);
    if (three.ok) return;
    expect(three.error.code).toBe("E_UNKNOWN_FIELD");
    expect(three.error.message).toContain("exactly two period values (got 3)");
    expect(three.table.rows).toHaveLength(3);
  });

  it("rejects a repeated category and period", () => {
    const dup = parse(body("Red,before,41\nRed,before,40\nRed,after,36\n"));
    expect(dup.ok).toBe(false);
    if (dup.ok) return;
    expect(dup.error.code).toBe("E_DUP_KEY");
  });
});

describe("bullet rules", () => {
  const body = (rows: string, extra = "target: quota\n") => `type: bullet
title: B
x: region
y: booked
${extra}
region,booked,quota
${rows}`;

  it("keeps target on the IR and allows an empty target cell", () => {
    const ok = parse(body("North,420,400\nSouth,365,\n"));
    expect(ok.ok).toBe(true);
    if (!ok.ok) return;
    expect(ok.chart.target).toBe("quota");
    expect(ok.chart.series).toBeUndefined();
  });

  it("rejects a target that is not a number", () => {
    const bad = parse(body("North,420,lots\n"));
    expect(bad.ok).toBe(false);
    if (bad.ok) return;
    expect(bad.error.code).toBe("E_BAD_NUMBER");
    expect(bad.error.column).toBe("quota");
  });

  it("rejects a target column that does not exist", () => {
    const missing = parse(body("North,420,400\n", "target: goal\n"));
    expect(missing.ok).toBe(false);
    if (missing.ok) return;
    expect(missing.error.code).toBe("E_UNKNOWN_FIELD");
  });

  it("rejects target on another type and min >= max", () => {
    const wrongType = parse(`type: bar
title: B
x: region
y: booked
target: quota

region,booked,quota
North,420,400
`);
    expect(wrongType.ok).toBe(false);
    if (wrongType.ok) return;
    expect(wrongType.error.code).toBe("E_UNKNOWN_FIELD");
    const flipped = parse(body("North,420,400\n", "target: quota\nmin: 500\nmax: 100\n"));
    expect(flipped.ok).toBe(false);
    if (flipped.ok) return;
    expect(flipped.error.code).toBe("E_UNKNOWN_FIELD");
  });

  it("requires every actual value and rejects a repeated label", () => {
    const empty = parse(body("North,,400\n"));
    expect(empty.ok).toBe(false);
    if (empty.ok) return;
    expect(empty.error.code).toBe("E_MISSING_VALUE");
    const dup = parse(body("North,420,400\nNorth,410,400\n"));
    expect(dup.ok).toBe(false);
    if (dup.ok) return;
    expect(dup.error.code).toBe("E_DUP_KEY");
  });
});

describe("boxplot rules", () => {
  it("keeps repeated categories and skips empty values", () => {
    const ok = parse(`type: boxplot
title: B
x: service
y: ms

service,ms
Search,42
Search,40
Search,
Checkout,90
`);
    expect(ok.ok).toBe(true);
    if (!ok.ok) return;
    expect(ok.chart.table.rows).toHaveLength(4);
  });

  it("rejects text in a measure", () => {
    const bad = parse(`type: boxplot
title: B
x: service
y: ms

service,ms
Search,fast
`);
    expect(bad.ok).toBe(false);
    if (bad.ok) return;
    expect(bad.error.code).toBe("E_BAD_NUMBER");
  });
});

describe("calendar rules", () => {
  const body = (rows: string, extra = "") => `type: calendar
title: C
x: date
y: km
${extra}
date,km
${rows}`;

  it("accepts dates in any order and an empty value", () => {
    const ok = parse(body("2026-03-08,10\n2026-03-01,12\n2026-03-04,\n"));
    expect(ok.ok).toBe(true);
    if (!ok.ok) return;
    expect(ok.chart.table.rows[0]?.[0]).toBe("2026-03-08");
  });

  it("rejects malformed and impossible dates with E_BAD_DATE", () => {
    for (const date of ["2026-02-30", "2026-13-01", "2026-3-1", "03/01/2026", ""]) {
      const bad = parse(body(`2026-03-01,1\n${date},2\n`));
      expect(bad.ok, date).toBe(false);
      if (bad.ok) continue;
      expect(bad.error.code, date).toBe("E_BAD_DATE");
      expect(bad.error.row, date).toBe(2);
      expect(bad.table.rows, date).toHaveLength(2);
    }
  });

  it("rejects a repeated date", () => {
    const dup = parse(body("2026-03-01,1\n2026-03-01,2\n"));
    expect(dup.ok).toBe(false);
    if (dup.ok) return;
    expect(dup.error.code).toBe("E_DUP_KEY");
  });

  it("checks min < max", () => {
    const flipped = parse(body("2026-03-01,1\n", "min: 10\nmax: 2\n"));
    expect(flipped.ok).toBe(false);
    if (flipped.ok) return;
    expect(flipped.error.code).toBe("E_UNKNOWN_FIELD");
  });
});

describe("calendar span", () => {
  const body = (rows: string) => `type: calendar
title: C
x: date
y: n

date,n
${rows}`;

  it("accepts up to five calendar years", () => {
    expect(parse(body("2020-01-01,1\n2024-12-31,2\n")).ok).toBe(true);
  });

  it("rejects a wider span with E_BAD_DATE, keeping the rows", () => {
    for (const rows of ["2020-01-01,1\n2025-01-01,2\n", "0001-01-01,1\n9999-12-31,2\n"]) {
      const out = parse(body(rows));
      expect(out.ok, rows).toBe(false);
      if (out.ok) continue;
      expect(out.error.code).toBe("E_BAD_DATE");
      expect(out.error.message).toContain("at most 5");
      expect(out.table.rows).toHaveLength(2);
    }
  });
});
