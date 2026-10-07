/**
 * A small reader for the SVG markvis emits (one element per line), so tests
 * can check what a reader sees — contrast, geometry, clipping — instead of
 * comparing bytes with a golden that re-bakes along with any bug.
 */
import { textWidth } from "../src/text.js";

export type Shape = {
  kind: "rect" | "path";
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  opacity: number;
  line: string;
};

export type Label = {
  text: string;
  weight: number;
  /** Extra width from inline tspans set at their own font size (e.g. " · unit"). */
  inlineExtra: number;
  x: number;
  y: number;
  anchor: "start" | "middle" | "end";
  size: number;
  fill: string;
  middle: boolean;
  /** dominant-baseline="hanging": y is the top of the text. */
  hanging: boolean;
  /** Turned -90°: the text runs up the page from (x, y). */
  rotated: boolean;
  /** Painted over a paper-colored stroke, so the text sits on paper whatever is under it. */
  halo: boolean;
  line: string;
};

export type Scan = {
  width: number;
  height: number;
  plate: string | null;
  shapes: Shape[];
  labels: Label[];
  rects: { rx: number; w: number; h: number; line: string }[];
};

function attr(line: string, name: string): string | undefined {
  return line.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
}

function num(line: string, name: string): number | undefined {
  const raw = attr(line, name);
  if (raw === undefined || raw.endsWith("%")) return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

function pathBox(d: string): { x: number; y: number; w: number; h: number } | null {
  const nums = [...d.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
  if (nums.length < 4) return null;
  const xs = nums.filter((_, i) => i % 2 === 0);
  const ys = nums.filter((_, i) => i % 2 === 1);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

const isHex = (value: string | undefined): value is string =>
  value !== undefined && /^#[0-9a-fA-F]{6}$|^#[0-9a-fA-F]{3}$/.test(value);

/** Read every element in document order, resolving fill and font size through <g>. */
export function scanSvg(svg: string): Scan {
  const lines = svg.split("\n");
  const root = lines[0] ?? "";
  const scan: Scan = {
    width: num(root, "width") ?? 0,
    height: num(root, "height") ?? 0,
    plate: null,
    shapes: [],
    labels: [],
    rects: [],
  };
  const stack: { fill?: string; size?: number; halo?: boolean; weight?: number }[] = [
    { size: num(root, "font-size") ?? 12 },
  ];
  const inherited = <K extends "fill" | "size" | "halo" | "weight">(key: K) => {
    for (let i = stack.length - 1; i >= 0; i--) {
      const value = stack[i]![key];
      if (value !== undefined) return value;
    }
    return undefined;
  };
  let inDefs = false;
  for (const raw of lines.slice(1)) {
    const line = raw.trim();
    if (line.startsWith("<defs")) inDefs = true;
    if (line.startsWith("</defs")) {
      inDefs = false;
      continue;
    }
    if (inDefs) continue;
    if (line.startsWith("<g ") || line === "<g>") {
      stack.push({
        fill: attr(line, "fill"),
        size: num(line, "font-size"),
        halo: attr(line, "paint-order") === "stroke" ? true : undefined,
        weight: num(line, "font-weight"),
      });
      continue;
    }
    if (line.startsWith("</g>")) {
      stack.pop();
      continue;
    }
    if (line.startsWith("<rect")) {
      const fill = attr(line, "fill") ?? inherited("fill");
      if (attr(line, "width") === "100%") {
        scan.plate = isHex(fill) ? fill : null;
        continue;
      }
      // The plot well is paper, not a mark.
      if (/data-plot-bg=/.test(line)) continue;
      const w = num(line, "width") ?? 0;
      const h = num(line, "height") ?? 0;
      const rx = num(line, "rx");
      if (rx !== undefined) scan.rects.push({ rx, w, h, line });
      if (isHex(fill)) {
        scan.shapes.push({
          kind: "rect",
          x: num(line, "x") ?? 0,
          y: num(line, "y") ?? 0,
          w,
          h,
          fill,
          opacity: num(line, "fill-opacity") ?? 1,
          line,
        });
      }
      continue;
    }
    // Bars and other data marks drawn as paths carry data-y; areas and slices do not count.
    if (line.startsWith("<path") && /data-y=/.test(line) && !/data-label=/.test(line)) {
      const fill = attr(line, "fill");
      const box = pathBox(attr(line, "d") ?? "");
      if (isHex(fill) && box) {
        scan.shapes.push({ kind: "path", ...box, fill, opacity: num(line, "fill-opacity") ?? 1, line });
      }
      continue;
    }
    if (line.startsWith("<text")) {
      const body = line.replace(/<title>[\s\S]*?<\/title>/g, "");
      const decode = (t: string) =>
        t
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'");
      const fill = attr(line, "fill") ?? inherited("fill");
      const size = num(line, "font-size") ?? inherited("size") ?? 12;
      const weight = num(line, "font-weight") ?? inherited("weight") ?? 400;
      // Inline tspans at their own size (the title's " · unit") ride on the last line.
      let inlineExtra = 0;
      let plain = body;
      for (const m of body.matchAll(/<tspan(?![^>]*\sx=)[^>]*font-size="([\d.]+)"[^>]*>([^<]*)<\/tspan>/g)) {
        inlineExtra += textWidth(decode(m[2]!), Number(m[1]));
        plain = plain.replace(m[0], "");
      }
      // Tspans that set their own x are separate lines.
      const lineTexts = /<tspan[^>]*\sx=/.test(plain)
        ? [...plain.matchAll(/<tspan[^>]*\sx=[^>]*>([^<]*)<\/tspan>/g)].map((m) => decode(m[1]!))
        : [decode(plain.replace(/<[^>]+>/g, ""))];
      const widths = lineTexts.map(
        (t, i) => textWidth(t, size, weight) + (i === lineTexts.length - 1 ? inlineExtra : 0),
      );
      const widest = widths.indexOf(Math.max(...widths));
      const measured = lineTexts[widest] ?? "";
      if (!isHex(fill) || lineTexts.join("").trim() === "") continue;
      inlineExtra = widest === lineTexts.length - 1 ? inlineExtra : 0;
      scan.labels.push({
        text: measured,
        weight,
        inlineExtra,
        x: num(line, "x") ?? 0,
        y: num(line, "y") ?? 0,
        anchor: (attr(line, "text-anchor") as Label["anchor"]) ?? "start",
        size,
        fill,
        middle: attr(line, "dominant-baseline") === "middle",
        hanging: attr(line, "dominant-baseline") === "hanging",
        rotated: /rotate\(-90/.test(attr(line, "transform") ?? ""),
        halo: attr(line, "paint-order") === "stroke" || inherited("halo") === true,
        line,
      });
    }
  }
  return scan;
}

function channels(hex: string): [number, number, number] {
  const body = hex.replace("#", "");
  const full = body.length === 3 ? body.replace(/./g, "$&$&") : body;
  const n = Number.parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function linear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

/** A fill at `opacity` over `paper`, as one opaque color. */
export function composite(fill: string, opacity: number, paper: string): string {
  const a = channels(fill);
  const b = channels(paper);
  const mix = a.map((c, i) => Math.round(c * opacity + b[i]! * (1 - opacity)));
  return `#${mix.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

/** WCAG contrast ratio between two opaque colors. */
export function contrast(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, bl] = channels(hex).map(linear) as [number, number, number];
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const la = lum(a);
  const lb = lum(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Horizontal extent of a label, from the same width estimate layout uses. */
export function labelBox(label: Label): { left: number; right: number; top: number; bottom: number } {
  const w = textWidth(label.text, label.size, label.weight) + label.inlineExtra;
  if (label.rotated) {
    return {
      left: label.x - label.size / 2,
      right: label.x + label.size / 2,
      top: label.y - w / 2,
      bottom: label.y + w / 2,
    };
  }
  const left =
    label.anchor === "middle" ? label.x - w / 2 : label.anchor === "end" ? label.x - w : label.x;
  const top = label.middle
    ? label.y - label.size / 2
    : label.hanging
      ? label.y
      : label.y - label.size * 0.8;
  return { left, right: left + w, top, bottom: top + label.size };
}

/** The topmost opaque-enough shape under the label's center, if any. */
export function shapeUnder(scan: Scan, label: Label): Shape | undefined {
  if (label.halo) return undefined;
  const box = labelBox(label);
  const cx = (box.left + box.right) / 2;
  const cy = (box.top + box.bottom) / 2;
  const hits = scan.shapes.filter(
    (s) => cx >= s.x && cx <= s.x + s.w && cy >= s.y && cy <= s.y + s.h && s.opacity >= 0.2,
  );
  return hits[hits.length - 1];
}
