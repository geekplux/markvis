import { parseBlock } from "@markvis/parser";
import {
  init,
  initialize,
  renderWithDefaults as render,
  run,
  type PageDefaults,
  type RunOptions,
} from "./dom.js";

export type { RenderOptions, RenderResult } from "@markvis/html";
export type { PageDefaults, RunOptions };

// The drop-in's whole API, on `window.markvis` and on the ES module. The
// ES module draws nothing on import; the classic script (iife.ts) runs
// once the page is ready. Everything else is in the `markvis` package.
export { init, initialize, parseBlock, render, run };
