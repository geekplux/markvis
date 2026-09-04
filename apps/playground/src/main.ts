import { EXAMPLES } from "./examples.js";
import { htmlTable, previewSource, type PlaygroundView } from "./preview.js";
import { dropinSnippet } from "./snippet.js";
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
  const select = mustEl<HTMLSelectElement>("example");
  const editor = mustEl<HTMLTextAreaElement>("fence");
  const copyFenceBtn = mustEl<HTMLButtonElement>("copy-fence");
  const copySvgBtn = mustEl<HTMLButtonElement>("copy-svg");
  const copySnippetBtn = mustEl<HTMLButtonElement>("copy-snippet");
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
    option.value = example.filename;
    option.textContent = example.filename;
    select.append(option);
  }

  let filename = first.filename;
  let view = previewSource(first.source, filename);

  function load(source: string, name: string): void {
    filename = name;
    editor.value = source;
    view = previewSource(source, filename);
    paint(view);
  }

  function flash(label: string): void {
    copied.textContent = label;
  }

  select.addEventListener("change", () => {
    const picked =
      EXAMPLES.find((item) => item.filename === select.value) ?? first;
    load(picked.source, picked.filename);
  });

  editor.addEventListener("input", () => {
    view = previewSource(editor.value, filename);
    paint(view);
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

  select.value = first.filename;
  load(first.source, first.filename);
}

main();
