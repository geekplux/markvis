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
