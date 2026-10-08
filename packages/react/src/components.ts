import { createElement, isValidElement, type HTMLAttributes, type ReactElement, type ReactNode } from "react";
import { Chart } from "./markvis.js";
import { OPEN_ATTRIBUTE } from "./streaming.js";

const CHART_CLASS = /(?:^|\s)language-(?:chart|markvis|vis)(?:\s|$)/i;

type ElementProps = HTMLAttributes<HTMLElement> & {
  /** The hast node react-markdown passes along; never forwarded to the DOM. */
  node?: unknown;
};

function isChartClass(className: unknown): boolean {
  return typeof className === "string" && CHART_CLASS.test(className);
}

function textOf(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(textOf).join("");
  }
  return "";
}

function chartOf(props: ElementProps): ReactElement {
  const open = (props as Record<string, unknown>)[OPEN_ATTRIBUTE];
  return createElement(Chart, {
    source: textOf(props.children),
    open: open === "true" || open === true,
  });
}

/** A chart code block becomes a chart; any other `pre` stays as it is. */
function Pre(props: ElementProps): ReactElement {
  const { node: _node, children, ...rest } = props;
  const only = Array.isArray(children) && children.length === 1 ? children[0] : children;
  if (isValidElement<ElementProps>(only) && isChartClass(only.props.className)) {
    return chartOf(only.props);
  }
  return createElement("pre", rest, children);
}

/** A chart code element outside `pre` (a host with its own `pre`) also draws. */
function Code(props: ElementProps): ReactElement {
  const { node: _node, ...rest } = props;
  if (isChartClass(rest.className)) {
    return chartOf(rest);
  }
  return createElement("code", rest);
}

/**
 * `components` for react-markdown (or anything that takes the same map).
 * Only `language-chart`, `language-markvis`, and `language-vis` blocks
 * change. Merge with your own: `{ ...markvisComponents, ...mine }`.
 */
export const markvisComponents = { pre: Pre, code: Code };
