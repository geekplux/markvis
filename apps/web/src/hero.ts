/**
 * The home hero: one chart block types itself, then the same text changes
 * kind, layout, theme, palette, page color, surface, width, and breaks.
 * Every chart on the stage is render() on the text on screen.
 *
 * The scenes are data (a list of edit operations per scene), so the show,
 * a jump to any scene, and the tests all walk the same steps.
 * HeroStage.vue owns the markup; createHero() drives it.
 */
import { render, type RenderResult } from "@markvis/html";

/** Ten real 2023 flows (US EIA, Monthly Energy Review, Tables 2.2 to 2.6, quadrillion Btu). */
const ROWS = [
  "Petroleum,Transport,24.9",
  "Petroleum,Industry,8.6",
  "Petroleum,Buildings,1.8",
  "Natural gas,Electricity,13.3",
  "Natural gas,Industry,10.9",
  "Natural gas,Buildings,8.1",
  "Coal,Electricity,7.2",
  "Nuclear,Electricity,8.1",
  "Renewables,Electricity,3.2",
  "Renewables,Industry,2.4",
];
const HEADER = ["title: US energy, 2023", "unit: quads", "x: source", "y: quads", "series: sector"];
const COLUMNS = "source,sector,quads";

/** The poster: the block the show ends on, and the text the editor opens with. */
export const HERO_LINES: readonly string[] = [
  "type: bar",
  "layout: stacked",
  ...HEADER,
  "",
  COLUMNS,
  ...ROWS,
];

/** Lines reserved in the source pane: the peak block (scene 06) has 21. */
export const HERO_RESERVED_LINES = 21;

export const SCENE_NAMES = [
  "Write",
  "Paste",
  "Kind",
  "Stack",
  "Theme",
  "Palette",
  "Color",
  "Dark",
  "Width",
  "Table",
] as const;

export const CAPTIONS: readonly string[] = [
  "Type the block. The chart grows with every row.",
  "Paste the rest. Ten rows, one chart.",
  "One word changes the kind of chart. Same ten rows.",
  "One field changes the layout.",
  "Seven looks. Same text.",
  "Five palettes. One word each.",
  "Or the page sets the color. Nothing redraws.",
  "A dark page? The chart reads it.",
  "Follows its container. A chat bubble, a sidebar, a phone.",
  "Break it and the numbers stay.",
];
export const POSTER_CAPTION = "That is the whole language. Click the text to try it.";
export const EDIT_CAPTION = "Yours now. The chart redraws on every keystroke.";
export const EMPTY_TEXT = "the chart appears with the first row";

export const SWATCHES = [
  { hex: "#002FA7", name: "Klein blue" },
  { hex: "#A3441B", name: "rust" },
  { hex: "#4D6A2E", name: "moss" },
  { hex: "#7A2E62", name: "plum" },
] as const;

const BROKEN_ROW = "Nuclear,Electricity,8.1";

/** One edit on the stage. */
export type Op =
  | { op: "lines"; lines: readonly string[] }
  | { op: "type"; text: string; fail?: boolean }
  | { op: "paste"; text: string }
  | { op: "select"; word: string }
  | { op: "caret"; after: string | null }
  | { op: "erase"; n: number }
  | { op: "wait"; ms: number }
  | { op: "swatches"; show: boolean }
  | { op: "swatch"; hex: string | null }
  | { op: "flip" }
  | { op: "width"; to: "narrow" | "full"; ms: number };

const wait = (ms: number): Op => ({ op: "wait", ms });
const swapWord = (from: string, to: string, hold: number): Op[] => [
  { op: "select", word: from },
  { op: "type", text: to },
  wait(hold),
];

/** Scenes 1..10 (index 0..9). */
export const SCENES: readonly (readonly Op[])[] = [
  // 01 Write: every finished line redraws; the chart appears with the first row.
  [{ op: "lines", lines: ["type: bar", ...HEADER, "", COLUMNS, ROWS[0]!, ROWS[1]!] }, wait(800)],
  // 02 Paste: the other eight rows land at once.
  [{ op: "caret", after: null }, { op: "paste", text: ROWS.slice(2).map((r) => `\n${r}`).join("") }, wait(1600)],
  // 03 Kind: one word, same rows.
  [
    { op: "caret", after: "type: bar" },
    wait(300),
    // Each hold has 300 ms added for the 400 ms crossfade.
    ...swapWord("bar", "sankey", 2700),
    ...swapWord("sankey", "treemap", 1900),
    ...swapWord("treemap", "heatmap", 1900),
    ...swapWord("heatmap", "bar", 1100),
  ],
  // 04 Stack: one field.
  [{ op: "caret", after: "type: bar" }, wait(300), { op: "type", text: "\nlayout: stacked" }, wait(1600)],
  // 05 Theme.
  [
    { op: "caret", after: "layout: stacked" },
    wait(300),
    { op: "type", text: "\ntheme: graphite" },
    wait(1300),
    ...swapWord("graphite", "docs", 1300),
  ],
  // 06 Palette.
  [
    { op: "caret", after: "theme: docs" },
    wait(300),
    { op: "type", text: "\npalette: warm" },
    wait(1300),
    ...swapWord("warm", "vivid", 1300),
  ],
  // 07 Color: the page sets --markvis-series-1; nothing is rendered again.
  [
    { op: "swatches", show: true },
    { op: "caret", after: null },
    wait(300),
    ...SWATCHES.flatMap((s): Op[] => [{ op: "swatch", hex: s.hex }, wait(700)]),
    { op: "swatch", hex: null },
    wait(400),
    { op: "swatches", show: false },
  ],
  // 08 Dark: the other surface.
  [{ op: "flip" }, wait(1800)],
  // 09 Width: the chart pane narrows and comes back.
  [{ op: "width", to: "narrow", ms: 600 }, wait(1400), { op: "width", to: "full", ms: 300 }, wait(300)],
  // 10 Table: one bad cell; the table and one error line; then mend it.
  [
    { op: "caret", after: BROKEN_ROW },
    wait(300),
    { op: "type", text: "x", fail: true },
    wait(2000),
    { op: "erase", n: 1 },
    wait(700),
  ],
];

export interface Timing {
  char: number;
  line: number;
  select: number;
  paste: number;
}

export const DEFAULT_TIMING: Timing = { char: 40, line: 250, select: 250, paste: 150 };

export interface ShowState {
  text: string;
  caret: number;
  sel: number;
  flip: boolean;
  swatches: boolean;
  swatch: string | null;
  narrow: boolean;
}

export function emptyState(text = ""): ShowState {
  return { text, caret: text.length, sel: 0, flip: false, swatches: false, swatch: null, narrow: false };
}

/** One atomic change on the stage, then a pause. */
export interface Step {
  render: boolean;
  fail?: boolean;
  still?: boolean;
  ms: number;
  tween?: { to: "narrow" | "full"; ms: number };
}

function insert(st: ShowState, s: string): void {
  st.text = st.text.slice(0, st.caret - st.sel) + s + st.text.slice(st.caret);
  st.caret = st.caret - st.sel + s.length;
  st.sel = 0;
}

function caretAfter(st: ShowState, s: string | null): void {
  const at = s === null ? -1 : st.text.indexOf(s);
  st.caret = s === null || at < 0 ? st.text.length : at + s.length;
  st.sel = 0;
}

/** Applies one op to the state, yielding after each visible change. */
export function* steps(op: Op, st: ShowState, t: Timing = DEFAULT_TIMING): Generator<Step> {
  switch (op.op) {
    case "lines":
      for (const line of op.lines) {
        for (const ch of line) {
          insert(st, ch);
          yield { render: false, ms: t.char };
        }
        insert(st, "\n");
        yield { render: true, ms: t.line };
      }
      st.text = st.text.replace(/\n$/, "");
      st.caret = st.text.length;
      yield { render: false, ms: 0 };
      return;
    case "type":
      for (const ch of op.text) {
        insert(st, ch);
        yield { render: true, fail: op.fail, ms: t.char };
      }
      return;
    case "paste":
      insert(st, op.text);
      yield { render: true, ms: t.paste };
      return;
    case "select":
      caretAfter(st, op.word);
      st.sel = op.word.length;
      yield { render: false, ms: t.select };
      return;
    case "caret":
      caretAfter(st, op.after);
      yield { render: false, ms: 0 };
      return;
    case "erase":
      for (let i = 0; i < op.n; i++) {
        st.text = st.text.slice(0, st.caret - 1) + st.text.slice(st.caret);
        st.caret -= 1;
        yield { render: true, ms: t.char * 1.5 };
      }
      return;
    case "wait":
      yield { render: false, ms: op.ms };
      return;
    case "swatches":
      st.swatches = op.show;
      yield { render: false, ms: 0 };
      return;
    case "swatch":
      st.swatch = op.hex;
      yield { render: false, ms: 0 };
      return;
    case "flip":
      st.flip = !st.flip;
      yield { render: true, ms: 0 };
      return;
    case "width":
      st.narrow = op.to === "narrow";
      yield { render: true, still: true, ms: 0, tween: { to: op.to, ms: op.ms } };
      return;
  }
}

/** How long scene n (1..10) runs, for the progress hairline. */
export function sceneMs(n: number, t: Timing = DEFAULT_TIMING): number {
  let ms = 0;
  const st = stateAt(n, t);
  for (const op of SCENES[n - 1] ?? []) {
    for (const step of steps(op, st, t)) ms += step.ms + (step.tween?.ms ?? 0);
  }
  return ms;
}

/** The state at the start of scene n (1..10); 11 is the state after the last scene. */
export function stateAt(n: number, t: Timing = DEFAULT_TIMING): ShowState {
  const st = emptyState();
  for (let k = 0; k < n - 1 && k < SCENES.length; k++) {
    for (const op of SCENES[k]!) for (const _ of steps(op, st, t)) void _;
  }
  return st;
}

/** The still frame for scene n under reduced motion: its end, or its peak where the end undoes it. */
export function endState(n: number): ShowState & { fail?: boolean } {
  if (n === 7) return { ...stateAt(8), swatches: true, swatch: SWATCHES[0].hex };
  if (n === 9) return { ...stateAt(10), narrow: true };
  if (n === 10) {
    const st = stateAt(10);
    caretAfter(st, BROKEN_ROW);
    insert(st, "x");
    return { ...st, fail: true };
  }
  return stateAt(n + 1);
}

/** Every text the show hands to render(), in order, with the scene it belongs to. */
export function showTexts(): { scene: number; text: string; fail: boolean }[] {
  const out: { scene: number; text: string; fail: boolean }[] = [];
  const st = emptyState();
  SCENES.forEach((ops, k) => {
    for (const op of ops) {
      for (const step of steps(op, st)) {
        if (step.render) out.push({ scene: k + 1, text: st.text, fail: step.fail === true });
      }
    }
  });
  return out;
}

/** The poster chart, for the server-rendered first paint. */
export function posterResult(lines: readonly string[] = HERO_LINES): RenderResult {
  return render(lines.join("\n"), { width: 640 });
}

export interface HeroOptions {
  lines?: readonly string[];
  autoplay?: boolean;
  charMs?: number;
  lineMs?: number;
  /** Overrides prefers-reduced-motion (tests). */
  reducedMotion?: boolean;
}

export interface HeroController {
  play(from?: number): Promise<void>;
  poster(): void;
  edit(): void;
  stop(): void;
  goto(n: number): void;
  destroy(): void;
}

type Surface = "light" | "dark";

function pageSurface(): Surface {
  const root = document.documentElement;
  if (root.classList.contains("light")) return "light";
  if (root.classList.contains("dark")) return "dark";
  try {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  } catch {
    return "dark";
  }
}

const flipOf = (s: Surface): Surface => (s === "dark" ? "light" : "dark");
const ease = (p: number) => (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2);
const FADE = 400;
const POSTER_MS = 5000;
const NARROW_PX = 360;

/** The parts of the stage createHero() drives, found by class under the root. */
function parts(root: HTMLElement) {
  const q = <T extends Element>(sel: string): T => {
    const el = root.querySelector<T>(sel);
    if (!el) throw new Error(`hero: missing ${sel}`);
    return el;
  };
  return {
    stage: root,
    body: q<HTMLElement>(".hero-stage-body"),
    pre: q<HTMLElement>(".hero-pre"),
    ta: q<HTMLTextAreaElement>(".hero-ta"),
    fig: q<HTMLElement>(".hero-fig"),
    before: q<HTMLElement>(".hero-b"),
    sel: q<HTMLElement>(".hero-sel"),
    after: q<HTMLElement>(".hero-a"),
    cap: q<HTMLElement>(".hero-cap"),
    bar: q<HTMLElement>(".hero-bar"),
    replay: q<HTMLButtonElement>(".hero-replay"),
    swatches: q<HTMLElement>(".hero-swatches"),
    swRead: q<HTMLElement>(".hero-sw-read"),
    label: q<HTMLElement>(".hero-track-label"),
    labelNum: q<HTMLElement>(".hero-track-label b"),
    labelName: q<HTMLElement>(".hero-track-label span"),
    ticks: [...root.querySelectorAll<HTMLButtonElement>(".hero-tick")],
    swatchButtons: [...root.querySelectorAll<HTMLButtonElement>(".hero-sw")],
  };
}

/**
 * Drives a server-rendered stage. Timers start only from play(); with
 * autoplay off (or reduced motion) the stage keeps its poster until asked.
 */
export function createHero(root: HTMLElement, options: HeroOptions = {}): HeroController {
  const el = parts(root);
  const lines = options.lines ?? HERO_LINES;
  const t: Timing = {
    ...DEFAULT_TIMING,
    char: options.charMs ?? DEFAULT_TIMING.char,
    line: options.lineMs ?? DEFAULT_TIMING.line,
  };
  const reduced =
    options.reducedMotion ??
    (typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  let st = emptyState(lines.join("\n"));
  let run = 0;
  let look = "";
  let failing = false;
  let editing = false;
  let cur = 0;
  let raf = 0;
  let paused = false;
  // Whether a show is running, and whether the stage is on screen (true until an observer says otherwise).
  let showing = false;
  let visible = true;
  let shownSwatch: string | null = null;
  const timers = new Set<ReturnType<typeof setTimeout>>();

  const later = (fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };
  const sleep = (ms: number, id: number) =>
    new Promise<boolean>((resolve) => later(() => resolve(id === run), ms));

  /* ---- source pane ---- */
  function paint(): void {
    el.before.textContent = st.text.slice(0, st.caret - st.sel);
    el.sel.textContent = st.text.slice(st.caret - st.sel, st.caret);
    el.after.textContent = st.text.slice(st.caret);
  }

  /* ---- chart pane: keep the last good chart; only scene 10 shows the failure ---- */
  function surface(): Surface {
    return st.flip ? flipOf(pageSurface()) : pageSurface();
  }
  function renderWidth(): number {
    // The SVG scales into the pane by its own viewBox; draw it at the pane's width.
    const w = el.fig.clientWidth;
    return w > 0 ? Math.max(240, Math.round(w)) : 640;
  }
  function layer(cls: string, html: string): HTMLElement {
    const div = document.createElement("div");
    div.className = `hero-layer${cls ? ` ${cls}` : ""}`;
    div.innerHTML = html;
    return div;
  }
  function currentLayer(): HTMLElement | null {
    return el.fig.querySelector<HTMLElement>(".hero-layer:not(.out)");
  }
  function clearLayers(except?: HTMLElement): void {
    for (const old of el.fig.querySelectorAll(".hero-layer")) if (old !== except) old.remove();
  }
  function crossfade(next: HTMLElement): void {
    if (reduced) {
      clearLayers();
      el.fig.append(next);
      return;
    }
    for (const old of el.fig.querySelectorAll<HTMLElement>(".hero-layer:not(.out)")) {
      old.classList.add("out");
      later(() => old.remove(), FADE);
    }
    next.classList.add("in");
    el.fig.append(next);
  }
  function lookKey(text: string, s: Surface): string {
    const field = (name: string) => text.match(new RegExp(`^${name}:.*$`, "m"))?.[0] ?? "";
    return [field("type"), field("layout"), field("theme"), field("palette"), s].join("|");
  }
  function draw(text: string, opt: { fail?: boolean; still?: boolean } = {}): RenderResult {
    const s = surface();
    root.dataset.siteMode = s;
    const r = render(text, { width: renderWidth(), surface: s });
    if (!r.ok) {
      if (opt.fail) showFailure(r);
      return r;
    }
    const key = lookKey(text, s);
    const next = layer("", r.svg);
    const prev = currentLayer();
    el.fig.dataset.state = "chart";
    if (!prev || failing || (look !== "" && key !== look && !opt.still)) crossfade(next);
    else {
      if (!opt.still && !reduced && r.chart.type === "bar") animateBars(prev, next);
      else el.fig.append(next);
      clearLayers(next);
    }
    look = key;
    failing = false;
    return r;
  }
  /* New bars rise from the baseline; bars whose height changed grow from the old one. */
  function animateBars(prev: HTMLElement, next: HTMLElement): void {
    const height = (p: SVGGraphicsElement): number | null => {
      try {
        return typeof p.getBBox === "function" ? p.getBBox().height : null;
      } catch {
        return null;
      }
    };
    const old = new Map<string, number | null>();
    for (const p of prev.querySelectorAll<SVGGraphicsElement>("path[data-x][data-series]")) {
      old.set(`${p.dataset.series}\u0000${p.dataset.x}`, height(p));
    }
    el.fig.append(next);
    for (const p of next.querySelectorAll<SVGGraphicsElement>("path[data-x][data-series]")) {
      const key = `${p.dataset.series}\u0000${p.dataset.x}`;
      if (!old.has(key)) {
        p.classList.add("rise");
        continue;
      }
      const was = old.get(key);
      const h = height(p);
      if (was != null && h != null && h > 0 && Math.abs(was - h) > 0.5) {
        p.style.setProperty("--from", (was / h).toFixed(3));
        p.classList.add("grow");
      }
    }
  }
  function showFailure(r: Extract<RenderResult, { ok: false }>): void {
    const next = layer("fail", r.html);
    const { row, column } = r.error as { row?: number; column?: string };
    if (row && column && r.table) {
      const c = r.table.columns.indexOf(column);
      const td = next.querySelectorAll("tbody tr")[row - 1]?.children[c];
      td?.classList.add("bad");
    }
    crossfade(next);
    failing = true;
    el.fig.dataset.state = "fail";
  }
  function emptyPane(): void {
    clearLayers();
    el.fig.dataset.state = "empty";
    look = "";
    failing = false;
  }

  /* ---- chrome: track, caption, hairline, swatches, width ---- */
  function restart(node: HTMLElement, cls: string): void {
    node.classList.remove(cls);
    if (reduced) return;
    void node.offsetWidth;
    node.classList.add(cls);
  }
  function caption(s: string): void {
    if (el.cap.textContent === s) return;
    el.cap.textContent = s;
    restart(el.cap, "in");
  }
  /** n: 1..10 a scene, 0 the poster, -1 the editor. */
  function scene(n: number, ms: number): void {
    cur = n;
    el.ticks.forEach((b, k) => {
      b.classList.toggle("on", k === n - 1);
      b.classList.toggle("done", n > 0 ? k < n - 1 : n === 0);
      if (k === n - 1) b.setAttribute("aria-current", "step");
      else b.removeAttribute("aria-current");
    });
    el.label.hidden = n < 1;
    if (n >= 1) {
      el.labelNum.textContent = String(n).padStart(2, "0");
      el.labelName.textContent = SCENE_NAMES[n - 1] ?? "";
      restart(el.label, "in");
    }
    caption(n >= 1 ? (CAPTIONS[n - 1] ?? "") : n === 0 ? POSTER_CAPTION : EDIT_CAPTION);
    el.bar.classList.remove("go");
    if (ms > 0 && !reduced) {
      void el.bar.offsetWidth;
      el.bar.style.setProperty("--dur", `${ms}ms`);
      el.bar.classList.add("go");
    }
  }
  function pressSwatch(hex: string | null): void {
    shownSwatch = hex;
    for (const b of el.swatchButtons) {
      const on = b.dataset.c === hex;
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", String(on));
      b.classList.remove("press");
      if (on && !reduced) {
        void b.offsetWidth;
        b.classList.add("press");
      }
    }
    if (hex) root.style.setProperty("--markvis-series-1", hex);
    else root.style.removeProperty("--markvis-series-1");
    el.swRead.textContent = hex ? `--markvis-series-1: ${hex}` : "";
  }
  function figWidth(w: number | null): void {
    if (w == null) {
      el.body.style.removeProperty("--fig-w");
      el.fig.style.removeProperty("height");
    } else el.body.style.setProperty("--fig-w", `${Math.round(w)}px`);
  }
  function narrowTarget(): number {
    const phone = typeof window.matchMedia === "function" && window.matchMedia("(max-width: 720px)").matches;
    return phone ? Math.round(el.fig.clientWidth * 0.64) : NARROW_PX;
  }
  function holdHeight(): void {
    const h = el.fig.clientHeight;
    if (h > 0) el.fig.style.height = `${h}px`;
  }
  function chrome(): void {
    el.swatches.hidden = !st.swatches;
    if (st.swatch !== shownSwatch) pressSwatch(st.swatch);
  }
  function tween(to: "narrow" | "full", ms: number, id: number): Promise<boolean> {
    holdHeight();
    const from = el.fig.clientWidth;
    let target = NARROW_PX;
    if (to === "narrow") target = narrowTarget();
    else {
      // The full width is the grid's own column: measure it with the override off.
      const keep = el.body.style.getPropertyValue("--fig-w");
      el.body.style.removeProperty("--fig-w");
      target = el.fig.clientWidth;
      if (keep) el.body.style.setProperty("--fig-w", keep);
    }
    if (from === 0 || target === 0 || reduced) {
      // No layout (tests) or no motion: jump to the end width, keep the scene's timing.
      if (to === "full") figWidth(null);
      else figWidth(target || NARROW_PX);
      draw(st.text, { still: true });
      return sleep(ms, id);
    }
    const t0 = performance.now();
    let k = -1;
    return new Promise((resolve) => {
      const step = (now: number) => {
        if (id !== run) return resolve(false);
        const p = Math.min(1, (now - t0) / ms);
        figWidth(from + (target - from) * ease(p));
        const n = Math.floor(p * 6); // about six renders on the way
        if (n !== k || p === 1) {
          k = n;
          draw(st.text, { still: true });
        }
        if (p < 1) raf = requestAnimationFrame(step);
        else {
          if (to === "full") figWidth(null);
          resolve(true);
        }
      };
      raf = requestAnimationFrame(step);
    });
  }

  /* ---- states ---- */
  function apply(next: ShowState & { fail?: boolean }): void {
    st = { ...next };
    shownSwatch = "\u0000";
    figWidth(null);
    chrome();
    paint();
    if (!st.text) {
      root.dataset.siteMode = surface();
      emptyPane();
      return;
    }
    if (st.narrow) {
      holdHeight();
      figWidth(narrowTarget());
    }
    draw(st.text, { fail: next.fail, still: true });
  }
  function showSource(): void {
    el.ta.hidden = true;
    el.pre.hidden = false;
    editing = false;
  }
  function poster(): void {
    run++;
    showing = false;
    paused = false;
    cancelAnimationFrame(raf);
    showSource();
    el.replay.hidden = !reduced;
    el.replay.textContent = "Play";
    apply(emptyState(lines.join("\n")));
    scene(0, 0);
  }
  async function playScene(n: number, id: number): Promise<boolean> {
    scene(n, sceneMs(n, t));
    for (const op of SCENES[n - 1] ?? []) {
      for (const step of steps(op, st, t)) {
        if (id !== run) return false;
        chrome();
        paint();
        if (step.tween) {
          if (!(await tween(step.tween.to, step.tween.ms, id))) return false;
          continue;
        }
        if (step.render) draw(st.text, { fail: step.fail, still: step.still });
        if (step.ms > 0 && !(await sleep(step.ms, id))) return false;
      }
    }
    return id === run;
  }
  async function play(from = 1): Promise<void> {
    const id = ++run;
    showing = true;
    paused = false;
    // Every show (autoplay, Replay, a tick) pauses off screen; observing twice is a no-op.
    viewObserver?.observe(root);
    cancelAnimationFrame(raf);
    showSource();
    el.replay.hidden = true;
    apply(stateAt(from, t));
    for (let n = from; n <= SCENES.length; n++) if (!(await playScene(n, id))) return;
    apply(emptyState(lines.join("\n")));
    scene(0, POSTER_MS);
    if (!(await sleep(POSTER_MS, id))) return;
    if (visible) void play(1);
    else {
      // Off screen at the end of the poster hold: wait for the stage to come back.
      stop();
      paused = true;
      cur = 1;
    }
  }
  /** Jump to scene n (1..10); 0 is the poster. Reduced motion shows the scene's end, still. */
  function goto(n: number): void {
    if (!(n >= 1 && n <= SCENES.length)) return poster();
    if (!reduced) {
      void play(n);
      return;
    }
    run++;
    showing = false;
    paused = false;
    showSource();
    apply(endState(n));
    scene(n, 0);
    el.replay.hidden = false;
    el.replay.textContent = "Play";
  }
  function edit(): void {
    run++;
    showing = false;
    paused = false;
    cancelAnimationFrame(raf);
    if (failing) st.text = st.text.replace(`${BROKEN_ROW}x`, BROKEN_ROW);
    figWidth(null);
    st = { ...st, flip: false, narrow: false, sel: 0, swatches: true };
    chrome();
    el.ta.value = st.text;
    el.ta.hidden = false;
    el.pre.hidden = true;
    editing = true;
    el.replay.hidden = false;
    el.replay.textContent = "Replay";
    scene(-1, 0);
    draw(st.text);
    el.ta.focus();
  }
  function stop(): void {
    run++;
    showing = false;
    cancelAnimationFrame(raf);
    el.bar.classList.remove("go");
  }

  /* ---- events ---- */
  const onInput = () => {
    st.text = el.ta.value;
    st.caret = st.text.length;
    const r = draw(st.text);
    caption(r.ok ? EDIT_CAPTION : r.error.message);
  };
  const onPreKey = (e: KeyboardEvent) => {
    if (e.key === "Tab" || e.metaKey || e.ctrlKey || e.altKey) return;
    // Only typing opens the editor: not Shift, Escape, arrows, F-keys and the like.
    if (e.key.length > 1 && !["Enter", "Backspace", "Delete"].includes(e.key)) return;
    e.preventDefault();
    edit();
  };
  const onReplay = () => void play(1);
  const onTick = (e: Event) => {
    const n = Number((e.currentTarget as HTMLElement).dataset.scene);
    goto(n);
  };
  const onSwatch = (e: Event) => {
    const hex = (e.currentTarget as HTMLElement).dataset.c ?? null;
    st.swatch = st.swatch === hex ? null : hex;
    chrome();
  };
  el.ta.addEventListener("input", onInput);
  el.pre.addEventListener("click", edit);
  el.pre.addEventListener("keydown", onPreKey);
  el.replay.addEventListener("click", onReplay);
  for (const b of el.ticks) b.addEventListener("click", onTick);
  for (const b of el.swatchButtons) b.addEventListener("click", onSwatch);

  // Site mode: in the poster or the editor, redraw on the new surface; mid-show, the next render reads it.
  const modeObserver =
    typeof MutationObserver === "function"
      ? new MutationObserver(() => {
          if (editing || cur === 0) {
            if (st.text) draw(st.text, { still: true });
            else root.dataset.siteMode = surface();
          }
        })
      : null;
  modeObserver?.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

  // Off screen, the show pauses; back on screen, the current scene starts again.
  const viewObserver =
    typeof IntersectionObserver === "function"
      ? new IntersectionObserver((entries) => {
          const entry = entries[entries.length - 1];
          if (!entry) return;
          visible = entry.isIntersecting;
          if (!visible && showing) {
            stop();
            paused = true;
          } else if (visible && paused) {
            paused = false;
            void play(Math.max(1, cur));
          }
        })
      : null;

  let resizeTimer: ReturnType<typeof setTimeout> | undefined;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (st.text && el.fig.dataset.state === "chart") draw(st.text, { still: true });
    }, 150);
  };
  window.addEventListener("resize", onResize);

  // First paint is the server's poster. Take it over without a fade.
  root.dataset.siteMode = surface();
  if (options.autoplay !== false && !reduced) {
    void play(1);
  } else {
    poster();
    el.replay.hidden = !reduced;
  }

  return {
    play,
    poster,
    edit,
    stop,
    goto,
    destroy() {
      stop();
      for (const id of timers) clearTimeout(id);
      timers.clear();
      clearTimeout(resizeTimer);
      modeObserver?.disconnect();
      viewObserver?.disconnect();
      window.removeEventListener("resize", onResize);
      el.ta.removeEventListener("input", onInput);
      el.pre.removeEventListener("click", edit);
      el.pre.removeEventListener("keydown", onPreKey);
      el.replay.removeEventListener("click", onReplay);
      for (const b of el.ticks) b.removeEventListener("click", onTick);
      for (const b of el.swatchButtons) b.removeEventListener("click", onSwatch);
    },
  };
}
