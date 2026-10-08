import {
  createElement,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type RefObject,
} from "react";
import type { ChartPalette, ChartTheme } from "@markvis/ir";
import { htmlTable, render, type RenderOptions } from "@markvis/html";
import { parseBlock, type ParseError } from "@markvis/parser";
import { chartBlock, type ChartFields, type DataRow } from "./block.js";

/** Wait this long after the last resize before drawing again. */
export const RESIZE_DEBOUNCE_MS = 100;

type CommonProps = {
  /** Width in px. Default: the width of the element around the chart. */
  width?: number | undefined;
  theme?: ChartTheme | undefined;
  palette?: ChartPalette | undefined;
  surface?: "light" | "dark" | "export" | undefined;
  className?: string | undefined;
  /** Called after a block fails to parse, with its stable error. */
  onError?: ((error: ParseError) => void) | undefined;
};

export type MarkvisProps = CommonProps &
  (
    | { source: string; chart?: undefined; data?: undefined }
    | { source?: undefined; chart: ChartFields; data: readonly DataRow[] }
  );

function px(value: string | undefined): number {
  const n = Number.parseFloat(value ?? "");
  return Number.isFinite(n) ? n : 0;
}

/**
 * The width the SVG gets: the wrapper's client width minus its padding,
 * minus the figure's own margin, border, and padding (a browser gives
 * `figure` 40px side margins by default).
 */
function contentWidth(el: HTMLElement): number {
  if (typeof getComputedStyle !== "function") {
    return Math.floor(el.clientWidth);
  }
  const own = getComputedStyle(el);
  let width = el.clientWidth - px(own.paddingLeft) - px(own.paddingRight);
  const figure = el.firstElementChild;
  if (figure && figure.tagName.toLowerCase() === "figure") {
    const fig = getComputedStyle(figure);
    for (const side of ["Left", "Right"] as const) {
      width -= px(fig[`margin${side}`]) + px(fig[`border${side}Width`]) + px(fig[`padding${side}`]);
    }
  }
  return Math.floor(width);
}

/** A layout effect in the browser; a plain effect on the server, where it never runs. */
const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * The container's width, measured after mount and on resize (debounced).
 * It is measured again, before paint, when a streamed block is drawn: the
 * figure's own margins only count once the figure is there.
 */
function useContainerWidth(
  ref: RefObject<HTMLDivElement | null>,
  fixed: number | undefined,
  drawn: boolean,
) {
  const [measured, setMeasured] = useState<number | undefined>(undefined);
  useBrowserLayoutEffect(() => {
    const el = ref.current;
    if (fixed !== undefined || !el || !drawn) {
      return;
    }
    const width = contentWidth(el);
    if (width > 0) {
      setMeasured(width);
    }
  }, [ref, fixed, drawn]);
  useEffect(() => {
    const el = ref.current;
    if (fixed !== undefined || !el) {
      return;
    }
    const read = () => {
      const width = contentWidth(el);
      if (width > 0) {
        setMeasured(width);
      }
    };
    read();
    if (typeof ResizeObserver === "undefined") {
      return;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(read, RESIZE_DEBOUNCE_MS);
    });
    observer.observe(el);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [ref, fixed]);
  return fixed ?? measured;
}

/** A block still arriving: a quiet note plus the rows read so far. */
function pendingHtml(text: string): string {
  const result = parseBlock(text);
  const table = htmlTable(result.ok ? result.chart.table : result.table);
  const note = '<p class="markvis-pending-note">Drawing chart…</p>';
  return `<div class="markvis-pending" aria-busy="true">${note}${table}</div>`;
}

type ChartProps = CommonProps & { source: string; open?: boolean };

/** One block to a figure, or its rows and one error line. Internal. */
export function Chart(props: ChartProps): ReactElement {
  const { source, open = false, theme, palette, surface, className, onError } = props;
  const ref = useRef<HTMLDivElement | null>(null);
  const width = useContainerWidth(ref, props.width, !open);
  const result = useMemo(() => {
    if (open) {
      return undefined;
    }
    const options: RenderOptions = {};
    if (width !== undefined) options.width = width;
    if (theme !== undefined) options.theme = theme;
    if (palette !== undefined) options.palette = palette;
    if (surface !== undefined) options.surface = surface;
    return render(source, options);
  }, [source, open, width, theme, palette, surface]);
  const pending = useMemo(() => (open ? pendingHtml(source) : undefined), [source, open]);

  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  });
  // Report each failure once: a redraw at a new width or theme, or a
  // StrictMode re-run, gives a new result but not a new error.
  const reported = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!result) {
      return;
    }
    if (result.ok) {
      reported.current = undefined;
      return;
    }
    const key = `${source}\u0000${result.error.code}\u0000${result.error.message}`;
    if (reported.current !== key) {
      reported.current = key;
      onErrorRef.current?.(result.error);
    }
  }, [result, source]);

  const html = pending ?? result?.html ?? "";
  return createElement("div", { ref, className, dangerouslySetInnerHTML: { __html: html } });
}

/**
 * One chart. Pass the text of a block as `source`, or a chart object and
 * rows as `chart` + `data`. Both go through the same parser, so a bad
 * block keeps its rows and shows one error line.
 */
export function Markvis(props: MarkvisProps): ReactElement {
  const { chart, data, source, ...rest } = props;
  const text = source ?? chartBlock(chart ?? { type: "" }, data ?? []);
  return createElement(Chart, { ...rest, source: text });
}
