import { describe, expect, it } from "vitest";
import { dropinSnippet, fenceBody } from "../src/snippet.js";

const fence = `\`\`\`chart
markvis: 2
type: bar
title: t
x: a
y: b

a,b
x,1
\`\`\`
`;

describe("dropinSnippet", () => {
  it("wraps fence body as language-chart plus script tag", () => {
    const snip = dropinSnippet(fence);
    expect(snip).toContain('class="language-chart"');
    expect(snip).toContain("type: bar");
    expect(snip).toContain('<script src="./markvis.min.js"></script>');
    expect(snip).not.toContain("```");
  });

  it("strips fence wrapper", () => {
    expect(fenceBody(fence)).toContain("type: bar");
    expect(fenceBody(fence)).not.toContain("```");
  });
});
