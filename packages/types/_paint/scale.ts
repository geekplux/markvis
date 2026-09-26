import { COMPACT_SPAN } from "./tokens.js";

export function cleanFloat(n: number): number {
  if (!Number.isFinite(n)) {
    return 0;
  }
  const rounded = Number(n.toPrecision(12));
  return Object.is(rounded, -0) ? 0 : rounded;
}

function niceStep(rough: number): number {
  if (!(rough > 0) || !Number.isFinite(rough)) {
    return 1;
  }
  const exp = Math.floor(Math.log10(rough));
  const pow = 10 ** exp;
  const frac = rough / pow;
  let niceFrac: number;
  if (frac <= 1) {
    niceFrac = 1;
  } else if (frac <= 2) {
    niceFrac = 2;
  } else if (frac <= 5) {
    niceFrac = 5;
  } else {
    niceFrac = 10;
  }
  return niceFrac * pow;
}

/** Nice ticks covering [min, max], targeting `count` intervals. */
export function niceTicks(min: number, max: number, count = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return [0, 1];
  }
  if (min > max) {
    return niceTicks(max, min, count);
  }
  if (min === max) {
    if (min === 0) {
      return [0, 1];
    }
    const pad = Math.abs(min) * 0.1 || 1;
    return niceTicks(min - pad, max + pad, count);
  }
  const span = max - min;
  const step = niceStep(span / Math.max(count - 1, 1));
  const startN = Math.floor(min / step);
  const endN = Math.ceil(max / step);
  const ticks: number[] = [];
  for (let i = startN; i <= endN; i++) {
    ticks.push(cleanFloat(i * step));
  }
  return ticks.length > 0 ? ticks : [min, max];
}

export function scaleLinear(
  domain: [number, number],
  range: [number, number],
): (value: number) => number {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const dSpan = d1 - d0;
  const rSpan = r1 - r0;
  return (value: number) => {
    if (dSpan === 0) {
      return (r0 + r1) / 2;
    }
    return r0 + ((value - d0) / dSpan) * rSpan;
  };
}

function withCommas(digits: string): string {
  if (digits.length <= 3) {
    return digits;
  }
  const parts: string[] = [];
  for (let i = digits.length; i > 0; i -= 3) {
    parts.unshift(digits.slice(Math.max(0, i - 3), i));
  }
  return parts.join(",");
}

function groupNumber(body: string): string {
  const dot = body.indexOf(".");
  if (dot === -1) {
    return withCommas(body);
  }
  const intPart = body.slice(0, dot);
  const frac = body.slice(dot);
  return (intPart.length > 3 ? withCommas(intPart) : intPart) + frac;
}

function scientific(abs: number): string {
  const exp = Math.floor(Math.log10(abs));
  const mantissa = abs / 10 ** exp;
  let body = mantissa.toPrecision(3);
  if (body.includes("e") || body.includes("E")) {
    body = mantissa.toFixed(2);
  }
  body = body.replace(/\.?0+$/, "");
  if (body === "10") {
    return `1e+${exp + 1}`;
  }
  const suffix = exp >= 0 ? `e+${exp}` : `e${exp}`;
  return `${body}${suffix}`;
}

function formatAbs(abs: number): string {
  if (abs === 0) {
    return "0";
  }
  if (abs >= 1e15 || abs < 1e-4) {
    return scientific(abs);
  }
  const exp = Math.floor(Math.log10(abs));
  const digits = Math.min(8, Math.max(0, 5 - exp));
  let body = abs.toFixed(digits);
  if (Number(body) === 0) {
    return scientific(abs);
  }
  if (body.includes(".")) {
    body = body.replace(/0+$/, "").replace(/\.$/, "");
  }
  return groupNumber(body);
}

/**
 * Shared deterministic formatter.
 * Neighboring small values stay distinct (`0.001`, `0.002`, `0.003`).
 * Negative zero is `0`. Compact suffixes are part of the label.
 */
export function formatNumber(n: number): string {
  if (!Number.isFinite(n) || Object.is(n, -0) || n === 0) {
    return n === 0 || Object.is(n, -0) ? "0" : "";
  }
  const sign = n < 0 ? "-" : "";
  return sign + formatAbs(Math.abs(n));
}

function formatFixed(n: number, decimals: number): string {
  if (!Number.isFinite(n) || Object.is(n, -0) || n === 0) {
    return "0";
  }
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  const rounded = Number(abs.toFixed(Math.min(decimals, 12)));
  if (rounded === 0) {
    return formatNumber(n);
  }
  if (abs >= 1e15 || (decimals > 6 && abs < 1e-4)) {
    return sign + scientific(abs);
  }
  let body = abs.toFixed(Math.min(decimals, 12));
  if (body.includes(".")) {
    body = body.replace(/0+$/, "").replace(/\.$/, "");
  }
  return sign + groupNumber(body);
}

function neighborClash(labels: string[]): boolean {
  for (let i = 1; i < labels.length; i++) {
    if (labels[i] === labels[i - 1]) {
      return true;
    }
  }
  return false;
}

/** Tick labels that stay distinct, including a gap smaller than 1. */
export function labelTicks(ticks: number[]): string[] {
  if (ticks.length === 0) {
    return [];
  }
  let gap = Infinity;
  for (let i = 1; i < ticks.length; i++) {
    const delta = Math.abs(ticks[i]! - ticks[i - 1]!);
    if (delta > 0 && delta < gap) {
      gap = delta;
    }
  }
  let decimals = 0;
  if (Number.isFinite(gap) && gap < 1) {
    decimals = Math.min(12, Math.max(0, Math.ceil(-Math.log10(gap) - 1e-12)));
  }
  const paint = (digits: number) => ticks.map((tick) => formatFixed(tick, digits));
  let labels = paint(decimals);
  const hides = (rendered: string[]) =>
    ticks.some((tick, i) => tick !== 0 && rendered[i] === "0");
  while ((neighborClash(labels) || hides(labels)) && decimals < 12) {
    decimals += 1;
    labels = paint(decimals);
  }
  if (neighborClash(labels) || hides(labels)) {
    return ticks.map((tick) => formatNumber(tick));
  }
  return labels;
}

export type CompactScale = {
  divisor: number;
  suffix: "k" | "M";
};

/**
 * Prefer full numbers + authored unit over auto-k/M.
 * Title unit, y-ticks, and bar value labels share one scale: ticks use
 * `formatNumber` (e.g. `200,000`), title keeps the authored unit (`USD`),
 * values stay full (`420,000`). Auto-appending `k`/`M` is disabled — it made
 * title/ticks say `USD k` / `200` while labels stayed `420,000`.
 * `formatTick` / `unitWithCompact` still honor an explicit CompactScale.
 */
export function compactScale(
  _ticks: number[],
  _span: number,
): CompactScale | null {
  void COMPACT_SPAN;
  return null;
}

export function formatTick(n: number, compact: CompactScale | null): string {
  if (compact) {
    return formatNumber(n / compact.divisor);
  }
  return formatNumber(n);
}

export function unitWithCompact(
  unit: string | undefined,
  compact: CompactScale | null,
): string | undefined {
  if (!compact) {
    return unit;
  }
  if (!unit) {
    return compact.suffix;
  }
  const trimmed = unit.trim();
  const parts = trimmed.split(/\s+/);
  const last = parts[parts.length - 1];
  if (last === compact.suffix) {
    return trimmed;
  }
  return `${trimmed} ${compact.suffix}`;
}

export function yExtent(
  values: number[],
  forceZero: boolean,
): [number, number] {
  const finite = values.filter((v) => Number.isFinite(v));
  if (finite.length === 0) {
    return [0, 1];
  }
  let lo = Math.min(...finite);
  let hi = Math.max(...finite);
  if (forceZero) {
    if (lo > 0) {
      lo = 0;
    }
    if (hi < 0) {
      hi = 0;
    }
  }
  if (lo === hi) {
    if (lo === 0) {
      return [0, 1];
    }
    const pad = Math.abs(lo) * 0.1 || 1;
    return [lo - pad, hi + pad];
  }
  if (!forceZero) {
    const pad = (hi - lo) * 0.08;
    lo -= pad;
    hi += pad;
  }
  return [lo, hi];
}

export function xExtent(
  values: number[],
  padRatio: number,
): [number, number] {
  const finite = values.filter((v) => Number.isFinite(v));
  if (finite.length === 0) {
    return [0, 1];
  }
  let lo = Math.min(...finite);
  let hi = Math.max(...finite);
  if (lo === hi) {
    return [lo - 1, hi + 1];
  }
  const pad = (hi - lo) * padRatio;
  return [lo - pad, hi + pad];
}
