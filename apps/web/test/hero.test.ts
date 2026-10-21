// @vitest-environment happy-dom
/**
 * The home hero (HeroStage.vue + src/hero.ts): the energy block renders at
 * every width the stage uses and as every kind the show morphs it into;
 * no text the show hands to render() throws; autoplay off starts no timers;
 * a jump to any scene ends on a drawn pane.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@markvis/html";
import {
  CAPTIONS,
  HERO_LINES,
  HERO_RESERVED_LINES,
  POSTER_CAPTION,
  SCENES,
  SCENE_NAMES,
  SWATCHES,
  createHero,
  emptyState,
  endState,
  posterResult,
  sceneMs,
  showTexts,
  stateAt,
  steps,
  type HeroController,
} from "../src/hero";

const here = dirname(fileURLToPath(import.meta.url));
const stageVue = readFileSync(join(here, "../components/HeroStage.vue"), "utf8");
const block = HERO_LINES.join("\n");
const grouped = HERO_LINES.filter((line) => !line.startsWith("layout:")).join("\n");
const asType = (type: string) => grouped.replace(/^type: bar$/m, `type: ${type}`);

/** The markup HeroStage.vue server-renders, built by hand (same classes). */
function mountStage(): HTMLElement {
  const svg = posterResult().ok ? (posterResult() as { svg: string }).svg : "";
  document.body.innerHTML = `
    <div class="hero-stage">
      <div class="hero-stage-top">
        <span class="hero-tab">README.md</span>
        <span class="hero-swatches" hidden>
          ${SWATCHES.map((s) => `<button class="hero-sw" type="button" data-c="${s.hex}"></button>`).join("")}
          <code class="hero-sw-read"></code>
        </span>
        <span class="hero-cap">${POSTER_CAPTION}</span>
      </div>
      <div class="hero-stage-body">
        <div class="hero-src">
          <pre class="hero-pre" tabindex="0"><code><span class="hero-b">${block}</span><mark class="hero-sel"></mark><span class="hero-caret"></span><span class="hero-a"></span></code></pre>
          <textarea class="hero-ta" hidden></textarea>
        </div>
        <div class="hero-fig" data-state="chart"><div class="hero-layer">${svg}</div></div>
      </div>
      <div class="hero-stage-foot">
        <ol class="hero-track">
          ${SCENE_NAMES.map((_, i) => `<li><button class="hero-tick done" type="button" data-scene="${i + 1}"></button></li>`).join("")}
        </ol>
        <span class="hero-track-label" hidden><b></b> <span></span></span>
        <button class="hero-replay" type="button" hidden>Play</button>
        <span class="hero-bar"></span>
      </div>
    </div>`;
  return document.querySelector<HTMLElement>(".hero-stage")!;
}

function pane(root: HTMLElement) {
  const fig = root.querySelector<HTMLElement>(".hero-fig")!;
  const live = [...fig.querySelectorAll(".hero-layer:not(.out)")];
  return { state: fig.dataset.state, live, html: live.map((l) => l.innerHTML).join("") };
}

let hero: HeroController | undefined;
afterEach(() => {
  hero?.destroy();
  hero = undefined;
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.documentElement.className = "";
});

describe("hero block", () => {
  it("is the poster: 19 lines, ten real rows, inside the 21 reserved", () => {
    expect(HERO_LINES).toHaveLength(19);
    expect(HERO_LINES.length).toBeLessThanOrEqual(HERO_RESERVED_LINES);
    expect(HERO_LINES.slice(0, 2)).toEqual(["type: bar", "layout: stacked"]);
    expect(HERO_LINES.filter((line) => /^[A-Z][a-z ]+,[A-Z][a-z]+,\d+\.\d$/.test(line))).toHaveLength(10);
  });

  it("server-renders the finished bar chart at 640", () => {
    const r = posterResult();
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.svg).toContain("<svg");
    expect(r.svg).toContain('data-chart-type="bar"');
    expect(stageVue).toContain("render(text, { width: 640 })");
  });

  for (const width of [640, 602, 424, 360]) {
    it(`renders ok at ${width}`, () => {
      const r = render(block, { width });
      expect(r.ok, r.ok ? "" : r.error.message).toBe(true);
      for (const surface of ["light", "dark"] as const) {
        expect(render(block, { width, surface }).ok).toBe(true);
      }
    });
  }

  it("the same rows are a grouped and a stacked bar, a sankey, a treemap and a heatmap", () => {
    for (const [name, text, type] of [
      ["grouped bar", grouped, "bar"],
      ["stacked bar", block, "bar"],
      ["sankey", asType("sankey"), "sankey"],
      ["treemap", asType("treemap"), "treemap"],
      ["heatmap", asType("heatmap"), "heatmap"],
    ] as const) {
      for (const width of [640, 424, 360]) {
        const r = render(text, { width });
        expect(r.ok, `${name} at ${width}: ${r.ok ? "" : r.error.message}`).toBe(true);
        if (r.ok) expect(r.chart.type).toBe(type);
      }
    }
  });
});

describe("hero show", () => {
  it("has ten scenes, ten captions, and a positive length each", () => {
    expect(SCENES).toHaveLength(10);
    expect(SCENE_NAMES).toEqual(["Write", "Paste", "Kind", "Stack", "Theme", "Palette", "Color", "Dark", "Width", "Table"]);
    expect(CAPTIONS).toHaveLength(10);
    for (let n = 1; n <= 10; n++) expect(sceneMs(n), `scene ${n}`).toBeGreaterThan(0);
  });

  it("every text it renders returns ok or an error, never a throw; only scene 10 may fail on purpose", () => {
    const texts = showTexts();
    expect(texts.length).toBeGreaterThan(40);
    for (const { scene, text, fail } of texts) {
      for (const width of [640, 360]) {
        let r: ReturnType<typeof render> | undefined;
        expect(() => {
          r = render(text, { width });
        }, `scene ${scene}: ${JSON.stringify(text.slice(0, 40))}`).not.toThrow();
        expect(typeof r!.ok).toBe("boolean");
      }
      if (fail) expect(scene).toBe(10);
    }
    // The failure is the real one: the bad cell and one error line, every row kept.
    const broken = texts.find((t) => t.fail)!;
    const r = render(broken.text, { width: 640 });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("E_BAD_NUMBER");
      expect(r.table.rows).toHaveLength(10);
    }
  });

  it("shows the first chart within 1.6 s of the start, long before scene 1 ends", () => {
    const st = emptyState();
    let ms = 0;
    let first = -1;
    for (const op of SCENES[0]!) {
      for (const step of steps(op, st)) {
        // A step draws, then waits its ms.
        if (first < 0 && step.render && render(st.text, { width: 640 }).ok) first = ms;
        ms += step.ms;
      }
    }
    expect(first).toBeGreaterThan(0);
    expect(first, "ms until the first chart").toBeLessThanOrEqual(1600);
    expect(first, "the chart is up for most of the scene").toBeLessThan(ms / 2);
  });

  it("starts each scene from a text that renders, and ends on the poster block", () => {
    expect(stateAt(1).text).toBe("");
    for (let n = 2; n <= 10; n++) expect(render(stateAt(n).text, { width: 640 }).ok, `scene ${n}`).toBe(true);
    expect(stateAt(4).text).toBe(grouped);
    expect(stateAt(5).text).toBe(block);
    expect(stateAt(9).flip).toBe(true);
    expect(stateAt(11).text).toContain("palette: vivid");
    expect(endState(10).fail).toBe(true);
    expect(endState(10).text).toContain("Nuclear,Electricity,8.1x");
  });

  it("HeroStage.vue holds every part createHero() drives", () => {
    for (const cls of [
      "hero-stage-body",
      "hero-pre",
      "hero-ta",
      "hero-fig",
      "hero-b",
      "hero-sel",
      "hero-a",
      "hero-cap",
      "hero-bar",
      "hero-replay",
      "hero-swatches",
      "hero-sw-read",
      "hero-track-label",
      "hero-tick",
      "hero-sw",
      "hero-layer",
    ]) {
      expect(stageVue, cls).toMatch(new RegExp(`class="${cls}[" ]`));
    }
    expect(stageVue).toContain('aria-live="polite"');
    expect(stageVue).toContain('aria-label="Scenes"');
    expect(stageVue).toContain("Scene ${i + 1} of ${SCENE_NAMES.length}: ${name}");
  });

  it("creates no timers with autoplay off", () => {
    const timeout = vi.spyOn(globalThis, "setTimeout");
    const interval = vi.spyOn(globalThis, "setInterval");
    const frame = vi.spyOn(globalThis, "requestAnimationFrame");
    const root = mountStage();
    hero = createHero(root, { autoplay: false, reducedMotion: false });
    expect(timeout).not.toHaveBeenCalled();
    expect(interval).not.toHaveBeenCalled();
    expect(frame).not.toHaveBeenCalled();
    // The poster stays drawn.
    expect(pane(root).state).toBe("chart");
    expect(pane(root).html).toContain('data-chart-type="bar"');
    expect(root.querySelector(".hero-cap")!.textContent).toBe(POSTER_CAPTION);
  });

  it("reduced motion: goto(n) shows scene n's end still, on a drawn pane", () => {
    const root = mountStage();
    hero = createHero(root, { reducedMotion: true });
    expect(root.querySelector<HTMLElement>(".hero-replay")!.hidden).toBe(false);
    for (let n = 1; n <= 10; n++) {
      hero.goto(n);
      const p = pane(root);
      if (n === 10) {
        expect(p.state).toBe("fail");
        expect(p.html).toContain("<table");
        expect(p.html).toContain("E_BAD_NUMBER");
        expect(root.querySelector("td.bad")?.textContent).toBe("8.1x");
      } else {
        expect(p.state, `scene ${n}`).toBe("chart");
        expect(p.html, `scene ${n}`).toContain("<svg");
      }
      expect(root.querySelector(".hero-cap")!.textContent).toBe(CAPTIONS[n - 1]);
      expect(root.querySelector(`.hero-tick[data-scene="${n}"]`)!.getAttribute("aria-current")).toBe("step");
    }
    // Scene 07 still: the first swatch pressed, the stage sets --markvis-series-1.
    hero.goto(7);
    expect(root.style.getPropertyValue("--markvis-series-1")).toBe(SWATCHES[0].hex);
    hero.goto(0);
    expect(root.querySelector(".hero-cap")!.textContent).toBe(POSTER_CAPTION);
  });

  it("goto(n) plays scene n through and ends on the chart of its end text", async () => {
    vi.useFakeTimers();
    document.documentElement.className = "light";
    const texts = showTexts();
    const svgAttr = (html: string, name: string) => html.match(new RegExp(`<svg[^>]*\\b${name}="([^"]+)"`))?.[1];
    for (let n = 1; n <= 10; n++) {
      const root = mountStage();
      hero?.destroy();
      hero = createHero(root, { autoplay: false, reducedMotion: false });
      const start = stateAt(n);
      const end = stateAt(n + 1);
      hero.goto(n);
      if (n === 10) {
        // The error step: caret wait, then the "x" lands and the pane shows the failure output.
        await vi.advanceTimersByTimeAsync(300 + 20);
        const fail = pane(root);
        expect(fail.state).toBe("fail");
        expect(fail.html).toContain("<table");
        expect(fail.html).toContain("E_BAD_NUMBER");
        expect(root.querySelector("td.bad")?.textContent).toBe("8.1x");
        await vi.advanceTimersByTimeAsync(sceneMs(n) - 320 - 50);
      } else if (n === 3) {
        // Scene 03 starts and ends on the grouped bar: check the sankey in between.
        const sankeyAt = 300 + 250 + "sankey".length * 40 + 100;
        await vi.advanceTimersByTimeAsync(sankeyAt);
        expect(svgAttr(pane(root).html, "data-chart-type")).toBe("sankey");
        await vi.advanceTimersByTimeAsync(sceneMs(n) - sankeyAt - 50);
      } else {
        await vi.advanceTimersByTimeAsync(sceneMs(n) - 50);
      }
      const p = pane(root);
      expect(p.state, `scene ${n}`).toBe("chart");
      expect(p.live, `scene ${n}`).toHaveLength(1);
      expect(root.querySelector(".hero-cap")!.textContent).toBe(CAPTIONS[n - 1]);
      // The pane holds the chart of the last text the scene rendered, which is its end text.
      // Scene 07 renders nothing: the page sets a color and the chart does not redraw.
      const last = texts.filter((t) => t.scene === n).at(-1) ?? { text: start.text };
      expect(n === 7 ? start.text : last.text.replace(/\n$/, ""), `scene ${n}`).toBe(end.text);
      if (start.text !== end.text || start.flip !== end.flip) {
        const want = render(last.text, { width: 640, surface: end.flip ? "dark" : "light" });
        expect(want.ok).toBe(true);
        if (!want.ok) continue;
        expect(svgAttr(p.html, "data-id"), `scene ${n}`).toBe(svgAttr(want.svg, "data-id"));
        expect(svgAttr(p.html, "data-chart-type"), `scene ${n}`).toBe(want.chart.type);
      }
      if (n === 8) expect(p.html).toContain('data-surface="dark"');
      hero.stop();
    }
  });

  it("off screen the show stops, also during the poster hold, and starts again on screen", async () => {
    vi.useFakeTimers();
    let notify: ((entries: { isIntersecting: boolean }[]) => void) | undefined;
    const observed: Element[] = [];
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(cb: (entries: { isIntersecting: boolean }[]) => void) {
          notify = cb;
        }
        observe(el: Element) {
          observed.push(el);
        }
        disconnect() {}
      },
    );
    const root = mountStage();
    hero = createHero(root, { reducedMotion: false });
    expect(observed).toContain(root);
    const cap = () => root.querySelector(".hero-cap")!.textContent;
    let total = 0;
    for (let n = 1; n <= 10; n++) total += sceneMs(n);
    await vi.advanceTimersByTimeAsync(total + 1000);
    expect(cap()).toBe(POSTER_CAPTION);
    notify!([{ isIntersecting: false }]);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(cap()).toBe(POSTER_CAPTION);
    notify!([{ isIntersecting: true }]);
    expect(cap()).toBe(CAPTIONS[0]);
    // Scrolled away mid-scene: stopped; back: that scene starts again.
    await vi.advanceTimersByTimeAsync(sceneMs(1) + 200);
    expect(cap()).toBe(CAPTIONS[1]);
    notify!([{ isIntersecting: false }]);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(cap()).toBe(CAPTIONS[1]);
    notify!([{ isIntersecting: true }]);
    expect(cap()).toBe(CAPTIONS[1]);
    vi.unstubAllGlobals();
  });

  it("a show started by Replay (autoplay off) is observed and stops off screen too", async () => {
    vi.useFakeTimers();
    let notify: ((entries: { isIntersecting: boolean }[]) => void) | undefined;
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(cb: (entries: { isIntersecting: boolean }[]) => void) {
          notify = cb;
        }
        observe() {}
        disconnect() {}
      },
    );
    const root = mountStage();
    hero = createHero(root, { autoplay: false, reducedMotion: false });
    // Replay starts a show; it is observed like autoplay.
    root.querySelector<HTMLButtonElement>(".hero-replay")!.click();
    const cap = () => root.querySelector(".hero-cap")!.textContent;
    expect(cap()).toBe(CAPTIONS[0]);
    hero.goto(10);
    await vi.advanceTimersByTimeAsync(sceneMs(10) + 100);
    expect(cap()).toBe(POSTER_CAPTION);
    vi.unstubAllGlobals();
    notify!([{ isIntersecting: false }]);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(cap()).toBe(POSTER_CAPTION);
    notify!([{ isIntersecting: true }]);
    expect(cap()).toBe(CAPTIONS[0]);
  });

  it("only typing opens the editor: Shift, Escape, arrows and F-keys do not", () => {
    const root = mountStage();
    hero = createHero(root, { autoplay: false, reducedMotion: true });
    const pre = root.querySelector<HTMLElement>(".hero-pre")!;
    const ta = root.querySelector<HTMLTextAreaElement>(".hero-ta")!;
    for (const key of ["Shift", "Escape", "ArrowDown", "F5", "CapsLock", "Tab"]) {
      const e = new KeyboardEvent("keydown", { key, cancelable: true });
      pre.dispatchEvent(e);
      expect(ta.hidden, key).toBe(true);
      expect(e.defaultPrevented, key).toBe(false);
    }
    pre.dispatchEvent(new KeyboardEvent("keydown", { key: "a", cancelable: true }));
    expect(ta.hidden).toBe(false);
  });

  it("the editor redraws on input and keeps the last good chart on an error", () => {
    const root = mountStage();
    hero = createHero(root, { autoplay: false, reducedMotion: true });
    hero.edit();
    const ta = root.querySelector<HTMLTextAreaElement>(".hero-ta")!;
    expect(ta.hidden).toBe(false);
    expect(ta.value).toBe(block);
    ta.value = block.replace("type: bar", "type: sankey").replace("layout: stacked\n", "");
    ta.dispatchEvent(new Event("input"));
    expect(pane(root).html).toContain('data-chart-type="sankey"');
    ta.value = block.replace("24.9", "-24.9x");
    ta.dispatchEvent(new Event("input"));
    expect(pane(root).html).toContain('data-chart-type="sankey"');
    expect(root.querySelector(".hero-cap")!.textContent).toMatch(/^E_BAD_NUMBER/);
  });
});
