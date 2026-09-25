import type { ChartIR } from "@markvis/ir";
import { setTitleLineCount } from "./layout.js";
import { textWidth, truncateLabel } from "./text.js";
import {
  INK,
  MARGIN,
  STRUCTURE_OPACITY,
  SVG_WIDTH,
  TITLE_BASELINE,
  TITLE_RULE,
  TYPE,
} from "./tokens.js";
import { attrs, escapeXml, fmtPx } from "./xml.js";

/** Visible title from IR; never a chart-type word. Empty → y field. */
export function visibleTitle(chart: ChartIR): string {
  const title = chart.title.trim();
  if (title.length > 0) {
    return title;
  }
  return chart.y ?? "";
}

/** Width of a title that starts at `x` and stops before the right margin. */
export function titleWrapWidth(x = MARGIN.left): number {
  return Math.max(80, SVG_WIDTH - x - MARGIN.right - 4);
}

function unitSuffix(unit?: string): string {
  const trimmed = unit?.trim() ?? "";
  return trimmed === "" ? "" : ` · ${trimmed}`;
}

function titleWords(text: string, maxWidth: number): string[] {
  const words: string[] = [];
  for (const part of text.split(/\s+/)) {
    if (part === "") {
      continue;
    }
    if (textWidth(part, TYPE.title.size) <= maxWidth) {
      words.push(part);
      continue;
    }
    let chunk = "";
    for (const char of part) {
      const next = chunk + char;
      if (chunk !== "" && textWidth(next, TYPE.title.size) > maxWidth) {
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
  return words;
}

/**
 * Wrap a title for the x it will be drawn at.
 * The unit suffix shares the last line, so that line is shorter.
 */
export function wrapTitle(title: string, x: number, unit?: string): string[] {
  const maxWidth = titleWrapWidth(x);
  const suffixW =
    unitSuffix(unit) === "" ? 0 : textWidth(unitSuffix(unit), TYPE.unit.size);
  const lastMax = Math.max(12, maxWidth - suffixW);
  const cap = 4;
  const source = title.trim();
  if (source === "") {
    return [""];
  }
  const words = titleWords(source, maxWidth);
  const lines: string[] = [];
  let i = 0;
  while (i < words.length && lines.length < cap) {
    const rest = words.slice(i).join(" ");
    const lastSlot = lines.length === cap - 1;
    if (textWidth(rest, TYPE.title.size) <= lastMax) {
      lines.push(rest);
      break;
    }
    if (lastSlot) {
      lines.push(truncateLabel(rest, lastMax, TYPE.title.size));
      break;
    }
    let taken = "";
    let j = i;
    while (j < words.length) {
      const nextWord = words[j]!;
      const candidate = taken === "" ? nextWord : `${taken} ${nextWord}`;
      if (textWidth(candidate, TYPE.title.size) > maxWidth) {
        break;
      }
      taken = candidate;
      j += 1;
    }
    if (taken === "") {
      lines.push(truncateLabel(words[i]!, maxWidth, TYPE.title.size));
      i += 1;
      continue;
    }
    if (j >= words.length && textWidth(taken, TYPE.title.size) > lastMax) {
      if (j > i + 1) {
        j -= 1;
        taken = words.slice(i, j).join(" ");
      } else {
        lines.push(truncateLabel(taken, lastMax, TYPE.title.size));
        break;
      }
    }
    lines.push(taken);
    i = j;
  }
  return lines.length > 0 ? lines : [""];
}

/** How many title lines the frame should reserve for this string at `x`. */
export function countTitleLines(
  title: string,
  x = MARGIN.left,
  unit?: string,
): number {
  return wrapTitle(title, x, unit).length;
}

/** Remember the line count for the x and unit the title will actually use. */
export function reserveTitle(title: string, x: number, unit?: string): void {
  setTitleLineCount(countTitleLines(title, x, unit));
}

/** Left-aligned to plot left. A long title wraps. Unit rides the last line. */
export function drawTitle(title: string, x: number, unit?: string): string {
  const lines = wrapTitle(title, x, unit);
  const lineH = TYPE.title.size + 6;
  const suffix = unitSuffix(unit);
  const unitSpan =
    suffix === ""
      ? ""
      : `<tspan font-size="${TYPE.unit.size}" font-weight="${TYPE.unit.weight}" fill="${TYPE.unit.fill}">${escapeXml(suffix)}</tspan>`;
  const body = lines
    .map((line, i) => {
      const tail = i === lines.length - 1 ? unitSpan : "";
      if (lines.length === 1) {
        return `${escapeXml(line)}${tail}`;
      }
      const dy = i === 0 ? 0 : lineH;
      return `<tspan x="${fmtPx(x)}" dy="${dy}">${escapeXml(line)}</tspan>${tail}`;
    })
    .join("");
  const text = `  <text ${attrs({
    x: fmtPx(x),
    y: TITLE_BASELINE,
    "text-anchor": "start",
    "font-size": TYPE.title.size,
    "font-weight": TYPE.title.weight,
    fill: TYPE.title.fill,
  })}><title>${escapeXml(title)}</title>${body}</text>`;
  if (!TITLE_RULE) {
    return text;
  }
  const rule = `  <line ${attrs({
    x1: fmtPx(MARGIN.left),
    x2: fmtPx(SVG_WIDTH - MARGIN.right),
    y1: fmtPx(TITLE_BASELINE + 6),
    y2: fmtPx(TITLE_BASELINE + 6),
    stroke: INK,
    "stroke-opacity": STRUCTURE_OPACITY,
    "stroke-width": 1,
    "data-title-rule": "1",
  })}/>`;
  return `${text}\n${rule}`;
}
