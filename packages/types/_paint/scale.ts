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

/** Integer ≥ 1000 → thousands separators. Never `1.2k` / `200k` here. */
export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) {
    return "";
  }
  if (Object.is(n, -0) || n === 0) {
    return "0";
  }
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (Math.abs(abs - Math.round(abs)) < 1e-9) {
    return sign + withCommas(String(Math.round(abs)));
  }
  const trimmed = trimFixed(abs);
  const dot = trimmed.indexOf(".");
  if (dot === -1) {
    return sign + withCommas(trimmed);
  }
  const intPart = trimmed.slice(0, dot);
  const frac = trimmed.slice(dot);
  return sign + (intPart.length > 3 ? withCommas(intPart) : intPart) + frac;
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

function trimFixed(n: number): string {
  if (Math.abs(n - Math.round(n)) < 1e-9) {
    return String(Math.round(n));
  }
  return n.toFixed(2).replace(/\.?0+$/, "");
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
