import { createElement } from "react";
import { Markvis } from "markvis/react";

/**
 * Draws chart, markvis, and vis code blocks. While a reply streams, the host
 * passes the block's text so far with `isIncomplete: true`; the block then
 * shows "Drawing chart…" and its rows instead of an error line.
 */
export const markvisRenderer = {
  language: ["chart", "markvis", "vis"],
  component: ({ code, isIncomplete }) =>
    createElement(Markvis, { source: code, streaming: isIncomplete }),
};
