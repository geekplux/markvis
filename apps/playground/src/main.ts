import { EXAMPLES } from "./examples.js";
import {
  exampleIdFromSearch,
  galleryHref,
  playgroundSearch,
  themeFromSearch,
} from "./links.js";
import { htmlTable, previewSource, type PlaygroundView } from "./preview.js";
import { dropinSnippet } from "./snippet.js";
import {
  readThemeFromFence,
  rewriteThemeInFence,
  type ChartTheme,
} from "./theme.js";
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
  if (exampleIdFromSearch(own) || themeFromSearch(own)) {
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

function paint(view: PlaygroundView): void {
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
  svgHost.innerHTML = view.svg;
  tableHost.innerHTML = htmlTable(view.table);
  copySvgBtn.disabled = view.svg.length === 0;
}

function main(): void {
  const themeSelect = mustEl<HTMLSelectElement>("theme");
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
  const initial =
    EXAMPLES.find((item) => item.id === fromQuery) ?? first;
  let filename = initial.filename;
  let view = previewSource(initial.source, filename);

  function currentTheme(): ChartTheme {
    return themeSelect.value as ChartTheme;
  }

  function syncUrl(id: string): void {
    const next = playgroundSearch(id, currentTheme());
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

  function syncThemeSelect(source: string): void {
    themeSelect.value = readThemeFromFence(source);
  }

  function load(source: string, name: string, id: string, theme?: ChartTheme | null): void {
    filename = name;
    let nextSource = source;
    if (theme) {
      nextSource = rewriteThemeInFence(source, theme);
    }
    editor.value = nextSource;
    syncThemeSelect(nextSource);
    view = previewSource(nextSource, filename);
    galleryLink.href = galleryHref(id, currentTheme());
    select.value = id;
    syncUrl(id);
    paint(view);
  }

  function flash(label: string): void {
    copied.textContent = label;
  }

  themeSelect.addEventListener("change", () => {
    const theme = themeSelect.value as ChartTheme;
    const next = rewriteThemeInFence(editor.value, theme);
    editor.value = next;
    view = previewSource(next, filename);
    galleryLink.href = galleryHref(select.value, theme);
    syncUrl(select.value);
    paint(view);
  });

  select.addEventListener("change", () => {
    const picked =
      EXAMPLES.find((item) => item.id === select.value) ?? first;
    load(picked.source, picked.filename, picked.id, currentTheme());
  });

  editor.addEventListener("input", () => {
    view = previewSource(editor.value, filename);
    paint(view);
    syncThemeSelect(editor.value);
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

  load(initial.source, initial.filename, initial.id, themeQuery);
}

main();
