import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { previewSource } from "@markvis/browser/preview";
import { fenceForThemePalette } from "../src/catalog.js";

const here = dirname(fileURLToPath(import.meta.url));
const valid01 = readFileSync(
  join(here, "../../../examples/valid/01-bar-basic.md"),
  "utf8",
);

describe("Examples detail live palette paint", () => {
  it("ink→vivid swap recolors 01-bar-basic fills (shared previewSource)", () => {
    const inkFence = fenceForThemePalette(valid01, "folio", "ink");
    const vividFence = fenceForThemePalette(valid01, "folio", "vivid");
    expect(inkFence).toMatch(/palette:\s*ink/);
    expect(vividFence).toMatch(/palette:\s*vivid/);

    const inkView = previewSource(inkFence, "01-bar-basic.md");
    const vividView = previewSource(vividFence, "01-bar-basic.md");
    expect(inkView.ok).toBe(true);
    expect(vividView.ok).toBe(true);
    expect(inkView.svg).toContain("<svg");
    expect(vividView.svg).toContain("<svg");
    expect(inkView.svg).toContain("#2A2F2A");
    expect(vividView.svg).toContain("#E11D48");
    expect(inkView.svg).not.toContain("#E11D48");
    expect(vividView.svg).not.toContain("#2A2F2A");
    expect(inkView.svg).not.toBe(vividView.svg);
  });

  it("render fail yields empty svg plus error — never baked bytes", () => {
    const bad = "```chart\ntype: not-a-type\n\na,b\n1,2\n```";
    const view = previewSource(bad, "bad.md");
    expect(view.ok).toBe(false);
    expect(view.svg).toBe("");
    expect(view.error).toMatch(/E_UNKNOWN_TYPE/);
    expect(view.table.columns.length).toBeGreaterThan(0);
  });
});
