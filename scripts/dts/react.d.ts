import type { HTMLAttributes, ReactElement } from "react";
import type { ChartPalette, ChartTheme } from "./ir.js";
import type { ParseError } from "./parser.js";

type MarkvisCommonProps = {
  /** Width in px. Default: the width of the element around the chart. */
  width?: number | undefined;
  /** Used when the block has no `theme:`. */
  theme?: ChartTheme | undefined;
  /** Used when the block has no `palette:`. */
  palette?: ChartPalette | undefined;
  /** Used when the block has no `surface:`. */
  surface?: "light" | "dark" | "export" | undefined;
  className?: string | undefined;
  /** Called after a block fails to parse, with its stable error. */
  onError?: ((error: ParseError) => void) | undefined;
};

/** Header fields of a chart given as an object. Same names as a fence header. */
type MarkvisChartFields = {
  type: string;
  [field: string]: string | number | null | undefined;
};

/**
 * One chart. Pass the text of a block as `source`, or a chart object and
 * rows as `chart` + `data`. Both go through the same parser, so a bad
 * block keeps its rows and shows one error line.
 */
export declare function Markvis(
  props: MarkvisCommonProps &
    (
      | { source: string; chart?: undefined; data?: undefined }
      | {
          source?: undefined;
          chart: MarkvisChartFields;
          data: readonly Record<string, unknown>[];
        }
    ),
): ReactElement;

type MarkvisElementProps = HTMLAttributes<HTMLElement> & { node?: unknown };

/**
 * `components` for react-markdown (or anything that takes the same map).
 * Only `language-chart`, `language-markvis`, and `language-vis` blocks
 * change. Merge with your own: `{ ...markvisComponents, ...mine }`.
 */
export declare const markvisComponents: {
  pre: (props: MarkvisElementProps) => ReactElement;
  code: (props: MarkvisElementProps) => ReactElement;
};

/**
 * remark plugin for a reply that is still streaming. A chart fence with no
 * closing line yet is marked open, so `markvisComponents` shows a quiet
 * placeholder with the rows so far instead of an error. Leave it out once
 * the reply is complete, and an unclosed block draws as written.
 */
export declare function remarkMarkvisStreaming(): (
  tree: unknown,
  file: { value?: unknown },
) => void;
