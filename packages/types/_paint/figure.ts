import type { ChartIR } from "@markvis/ir";
import { setTitleLineCount } from "./layout.js";
import { textWidth, truncateLabel } from "./text.js";
import {
  INK,
  MARGIN,
  STRUCTURE_OPACITY,
  SVG_WIDTH,
  TITLE,
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

function unitText(unit?: string): string {
  return unit?.trim() ?? "";
}

/** " · unit" when the unit rides the last title line; "" otherwise. */
function unitSuffix(unit?: string): string {
  const trimmed = unitText(unit);
  return trimmed === "" || TITLE.unit !== "inline" ? "" : ` · ${trimmed}`;
}

/** True when the unit sits on its own line under the title. */
function hasSubtitle(unit?: string): boolean {
  return TITLE.unit === "subtitle" && unitText(unit) !== "";
}

/** Title as painted: the theme may set it in capitals. */
function titleCase(text: string): string {
  return TITLE.case === "upper" ? text.toUpperCase() : text;
}

/** Title width including theme letter-spacing. */
function titleWidth(text: string): number {
  const tracking = TITLE.tracking * TYPE.title.size * text.length;
  return textWidth(text, TYPE.title.size, TYPE.title.weight) + tracking;
}

/** A centered title wraps across the full frame, not from the plot left. */
function wrapX(x: number): number {
  return TITLE.align === "middle" ? MARGIN.left : x;
}

function titleWords(text: string, maxWidth: number): string[] {
  const words: string[] = [];
  for (const part of text.split(/\s+/)) {
    if (part === "") {
      continue;
    }
    if (titleWidth(part) <= maxWidth) {
      words.push(part);
      continue;
    }
    let chunk = "";
    for (const char of part) {
      const next = chunk + char;
      if (chunk !== "" && titleWidth(next) > maxWidth) {
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
  const maxWidth = titleWrapWidth(wrapX(x));
  const suffixW =
    unitSuffix(unit) === "" ? 0 : textWidth(unitSuffix(unit), TYPE.unit.size, TYPE.unit.weight);
  const lastMax = Math.max(12, maxWidth - suffixW);
  const cap = 4;
  const source = titleCase(title.trim());
  if (source === "") {
    return [""];
  }
  const words = titleWords(source, maxWidth);
  const lines: string[] = [];
  let i = 0;
  while (i < words.length && lines.length < cap) {
    const rest = words.slice(i).join(" ");
    const lastSlot = lines.length === cap - 1;
    if (titleWidth(rest) <= lastMax) {
      lines.push(rest);
      break;
    }
    if (lastSlot) {
      lines.push(truncateLabel(rest, lastMax, TYPE.title.size, TYPE.title.weight));
      break;
    }
    let taken = "";
    let j = i;
    while (j < words.length) {
      const nextWord = words[j]!;
      const candidate = taken === "" ? nextWord : `${taken} ${nextWord}`;
      if (titleWidth(candidate) > maxWidth) {
        break;
      }
      taken = candidate;
      j += 1;
    }
    if (taken === "") {
      lines.push(truncateLabel(words[i]!, maxWidth, TYPE.title.size, TYPE.title.weight));
      i += 1;
      continue;
    }
    if (j >= words.length && titleWidth(taken) > lastMax) {
      if (j > i + 1) {
        j -= 1;
        taken = words.slice(i, j).join(" ");
      } else {
        lines.push(truncateLabel(taken, lastMax, TYPE.title.size, TYPE.title.weight));
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
  return wrapTitle(title, x, unit).length + (hasSubtitle(unit) ? 1 : 0);
}

/** Remember the line count for the x and unit the title will actually use. */
export function reserveTitle(title: string, x: number, unit?: string): void {
  setTitleLineCount(countTitleLines(title, x, unit));
}

/**
 * Drawn at the plot left, or centered on the frame when the theme says so.
 * A long title wraps. The unit rides the last line or sits on its own line.
 */
export function drawTitle(title: string, x: number, unit?: string): string {
  const lines = wrapTitle(title, x, unit);
  const middle = TITLE.align === "middle";
  const tx = middle ? SVG_WIDTH / 2 : x;
  const anchor = middle ? "middle" : "start";
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
      return `<tspan x="${fmtPx(tx)}" dy="${dy}">${escapeXml(line)}</tspan>${tail}`;
    })
    .join("");
  const parts = [
    `  <text ${attrs({
      x: fmtPx(tx),
      y: TITLE_BASELINE,
      "text-anchor": anchor,
      "font-size": TYPE.title.size,
      "font-weight": TYPE.title.weight,
      "letter-spacing": TITLE.tracking === 0 ? undefined : `${TITLE.tracking}em`,
      fill: TYPE.title.fill,
    })}><title>${escapeXml(title)}</title>${body}</text>`,
  ];
  if (hasSubtitle(unit)) {
    parts.push(
      `  <text ${attrs({
        x: fmtPx(tx),
        y: TITLE_BASELINE + (lines.length - 1) * lineH + TYPE.unit.size + 8,
        "text-anchor": anchor,
        "font-size": TYPE.unit.size,
        "font-weight": TYPE.unit.weight,
        fill: TYPE.unit.fill,
        "data-subtitle": "1",
      })}>${escapeXml(unitText(unit))}</text>`,
    );
  }
  if (TITLE_RULE) {
    // Under the last title line, and under the subtitle when there is one.
    const ruleY =
      TITLE_BASELINE +
      (lines.length - 1 + (hasSubtitle(unit) ? 1 : 0)) * lineH +
      6;
    parts.push(
      `  <line ${attrs({
        x1: fmtPx(MARGIN.left),
        x2: fmtPx(SVG_WIDTH - MARGIN.right),
        y1: fmtPx(ruleY),
        y2: fmtPx(ruleY),
        stroke: INK,
        "stroke-opacity": STRUCTURE_OPACITY,
        "stroke-width": 1,
        "data-title-rule": "1",
      })}/>`,
    );
  }
  return parts.join("\n");
}
