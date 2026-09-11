/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { enhanceChartSvg, tipTextForMark } from "../src/enhance.js";

const FIXTURE = `
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="0 0 200 100">
  <path d="M10 90 L10 20 L40 20 L40 90 Z" fill="#3B82F6" data-x="Jan" data-series="revenue" data-y="120"/>
  <path d="M10 50 L90 30 L170 60" fill="none" stroke="#3B82F6" stroke-width="2" data-series="signups"/>
  <circle cx="90" cy="30" r="3" fill="#3B82F6" data-series="signups" data-y="80"/>
  <path d="M100 50 L120 20 A40 40 0 0 1 140 50 Z" fill="#F97316" data-label="Chrome" data-raw-value="52"/>
</svg>
`.trim();

function mountSvg(): SVGSVGElement {
  document.body.innerHTML = FIXTURE;
  const svg = document.querySelector("svg");
  if (!svg) {
    throw new Error("svg missing");
  }
  return svg;
}

describe("tipTextForMark", () => {
  it("joins series, label, and numeric attrs", () => {
    const el = document.createElement("path");
    el.setAttribute("data-series", "revenue");
    el.setAttribute("data-x", "Jan");
    el.setAttribute("data-y", "120");
    expect(tipTextForMark(el)).toBe("revenue · Jan · 120");
  });

  it("uses pie label + raw value", () => {
    const el = document.createElement("path");
    el.setAttribute("data-label", "Chrome");
    el.setAttribute("data-raw-value", "52");
    expect(tipTextForMark(el)).toBe("Chrome · 52");
  });
});

describe("enhanceChartSvg", () => {
  let cleanup: (() => void) | undefined;

  beforeEach(() => {
    document.body.innerHTML = "";
    document.head.querySelector("#markvis-enhance-css")?.remove();
    cleanup = undefined;
  });

  afterEach(() => {
    cleanup?.();
    cleanup = undefined;
    document.body.innerHTML = "";
    vi.unstubAllGlobals();
  });

  it("skips motion class when prefers-reduced-motion: reduce", () => {
    vi.stubGlobal(
      "matchMedia",
      (query: string) =>
        ({
          matches: query.includes("prefers-reduced-motion") && query.includes("reduce"),
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }) as MediaQueryList,
    );
    const svg = mountSvg();
    cleanup = enhanceChartSvg(svg, { theme: "folio" });
    expect(svg.classList.contains("markvis-enhanced")).toBe(true);
    expect(svg.classList.contains("markvis-motion")).toBe(false);
    expect(svg.querySelector(".markvis-mark")).toBeTruthy();
  });

  it("still shows hover tip when prefers-reduced-motion: reduce", () => {
    vi.stubGlobal(
      "matchMedia",
      (query: string) =>
        ({
          matches: query.includes("prefers-reduced-motion") && query.includes("reduce"),
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }) as MediaQueryList,
    );
    const svg = mountSvg();
    cleanup = enhanceChartSvg(svg, { theme: "folio" });
    expect(svg.classList.contains("markvis-motion")).toBe(false);
    const bar = svg.querySelector("path[data-y]")!;
    bar.dispatchEvent(
      new PointerEvent("pointerover", {
        bubbles: true,
        clientX: 20,
        clientY: 40,
      }),
    );
    const tip = document.querySelector(".markvis-tip") as HTMLElement | null;
    expect(tip).toBeTruthy();
    expect(tip!.hidden).toBe(false);
    expect(tip!.textContent).toBe("revenue · Jan · 120");
  });

  it("sets tip data-theme for per-theme shape polish", () => {
    vi.stubGlobal(
      "matchMedia",
      () =>
        ({
          matches: false,
          media: "",
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }) as MediaQueryList,
    );
    const svg = mountSvg();
    cleanup = enhanceChartSvg(svg, { theme: "shadcn" });
    const tip = document.querySelector(".markvis-tip") as HTMLElement | null;
    expect(tip?.dataset.theme).toBe("shadcn");
    const css = document.getElementById("markvis-enhance-css")?.textContent ?? "";
    expect(css).toContain('[data-theme="shadcn"]');
    expect(css).toContain('[data-theme="highcharts"]');
    expect(css).toContain("prefers-reduced-motion");
  });

  it("adds motion class and stagger when motion OK", () => {
    vi.stubGlobal(
      "matchMedia",
      () =>
        ({
          matches: false,
          media: "",
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }) as MediaQueryList,
    );
    const svg = mountSvg();
    cleanup = enhanceChartSvg(svg, { theme: "highcharts" });
    expect(svg.classList.contains("markvis-motion")).toBe(true);
    expect(svg.dataset.theme).toBe("highcharts");
    const bar = svg.querySelector("path[data-y]");
    expect(bar?.classList.contains("markvis-mark")).toBe(true);
  });

  it("shows tip text on pointerover and hides on leave", () => {
    vi.stubGlobal(
      "matchMedia",
      () =>
        ({
          matches: false,
          media: "",
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }) as MediaQueryList,
    );
    const svg = mountSvg();
    cleanup = enhanceChartSvg(svg, { theme: "folio" });
    const bar = svg.querySelector("path[data-y]")!;
    bar.dispatchEvent(
      new PointerEvent("pointerover", {
        bubbles: true,
        clientX: 20,
        clientY: 40,
      }),
    );
    const tip = document.querySelector(".markvis-tip") as HTMLElement | null;
    expect(tip).toBeTruthy();
    expect(tip!.textContent).toBe("revenue · Jan · 120");
    expect(tip!.hidden).toBe(false);

    svg.dispatchEvent(
      new PointerEvent("pointerleave", { bubbles: true }),
    );
    expect(tip!.hidden).toBe(true);
  });

  it("cleanup removes tip and listeners", () => {
    const svg = mountSvg();
    const dispose = enhanceChartSvg(svg, { theme: "docs" });
    expect(document.querySelector(".markvis-tip")).toBeTruthy();
    dispose();
    expect(document.querySelector(".markvis-tip")).toBeNull();
    expect(svg.classList.contains("markvis-enhanced")).toBe(false);
  });
});
