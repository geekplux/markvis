import { METRIC_CHARS, METRICS } from "./metrics.js";
import { FONT } from "./tokens.js";
/**
 * Deterministic width estimate. Latin and similar scripts use 0.62em.
 * CJK and related wide scripts (code point above U+2E80) use 1em.
 * This is not an operating-system font measurement. The theme FONT stack
 * is the typeface the estimate stands in for.
 */
const INDEX = new Map([...METRIC_CHARS].map((char, i) => [char, i]));

type Face = keyof typeof METRICS;

/** Which measured face a font stack renders in. */
export function faceOf(family: string): Face {
  const f = family.toLowerCase();
  if (f.includes("mono")) return "mono";
  if (f.replace(/^["']/, "").startsWith("lucida")) return "lucida";
  return "sans";
}

function advance(table: readonly number[], char: string): number {
  const i = INDEX.get(char);
  return i === undefined ? 0.62 : table[i]! / 1000;
}

/**
 * Advance width from measured per-character widths for the face and weight
 * in use. `family` defaults to the theme's FONT; tick and value labels pass
 * FONT_NUMERIC. Ideographs count one em.
 */
export function textWidth(
  text: string,
  fontSize: number,
  weight = 400,
  family: string = FONT,
): number {
  const tables = METRICS[faceOf(family)];
  // 500 sits between the measured regular and semibold widths.
  const lo = weight >= 800 ? tables[800] : weight >= 700 ? tables[700] : weight >= 600 ? tables[600] : tables[400];
  const hi = weight > 400 && weight < 600 ? tables[600] : lo;
  let em = 0;
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    em += code > 0x2e80 ? 1 : (advance(lo, char) + advance(hi, char)) / 2;
  }
  return em * fontSize;
}

export function truncateLabel(
  text: string,
  maxPx: number,
  fontSize: number,
  weight = 400,
  family: string = FONT,
): string {
  if (textWidth(text, fontSize, weight, family) <= maxPx) {
    return text;
  }
  let out = text;
  while (out.length > 0 && textWidth(`${out}…`, fontSize, weight, family) > maxPx) {
    out = out.slice(0, -1);
  }
  const trimmed = out.trimEnd();
  return trimmed.length === 0 ? "…" : `${trimmed}…`;
}

/** Half a pixel covers estimator noise when a reserved margin is recomputed. */
const FIT_SLOP = 0.5;

/**
 * Keep one line inside the frame. Shift the anchor before truncating.
 * A label that already fits centered is returned unchanged.
 */
export function placeHorizontalLabel(
  x: number,
  text: string,
  fontSize: number,
  frameWidth: number,
  pad = 8,
): { x: number; anchor: "start" | "middle" | "end"; text: string } {
  const width = textWidth(text, fontSize);
  const rightEdge = frameWidth - pad;
  if (!(width <= rightEdge - pad + FIT_SLOP)) {
    return {
      x: pad,
      anchor: "start",
      text: truncateLabel(text, Math.max(0, rightEdge - pad), fontSize),
    };
  }
  if (x - width / 2 >= pad - FIT_SLOP && x + width / 2 <= rightEdge + FIT_SLOP) {
    return { x, anchor: "middle", text };
  }
  if (x + width / 2 > rightEdge && x - width >= pad - FIT_SLOP) {
    return { x: Math.min(x, rightEdge), anchor: "end", text };
  }
  if (x - width / 2 < pad && x + width <= rightEdge + FIT_SLOP) {
    return { x: Math.max(x, pad), anchor: "start", text };
  }
  if (x + width / 2 > rightEdge) {
    return { x: rightEdge, anchor: "end", text };
  }
  return { x: pad, anchor: "start", text };
}

export type WrappedText = {
  lines: string[];
  truncated: boolean;
};

/** Greedy word wrap. A token wider than the line is split by character. */
export function wrapText(
  text: string,
  fontSize: number,
  maxWidth: number,
  maxLines = 4,
  weight = 400,
  family: string = FONT,
): WrappedText {
  const limit = Math.max(1, maxLines);
  if (text.length === 0) {
    return { lines: [""], truncated: false };
  }
  if (!(maxWidth > 0) || textWidth(text, fontSize, weight, family) <= maxWidth) {
    return { lines: [text], truncated: false };
  }

  const words: string[] = [];
  let cut = false;
  for (const part of text.split(/\s+/)) {
    if (part === "") {
      continue;
    }
    if (textWidth(part, fontSize, weight, family) <= maxWidth) {
      words.push(part);
      continue;
    }
    // A long Latin word keeps its letters together and ends in "…"; text
    // without spaces (CJK) can only wrap between characters.
    if (![...part].some((char) => (char.codePointAt(0) ?? 0) > 0x2e80)) {
      words.push(truncateLabel(part, maxWidth, fontSize, weight, family));
      cut = true;
      continue;
    }
    let chunk = "";
    for (const char of part) {
      const next = chunk + char;
      if (chunk !== "" && textWidth(next, fontSize, weight, family) > maxWidth) {
        words.push(chunk);
        chunk = char;
      } else {
        chunk = next;
      }
    }
    if (chunk !== "") {
      words.push(chunk);
    }
  }

  const lines: string[] = [];
  let current = "";
  let i = 0;
  while (i < words.length) {
    const word = words[i]!;
    const candidate = current === "" ? word : `${current} ${word}`;
    if (textWidth(candidate, fontSize, weight, family) <= maxWidth) {
      current = candidate;
      i += 1;
      continue;
    }
    if (lines.length === limit - 1) {
      break;
    }
    if (current !== "") {
      lines.push(current);
      current = "";
      continue;
    }
    lines.push(word);
    i += 1;
    current = "";
  }

  if (i >= words.length) {
    if (current !== "") {
      lines.push(current);
    }
    return {
      lines: lines.length > 0 ? lines : [text],
      truncated: cut,
    };
  }

  const rest = [current, ...words.slice(i)].filter((part) => part !== "").join(" ");
  const last = truncateLabel(rest, maxWidth, fontSize, weight, family);
  lines.push(last);
  return { lines: lines.slice(0, limit), truncated: last !== rest };
}
