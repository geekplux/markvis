import { formatNumber } from "./scale.js";
import { textWidth } from "./text.js";
import {
  AXIS_NAME_GUTTER_X,
  AXIS_NAME_GUTTER_Y,
  FONT,
  LABEL_MIN_GAP,
  LABEL_ROTATE_DEG,
  MARGIN,
  PALETTE,
  ROTATE_LINE_HEIGHT,
  SVG_HEIGHT,
  SVG_WIDTH,
  TICK_TEXT_GAP,
  TITLE_BASELINE,
  TYPE,
} from "./tokens.js";

export { FONT, SVG_HEIGHT, SVG_WIDTH };

export type PlotBox = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
};

export type LegendItem = {
  name: string;
  color: string;
  opacity: number;
  x: number;
  y: number;
};

export type LegendLayout = {
  items: LegendItem[];
  height: number;
};

export type CategoryLayout = {
  rotate: boolean;
  show: boolean[];
};

export function layoutLegend(
  names: string[],
  colors: string[],
  opacities: number[],
  left: number,
  top: number,
  maxWidth: number,
): LegendLayout {
  const items: LegendItem[] = [];
  let x = left;
  let y = top;
  let rowHeight = 16;
  for (let i = 0; i < names.length; i++) {
    const name = names[i]!;
    const width = 16 + textWidth(name, TYPE.legend.size) + 14;
    if (i > 0 && x + width > left + maxWidth) {
      x = left;
      y += 18;
    }
    items.push({
      name,
      color: colors[i] ?? PALETTE[0]!,
      opacity: opacities[i] ?? 1,
      x,
      y,
    });
    x += width;
    rowHeight = y - top + 16;
  }
  return { items, height: names.length === 0 ? 0 : rowHeight };
}

function labelsOverlapZero(widths: number[], catStep: number): boolean {
  if (widths.length === 0) {
    return false;
  }
  for (const width of widths) {
    if (width > catStep - LABEL_MIN_GAP) {
      return true;
    }
  }
  for (let i = 0; i < widths.length - 1; i++) {
    const needed = widths[i]! / 2 + widths[i + 1]! / 2 + LABEL_MIN_GAP;
    if (needed > catStep) {
      return true;
    }
  }
  return false;
}

function labelsOverlapRotated(catStep: number): boolean {
  const rad = (Math.abs(LABEL_ROTATE_DEG) * Math.PI) / 180;
  return catStep * Math.sin(rad) < ROTATE_LINE_HEIGHT;
}

export function categoryLayout(
  labels: string[],
  catStep: number,
): CategoryLayout {
  const showAll = labels.map(() => true);
  if (labels.length <= 1) {
    const width = labels[0] ? textWidth(labels[0], TYPE.tick.size) : 0;
    if (width > catStep - LABEL_MIN_GAP && labels.length === 1) {
      return { rotate: true, show: showAll };
    }
    return { rotate: false, show: showAll };
  }
  const widths = labels.map((label) => textWidth(label, TYPE.tick.size));
  if (!labelsOverlapZero(widths, catStep)) {
    return { rotate: false, show: showAll };
  }
  if (!labelsOverlapRotated(catStep)) {
    return { rotate: true, show: showAll };
  }
  return {
    rotate: true,
    show: labels.map((_, i) => i % 2 === 0),
  };
}

export function cartesianMargins(opts: {
  yTickLabels: string[];
  xLabels: string[];
  yAxisTitle: string;
  xAxisTitle: string;
  legendHeight: number;
  rotateX: boolean;
}): { left: number; right: number; top: number; bottom: number } {
  const yTickWidth = Math.max(
    0,
    ...opts.yTickLabels.map((label) => textWidth(label, TYPE.tick.size)),
  );
  const yGutter = opts.yAxisTitle ? AXIS_NAME_GUTTER_Y : 0;
  const left = Math.max(
    MARGIN.left,
    yTickWidth + TICK_TEXT_GAP + yGutter,
  );

  const titleBottom = TITLE_BASELINE + 6;
  let titleBlock = titleBottom;
  if (opts.legendHeight > 0) {
    titleBlock = titleBottom + 8 + opts.legendHeight;
  }
  const top = Math.max(MARGIN.top, titleBlock + 12);

  let bottom = MARGIN.bottom;
  if (opts.rotateX) {
    const longest = Math.max(
      0,
      ...opts.xLabels.map((label) => textWidth(label, TYPE.tick.size)),
    );
    const rad = (Math.abs(LABEL_ROTATE_DEG) * Math.PI) / 180;
    bottom = Math.sin(rad) * longest + 20;
    if (opts.xAxisTitle) {
      bottom += AXIS_NAME_GUTTER_X;
    }
  } else {
    const labelExtent = TYPE.tick.size + 4;
    const xGutter = opts.xAxisTitle ? AXIS_NAME_GUTTER_X : 0;
    bottom = Math.max(MARGIN.bottom, labelExtent + 12 + xGutter);
  }
  return { left, right: MARGIN.right, top, bottom };
}

export function formatTickLabel(n: number): string {
  return formatNumber(n);
}
