import type { ChartIR } from "@markvis/ir";
import { rampFill } from "./color.js";
import { loadRows } from "./data.js";
import {
  civilFromDays,
  daysFromCivil,
  parseIsoDate,
  weekdayMonday0,
} from "./date.js";
import { drawTitle, reserveTitle, visibleTitle } from "./figure.js";
import { titleBlockTop, type Painted } from "./layout.js";
import { formatNumber } from "./scale.js";
import { textWidth } from "./text.js";
import {
  FONT_NUMERIC,
  INK,
  MARGIN,
  SEMANTIC,
  SVG_WIDTH,
  TYPE,
} from "./tokens.js";
import { attrs, escapeXml, fmtPx } from "./xml.js";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAY_LABELS: [number, string][] = [
  [0, "Mon"],
  [2, "Wed"],
  [4, "Fri"],
];
/** A day with no row: present in the range, not in the table. */
const EMPTY_OPACITY = 0.06;

type Band = { year: number; start: number; end: number; weekStart: number; weeks: number };

/**
 * One cell per day: weeks run left to right, Monday to Sunday top to bottom,
 * one band per year. Position comes from the date, never from row order.
 * A day absent from the table is a faint empty cell; a day whose value is
 * empty is hatched as missing, never drawn as zero. Color uses the shared
 * sequential ramp; `min` / `max` fix its domain.
 */
export function renderCalendar(chart: ChartIR, svgId: string): Painted {
  const values = new Map<number, number | null>();
  for (const row of loadRows(chart)) {
    const date = parseIsoDate(row.xLabel);
    if (date) {
      values.set(daysFromCivil(date), row.y);
    }
  }
  const days = [...values.keys()].sort((a, b) => a - b);
  const first = days[0] ?? 0;
  const last = days[days.length - 1] ?? 0;
  const bands: Band[] = [];
  for (let year = civilFromDays(first).year; year <= civilFromDays(last).year; year++) {
    const start = Math.max(first, daysFromCivil({ year, month: 1, day: 1 }));
    const end = Math.min(last, daysFromCivil({ year, month: 12, day: 31 }));
    const weekStart = start - weekdayMonday0(start);
    bands.push({ year, start, end, weekStart, weeks: Math.floor((end - weekStart) / 7) + 1 });
  }
  const present = [...values.values()].filter((v): v is number => v !== null);
  const lo = chart.min ?? (present.length > 0 ? Math.min(...present) : 0);
  const hi = chart.max ?? (present.length > 0 ? Math.max(...present) : 1);
  const shade = (value: number) => rampFill(hi === lo ? 1 : (value - lo) / (hi - lo));

  const gutter = Math.max(...WEEKDAY_LABELS.map(([, label]) => textWidth(label, TYPE.tick.size))) + 10;
  const left = MARGIN.left + gutter;
  const maxWeeks = Math.max(1, ...bands.map((band) => band.weeks));
  const step = Math.max(7, Math.min(18, Math.floor((SVG_WIDTH - left - MARGIN.right) / maxWeeks)));
  const cell = step - (step >= 10 ? 2 : 1);
  const monthRow = TYPE.tick.size + 8;
  const bandH = monthRow + 7 * step + 18;

  reserveTitle(visibleTitle(chart), MARGIN.left, chart.unit);
  const top = titleBlockTop(0);
  const legendY = top + bands.length * bandH + 4;
  const height = Math.ceil(legendY + TYPE.tick.size + 24);
  const patternId = `${svgId}-missing`;
  const lines: string[] = [
    drawTitle(visibleTitle(chart), MARGIN.left, chart.unit),
    `  <defs>`,
    `    <pattern ${attrs({ id: patternId, patternUnits: "userSpaceOnUse", width: 4, height: 4 })}>`,
    `      <rect width="4" height="4" fill="${SEMANTIC.rampLow}"/>`,
    `      <path d="M0 4 L4 0" stroke="${SEMANTIC.missing}" stroke-width="1"/>`,
    `    </pattern>`,
    `  </defs>`,
  ];
  const labels: string[] = [];

  bands.forEach((band, bi) => {
    const gridTop = top + bi * bandH + monthRow;
    const colX = (day: number) => left + Math.floor((day - band.weekStart) / 7) * step;
    const rowY = (day: number) => gridTop + weekdayMonday0(day) * step;
    if (bands.length > 1) {
      labels.push(
        `    <text ${attrs({
          x: fmtPx(MARGIN.left),
          y: fmtPx(gridTop - 8),
          "font-weight": 600,
          fill: TYPE.title.fill,
          "data-year": band.year,
        })}>${band.year}</text>`,
      );
    }
    let lastLabelX = -Infinity;
    for (let day = band.start; day <= band.end; day++) {
      const date = civilFromDays(day);
      if (day !== band.start && date.day !== 1) {
        continue;
      }
      const x = colX(day) + (weekdayMonday0(day) === 0 ? 0 : step);
      const label = MONTHS[date.month - 1]!;
      if (x - lastLabelX < textWidth("Mmm", TYPE.tick.size) + 4 || x > left + band.weeks * step - 8) {
        continue;
      }
      lastLabelX = x;
      labels.push(
        `    <text ${attrs({ x: fmtPx(x), y: fmtPx(gridTop - 8), "data-month": label })}>${label}</text>`,
      );
    }
    for (const [row, label] of WEEKDAY_LABELS) {
      labels.push(
        `    <text ${attrs({
          x: fmtPx(left - 8),
          y: fmtPx(gridTop + row * step + cell / 2),
          "text-anchor": "end",
          "dominant-baseline": "middle",
        })}>${label}</text>`,
      );
    }
    lines.push(`  <g ${attrs({ "data-year": band.year })}>`);
    for (let day = band.start; day <= band.end; day++) {
      const known = values.has(day);
      const value = values.get(day);
      const date = civilFromDays(day);
      const iso = `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
      const fill = !known
        ? INK
        : value === null || value === undefined
          ? `url(#${patternId})`
          : shade(value);
      lines.push(
        `    <rect ${attrs({
          x: fmtPx(colX(day)),
          y: fmtPx(rowY(day)),
          width: cell,
          height: cell,
          rx: cell >= 10 ? 2 : 1,
          fill,
          "fill-opacity": known ? undefined : EMPTY_OPACITY,
          "data-date": iso,
          "data-y": typeof value === "number" ? formatNumber(value) : undefined,
          "data-missing": known && value === null ? "1" : undefined,
        })}/>`,
      );
    }
    lines.push(`  </g>`);
  });

  // Color key: low value, five steps, high value.
  const keyLo = formatNumber(lo);
  const keyX = left + textWidth(keyLo, TYPE.tick.size) + 6;
  labels.push(
    `    <text ${attrs({ x: fmtPx(left), y: fmtPx(legendY + cell - 1), "data-key": "low" })}>${escapeXml(keyLo)}</text>`,
  );
  const steps = [0, 0.25, 0.5, 0.75, 1];
  steps.forEach((t, i) => {
    lines.push(
      `  <rect ${attrs({
        x: fmtPx(keyX + i * step),
        y: fmtPx(legendY),
        width: cell,
        height: cell,
        rx: cell >= 10 ? 2 : 1,
        fill: rampFill(t),
        "data-key-step": i,
      })}/>`,
    );
  });
  labels.push(
    `    <text ${attrs({
      x: fmtPx(keyX + steps.length * step + 4),
      y: fmtPx(legendY + cell - 1),
      "data-key": "high",
    })}>${escapeXml(formatNumber(hi))}</text>`,
  );

  lines.push(
    `  <g ${attrs({
      fill: TYPE.tick.fill,
      "font-size": TYPE.tick.size,
      "font-family": FONT_NUMERIC,
      "font-weight": TYPE.tick.weight,
    })}>`,
    ...labels,
    `  </g>`,
  );
  return { lines, height };
}
