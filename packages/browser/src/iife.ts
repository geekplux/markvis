import { autoReplace } from "./dom.js";

export * from "./index.js";

/** False when the script tag says `data-start-on-load="false"`. */
export function startsOnLoad(script: Element | null | undefined): boolean {
  return script?.getAttribute("data-start-on-load")?.trim().toLowerCase() !== "false";
}

// The classic script draws the page once the DOM is ready. Read the tag
// now: `currentScript` is only set while this script runs.
if (typeof document !== "undefined" && startsOnLoad(document.currentScript)) {
  autoReplace();
}
