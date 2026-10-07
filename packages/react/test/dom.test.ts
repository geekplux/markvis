// @vitest-environment happy-dom
/**
 * In a browser: the chart follows its container's width (debounced),
 * hydrates without a mismatch, and reports a bad block once.
 */
import { act, createElement } from "react";
import { createRoot, hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Markvis } from "../src/index.js";
import { RESIZE_DEBOUNCE_MS } from "../src/markvis.js";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const source = "type: bar\ntitle: Visits\nx: day\ny: visits\n\nday,visits\nMon,3\nTue,5\n";

let containerWidth = 400;
let observers: Array<() => void> = [];

class FakeResizeObserver {
  private readonly callback: () => void;
  constructor(callback: () => void) {
    this.callback = callback;
  }
  observe(): void {
    observers.push(this.callback);
  }
  disconnect(): void {
    observers = observers.filter((cb) => cb !== this.callback);
  }
  unobserve(): void {}
}

function svgWidth(host: HTMLElement): string | null {
  return host.querySelector("svg")?.getAttribute("width") ?? null;
}

let host: HTMLDivElement;
let root: Root | undefined;

beforeEach(() => {
  containerWidth = 400;
  observers = [];
  vi.stubGlobal("ResizeObserver", FakeResizeObserver);
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(() => containerWidth);
  host = document.createElement("div");
  document.body.append(host);
});

afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  host.remove();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("width follows the container", () => {
  it("draws at the measured width after mount", () => {
    act(() => {
      root = createRoot(host);
      root.render(createElement(Markvis, { source }));
    });
    expect(svgWidth(host)).toBe("400");
    expect(observers).toHaveLength(1);
  });

  it("redraws after a resize, once the resizing stops", () => {
    vi.useFakeTimers();
    act(() => {
      root = createRoot(host);
      root.render(createElement(Markvis, { source }));
    });
    containerWidth = 300;
    act(() => observers.forEach((cb) => cb()));
    containerWidth = 280;
    act(() => observers.forEach((cb) => cb()));
    expect(svgWidth(host)).toBe("400");
    act(() => vi.advanceTimersByTime(RESIZE_DEBOUNCE_MS));
    expect(svgWidth(host)).toBe("280");
  });

  it("subtracts the container's horizontal padding", () => {
    act(() => {
      root = createRoot(host);
      root.render(createElement(Markvis, { source, className: "padded" }));
    });
    const wrapper = host.firstElementChild as HTMLElement;
    wrapper.style.padding = "0 20px";
    containerWidth = 400;
    vi.useFakeTimers();
    act(() => observers.forEach((cb) => cb()));
    act(() => vi.advanceTimersByTime(RESIZE_DEBOUNCE_MS));
    expect(svgWidth(host)).toBe("360");
  });

  it("subtracts the figure's own side margin, border, and padding", () => {
    const style = document.createElement("style");
    style.textContent = "figure { margin: 0 30px; padding: 0 4px; border: 1px solid; }";
    document.head.append(style);
    try {
      act(() => {
        root = createRoot(host);
        root.render(createElement(Markvis, { source }));
      });
      vi.useFakeTimers();
      act(() => observers.forEach((cb) => cb()));
      act(() => vi.advanceTimersByTime(RESIZE_DEBOUNCE_MS));
      expect(svgWidth(host)).toBe(String(400 - 2 * (30 + 4 + 1)));
    } finally {
      style.remove();
    }
  });

  it("keeps a fixed width and observes nothing", () => {
    act(() => {
      root = createRoot(host);
      root.render(createElement(Markvis, { source, width: 512 }));
    });
    expect(svgWidth(host)).toBe("512");
    expect(observers).toHaveLength(0);
  });

  it("ignores a hidden container (width 0)", () => {
    containerWidth = 0;
    act(() => {
      root = createRoot(host);
      root.render(createElement(Markvis, { source }));
    });
    expect(svgWidth(host)).toBe("720");
  });

  it("stops observing on unmount", () => {
    act(() => {
      root = createRoot(host);
      root.render(createElement(Markvis, { source }));
    });
    act(() => root?.unmount());
    root = undefined;
    expect(observers).toHaveLength(0);
  });
});

describe("hydration", () => {
  it("hydrates the server HTML without a mismatch, then fits the container", () => {
    host.innerHTML = renderToString(createElement(Markvis, { source }));
    expect(svgWidth(host)).toBe("720");
    const errors: unknown[] = [];
    act(() => {
      root = hydrateRoot(host, createElement(Markvis, { source }), {
        onRecoverableError: (error) => errors.push(error),
      });
    });
    expect(errors).toEqual([]);
    expect(svgWidth(host)).toBe("400");
  });
});

describe("onError", () => {
  it("is called once per bad block, not on every render", () => {
    const onError = vi.fn();
    const bad = "type: donut\nx: a\ny: b\n\na,b\nA,1\n";
    act(() => {
      root = createRoot(host);
      root.render(createElement(Markvis, { source: bad, onError, width: 300 }));
    });
    act(() => root?.render(createElement(Markvis, { source: bad, onError: (e) => onError(e), width: 300 })));
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0]?.[0]).toMatchObject({ code: "E_UNKNOWN_TYPE" });
    expect(host.textContent).toContain("E_UNKNOWN_TYPE");
  });

  it("is not called for a good block", () => {
    const onError = vi.fn();
    act(() => {
      root = createRoot(host);
      root.render(createElement(Markvis, { source, onError }));
    });
    expect(onError).not.toHaveBeenCalled();
  });
});
