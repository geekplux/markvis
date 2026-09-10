/** Browser-only chart draw-in + hover tips. Bake/static SVG stays static. */

export type EnhanceChartOpts = {
  theme?: string;
};

type ThemeMotion = {
  totalMs: number;
  staggerMs: number;
  soft: boolean;
  tipBelow?: boolean;
};

const THEME_MOTION: Record<string, ThemeMotion> = {
  folio: { totalMs: 380, staggerMs: 28, soft: true },
  highcharts: { totalMs: 200, staggerMs: 12, soft: false },
  docs: { totalMs: 420, staggerMs: 36, soft: true },
  shadcn: { totalMs: 320, staggerMs: 22, soft: true },
  ant: { totalMs: 280, staggerMs: 18, soft: false },
  recharts: { totalMs: 300, staggerMs: 20, soft: false, tipBelow: true },
};

const STYLE_ID = "markvis-enhance-css";
const TIP_CLASS = "markvis-tip";
const ENHANCED = "markvis-enhanced";
const MOTION = "markvis-motion";
const MARK = "markvis-mark";
const MARK_LINE = "markvis-mark-line";

const MARK_SELECTOR = [
  "path[data-y][data-series]",
  "circle[data-y]",
  "[data-label][data-raw-value]",
  "path[data-series]",
  "circle[data-series]",
].join(",");

function motionOk(): boolean {
  if (typeof matchMedia !== "function") {
    return true;
  }
  return !matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function themeMotion(theme?: string): ThemeMotion {
  if (theme && THEME_MOTION[theme]) {
    return THEME_MOTION[theme]!;
  }
  return THEME_MOTION.folio!;
}

function ensureStyles(): void {
  if (typeof document === "undefined") {
    return;
  }
  if (document.getElementById(STYLE_ID)) {
    return;
  }
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
.${TIP_CLASS} {
  position: fixed;
  z-index: 10000;
  pointer-events: none;
  box-sizing: border-box;
  max-width: min(280px, 90vw);
  padding: 4px 8px;
  border-radius: 2px;
  border: 1px solid rgba(237, 235, 229, 0.22);
  background: #080b08;
  color: #edebe5;
  font: 560 11px/1.35 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0;
  transform: translateY(2px);
  transition: opacity 80ms ease, transform 80ms ease;
}
.${TIP_CLASS}[data-show="1"] {
  opacity: 1;
  transform: translateY(0);
}
.${ENHANCED} .${MARK},
.${ENHANCED} .${MARK_LINE} {
  cursor: crosshair;
}
.${ENHANCED}.${MOTION} .${MARK} {
  opacity: 0;
  animation-name: markvis-fade-in;
  animation-duration: var(--markvis-draw-ms, 280ms);
  animation-timing-function: ease;
  animation-fill-mode: forwards;
  animation-delay: var(--markvis-stagger, 0ms);
}
.${ENHANCED}.${MOTION}.${ENHANCED}-soft .${MARK} {
  animation-timing-function: ease-out;
}
.${ENHANCED}.${MOTION} path.${MARK_LINE} {
  opacity: 1;
  stroke-dasharray: var(--markvis-len, 1);
  stroke-dashoffset: var(--markvis-len, 1);
  animation-name: markvis-draw-line;
  animation-duration: var(--markvis-draw-ms, 280ms);
  animation-timing-function: ease;
  animation-fill-mode: forwards;
  animation-delay: var(--markvis-stagger, 0ms);
}
@keyframes markvis-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes markvis-draw-line {
  to { stroke-dashoffset: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .${TIP_CLASS} {
    transition: none;
    transform: none;
  }
  .${ENHANCED}.${MOTION} .${MARK},
  .${ENHANCED}.${MOTION} path.${MARK_LINE} {
    animation: none !important;
    opacity: 1 !important;
    stroke-dashoffset: 0 !important;
  }
}
`.trim();
  document.head.appendChild(style);
}

/** Build tip label from mark data attrs / text. Exported for tests. */
export function tipTextForMark(el: Element): string {
  const series = el.getAttribute("data-series")?.trim() || "";
  const label =
    el.getAttribute("data-label")?.trim() ||
    el.getAttribute("data-x")?.trim() ||
    el.getAttribute("data-full-label")?.trim() ||
    "";
  const value =
    el.getAttribute("data-y")?.trim() ||
    el.getAttribute("data-raw-value")?.trim() ||
    "";
  const parts: string[] = [];
  if (series && series !== label) {
    parts.push(series);
  }
  if (label) {
    parts.push(label);
  }
  if (value) {
    parts.push(value);
  }
  if (parts.length === 0) {
    const text = (el.textContent ?? "").trim();
    if (text) {
      return text;
    }
  }
  return parts.join(" · ");
}

function collectMarks(root: SVGSVGElement): Element[] {
  const seen = new Set<Element>();
  const out: Element[] = [];
  for (const el of Array.from(root.querySelectorAll(MARK_SELECTOR))) {
    if (seen.has(el)) {
      continue;
    }
    seen.add(el);
    out.push(el);
  }
  return out;
}

function isLineStrokePath(el: Element): el is SVGPathElement {
  if (el.tagName.toLowerCase() !== "path") {
    return false;
  }
  const fill = (el.getAttribute("fill") ?? "").toLowerCase();
  const stroke = el.getAttribute("stroke");
  return (
    el.hasAttribute("data-series") &&
    !!stroke &&
    stroke !== "none" &&
    (fill === "none" || fill === "")
  );
}

function pathLength(el: SVGPathElement): number {
  try {
    const len = el.getTotalLength();
    return Number.isFinite(len) && len > 0 ? len : 1;
  } catch {
    return 1;
  }
}

/**
 * After an SVG mounts: optional stagger draw-in, hover value tip.
 * Returns a disposer — call before replacing the SVG.
 */
export function enhanceChartSvg(
  root: SVGSVGElement,
  opts: EnhanceChartOpts = {},
): () => void {
  if (typeof document === "undefined") {
    return () => {};
  }
  ensureStyles();

  const motion = themeMotion(opts.theme);
  const allowMotion = motionOk();
  root.classList.add(ENHANCED);
  if (opts.theme) {
    root.dataset.theme = opts.theme;
  }
  if (allowMotion) {
    root.classList.add(MOTION);
    if (motion.soft) {
      root.classList.add(`${ENHANCED}-soft`);
    }
  }

  const marks = collectMarks(root);
  const n = Math.max(marks.length, 1);
  const drawMs = motion.totalMs;
  const staggerCap = Math.max(0, motion.totalMs - 80);
  const step = Math.min(motion.staggerMs, Math.floor(staggerCap / n) || 0);

  for (let i = 0; i < marks.length; i++) {
    const el = marks[i]!;
    const delay = Math.min(i * step, staggerCap);
    (el as HTMLElement).style.setProperty("--markvis-draw-ms", `${drawMs}ms`);
    (el as HTMLElement).style.setProperty("--markvis-stagger", `${delay}ms`);
    if (allowMotion && isLineStrokePath(el)) {
      const len = pathLength(el);
      (el as HTMLElement).style.setProperty("--markvis-len", String(len));
      el.classList.add(MARK_LINE);
    } else {
      el.classList.add(MARK);
    }
  }

  const tip = document.createElement("div");
  tip.className = TIP_CLASS;
  tip.setAttribute("role", "tooltip");
  tip.hidden = true;
  document.body.appendChild(tip);

  const ac = new AbortController();
  const { signal } = ac;

  function hideTip(): void {
    tip.dataset.show = "0";
    tip.hidden = true;
    tip.textContent = "";
  }

  function placeTip(clientX: number, clientY: number): void {
    const pad = 10;
    tip.hidden = false;
    tip.dataset.show = "1";
    const tw = tip.offsetWidth || 80;
    const th = tip.offsetHeight || 24;
    let x = clientX + pad;
    let y = clientY + pad;
    if (motion.tipBelow) {
      const box = root.getBoundingClientRect();
      y = box.bottom + 8;
      x = Math.min(Math.max(clientX - tw / 2, box.left), box.right - tw);
    }
    const maxX = window.innerWidth - tw - 8;
    const maxY = window.innerHeight - th - 8;
    tip.style.left = `${Math.max(8, Math.min(x, maxX))}px`;
    tip.style.top = `${Math.max(8, Math.min(y, maxY))}px`;
  }

  function onOver(event: Event): void {
    const e = event as PointerEvent;
    const target = e.target;
    if (!(target instanceof Element)) {
      return;
    }
    const mark = target.closest(MARK_SELECTOR);
    if (!mark || !root.contains(mark)) {
      return;
    }
    const text = tipTextForMark(mark);
    if (!text) {
      return;
    }
    tip.textContent = text;
    placeTip(e.clientX, e.clientY);
  }

  function onMove(event: Event): void {
    if (tip.hidden) {
      return;
    }
    const e = event as PointerEvent;
    placeTip(e.clientX, e.clientY);
  }

  function onOut(event: Event): void {
    const e = event as PointerEvent;
    const related = e.relatedTarget;
    if (related instanceof Node && root.contains(related)) {
      const mark = (related as Element).closest?.(MARK_SELECTOR);
      if (mark && root.contains(mark)) {
        return;
      }
    }
    hideTip();
  }

  root.addEventListener("pointerover", onOver, { signal });
  root.addEventListener("pointermove", onMove, { signal });
  root.addEventListener("pointerout", onOut, { signal });
  root.addEventListener("pointerleave", hideTip, { signal });
  root.addEventListener("blur", hideTip, { signal, capture: true });
  window.addEventListener("scroll", hideTip, { signal, passive: true });

  let disposed = false;
  return () => {
    if (disposed) {
      return;
    }
    disposed = true;
    ac.abort();
    hideTip();
    tip.remove();
    root.classList.remove(ENHANCED, MOTION, `${ENHANCED}-soft`);
    for (const el of marks) {
      el.classList.remove(MARK, MARK_LINE);
      (el as HTMLElement).style.removeProperty("--markvis-draw-ms");
      (el as HTMLElement).style.removeProperty("--markvis-stagger");
      (el as HTMLElement).style.removeProperty("--markvis-len");
    }
  };
}
