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

export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) {
    return "";
  }
  if (Object.is(n, -0) || n === 0) {
    return "0";
  }
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  const rules: { min: number; div: number; suffix: string }[] = [
    { min: 1e12, div: 1e12, suffix: "T" },
    { min: 1e9, div: 1e9, suffix: "B" },
    { min: 1e6, div: 1e6, suffix: "M" },
    { min: 1e3, div: 1e3, suffix: "k" },
  ];
  for (const rule of rules) {
    if (abs >= rule.min) {
      return sign + trimFixed(abs / rule.div) + rule.suffix;
    }
  }
  return sign + trimFixed(abs);
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
