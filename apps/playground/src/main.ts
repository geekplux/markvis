import { EXAMPLES } from "./examples.js";
import {
  exampleIdFromSearch,
  galleryHref,
  paletteFromSearch,
  playgroundSearch,
  themeFromSearch,
} from "./links.js";
import { htmlTable, previewSource, type PlaygroundView } from "./preview.js";
import { dropinSnippet } from "./snippet.js";
import {
  readPaletteFromFence,
  readThemeFromFence,
  rewritePaletteInFence,
  rewriteThemeInFence,
  type ChartPalette,
  type ChartTheme,
} from "./theme.js";
import { enhanceChartSvg } from "@markvis/browser/enhance";
import "./style.css";

function mustEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`#${id} missing`);
  }
  return el as T;
}

async function copyText(text: string): Promise<void> {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.append(ta);
  ta.select();
  document.execCommand("copy");
  ta.remove();
}

function searchForExample(): string {
  const own = window.location.search;
  if (
    exampleIdFromSearch(own) ||
    themeFromSearch(own) ||
    paletteFromSearch(own)
  ) {
    return own;
  }
  try {
    if (window.parent !== window) {
      return window.parent.location.search;
    }
  } catch {
    return own;
  }
  return own;
}

let disposeEnhance: (() => void) | undefined;

function paint(view: PlaygroundView, theme?: ChartTheme): void {
  const errorEl = mustEl<HTMLParagraphElement>("error");
  const svgHost = mustEl<HTMLDivElement>("svg-host");
  const tableHost = mustEl<HTMLDivElement>("table-host");
  const copySvgBtn = mustEl<HTMLButtonElement>("copy-svg");
  if (view.ok) {
    errorEl.hidden = true;
    errorEl.textContent = "";
  } else {
    errorEl.hidden = false;
    errorEl.textContent = view.error ?? "parse failed";
  }
  disposeEnhance?.();
  disposeEnhance = undefined;
  svgHost.innerHTML = view.svg;
  tableHost.innerHTML = htmlTable(view.table);
  copySvgBtn.disabled = view.svg.length === 0;
  const svg = svgHost.querySelector("svg");
  if (svg instanceof SVGSVGElement) {
    disposeEnhance = enhanceChartSvg(svg, { theme });
  }
}

function main(): void {
  const themeSelect = mustEl<HTMLSelectElement>("theme");
  const paletteSelect = mustEl<HTMLSelectElement>("palette");
  const select = mustEl<HTMLSelectElement>("example");
  const editor = mustEl<HTMLTextAreaElement>("fence");
  const copyFenceBtn = mustEl<HTMLButtonElement>("copy-fence");
  const copySvgBtn = mustEl<HTMLButtonElement>("copy-svg");
  const copySnippetBtn = mustEl<HTMLButtonElement>("copy-snippet");
  const galleryLink = mustEl<HTMLAnchorElement>("open-gallery");
  const copied = mustEl<HTMLSpanElement>("copied");
  const first = EXAMPLES[0];
  if (!first) {
    paint({
      ok: false,
      svg: "",
      table: { columns: [], rows: [] },
      error: "no examples/valid files bundled",
    });
    return;
  }

  for (const example of EXAMPLES) {
    const option = document.createElement("option");
    option.value = example.id;
    option.textContent = example.id;
    select.append(option);
  }

  const query = searchForExample();
  const fromQuery = exampleIdFromSearch(query);
  const themeQuery = themeFromSearch(query);
  const paletteQuery = paletteFromSearch(query);
  const initial =
    EXAMPLES.find((item) => item.id === fromQuery) ?? first;
  let filename = initial.filename;
  let view = previewSource(initial.source, filename);

  function currentTheme(): ChartTheme {
    return themeSelect.value as ChartTheme;
  }

  function currentPalette(): ChartPalette | null {
    const raw = paletteSelect.value;
    return raw === "" ? null : (raw as ChartPalette);
  }

  function syncUrl(id: string): void {
    const next = playgroundSearch(id, currentTheme(), currentPalette());
    if (`${window.location.search}` !== next) {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${next}${window.location.hash}`,
      );
    }
    try {
      if (window.parent !== window) {
        const parent = window.parent.location;
        window.parent.history.replaceState(
          null,
          "",
          `${parent.pathname}${next}${parent.hash}`,
        );
      }
    } catch {
      // iframe without parent history access
    }
  }

  function syncSelects(source: string): void {
    themeSelect.value = readThemeFromFence(source);
    const palette = readPaletteFromFence(source);
    paletteSelect.value = palette ?? "";
  }

  function load(
    source: string,
    name: string,
    id: string,
    theme?: ChartTheme | null,
    palette?: ChartPalette | null,
  ): void {
    filename = name;
    let nextSource = source;
    if (theme) {
      nextSource = rewriteThemeInFence(nextSource, theme);
    }
    if (palette !== undefined) {
      nextSource = rewritePaletteInFence(nextSource, palette);
    }
    editor.value = nextSource;
    syncSelects(nextSource);
    view = previewSource(nextSource, filename);
    galleryLink.href = galleryHref(id, currentTheme(), currentPalette());
    select.value = id;
    syncUrl(id);
    paint(view, currentTheme());
  }

  function flash(label: string): void {
    copied.textContent = label;
  }

  themeSelect.addEventListener("change", () => {
    const theme = themeSelect.value as ChartTheme;
    let next = rewriteThemeInFence(editor.value, theme);
    next = rewritePaletteInFence(next, currentPalette());
    editor.value = next;
    view = previewSource(next, filename);
    galleryLink.href = galleryHref(select.value, theme, currentPalette());
    syncUrl(select.value);
    paint(view, currentTheme());
  });

  paletteSelect.addEventListener("change", () => {
    const next = rewritePaletteInFence(editor.value, currentPalette());
    editor.value = next;
    view = previewSource(next, filename);
    galleryLink.href = galleryHref(
      select.value,
      currentTheme(),
      currentPalette(),
    );
    syncUrl(select.value);
    paint(view, currentTheme());
  });

  select.addEventListener("change", () => {
    const picked =
      EXAMPLES.find((item) => item.id === select.value) ?? first;
    load(
      picked.source,
      picked.filename,
      picked.id,
      currentTheme(),
      currentPalette(),
    );
  });

  editor.addEventListener("input", () => {
    view = previewSource(editor.value, filename);
    paint(view, currentTheme());
    syncSelects(editor.value);
  });

  copyFenceBtn.addEventListener("click", () => {
    void copyText(editor.value).then(
      () => flash("Copied fence"),
      () => flash("Copy failed"),
    );
  });

  copySvgBtn.addEventListener("click", () => {
    if (!view.svg) {
      return;
    }
    void copyText(view.svg).then(
      () => flash("Copied SVG"),
      () => flash("Copy failed"),
    );
  });

  copySnippetBtn.addEventListener("click", () => {
    void copyText(dropinSnippet(editor.value)).then(
      () => flash("Copied snippet"),
      () => flash("Copy failed"),
    );
  });

  load(
    initial.source,
    initial.filename,
    initial.id,
    themeQuery,
    paletteQuery,
  );
}

main();
