# Integrate

Put a chart in any Markdown preview or rendered page. Save a picture so any viewer can show it, or drop in a one-file script where the page already runs JavaScript. If nothing runs, the table of numbers is still there.

## Public site

markvis.js.org is the VitePress site in `apps/web`, deployed from `master` by `.github/workflows/pages.yml`. `check.yml` stays the CI contract; Pages only deploys the site.

## GitHub README

github.com runs no scripts, so a README shows a picture or a table. `markvis bake` keeps the block and inserts a Markdown image after it; a second bake is a no-op. `.github/workflows/bake.yml` bakes this repository's own README with the branch's build.

Other repositories use the root `action.yml`: `uses: geekplux/markvis@master` with inputs `paths`, `commit`, `message`. It runs the published package pinned to this repository's version (`scripts/action.test.ts` checks the two match, so bump both together), commits only the files bake wrote, and never pushes for a pull request from a fork. The guards and their reasons are commented in `action.yml`; `scripts/action.test.ts` runs its steps twice in a scratch repository.

Without the Action, the comment + table form shows as a plain table on github.com.

## Any JS preview

`dist/markvis.min.js` (CDN: `https://cdn.jsdelivr.net/npm/markvis@2/dist/markvis.min.js`) loads with a classic `<script>` and defines `window.markvis`; `type="module"` hides it. `dist/markvis.mjs` is the ES module and never draws on import.

The whole API is `run({ nodes?, querySelector?, root? })`, `init(root)`, `initialize({ theme, palette, surface, width })`, `render(text, options?)`, and `parseBlock`. Every block renders through `render()`. How a chart block or a chart comment is found in a host's HTML is commented in `packages/browser/src/dom.ts`, and each supported host has a fixture in `packages/browser/test/fixtures/hosts/` whose first line names the tool, version, and command that produced it (`hosts.test.ts` draws every one). Host notes for users are on the site's Integrate page.

In this monorepo: `pnpm build`, then open `apps/playground/dropin.html`. `dist/` is gitignored — without that build the script 404s.

## React

`markvis/react` exports `Markvis`, `markvisComponents`, and `remarkMarkvisStreaming`. `react` 18 or later is an optional peer of `markvis`; nothing else is installed.

- `<Markvis source={blockText} />` draws one block. `<Markvis chart={{ type, x, y, … }} data={rows} />` turns the object and rows into a block (header lines, then CSV with `,` and `"` quoted) and parses it the same way, so error codes match text input. Columns come in this order: `x`, then the other columns the chart names, then remaining keys as first seen. A value with a line break is put on one line, since a CSV row is one line.
- Width follows the element around the chart (`ResizeObserver`, redrawn 100 ms after resizing stops). `width` fixes it. A server render uses 720 until hydration.
- The HTML inside the wrapper `div` is `render().html`, byte for byte. The SVG is inserted as HTML; render-svg escapes every text node and attribute.
- `markvisComponents` replaces `pre` and `code` only for `language-chart|markvis|vis` (any case, as the other code-block adapters). Other code passes through.
- `remarkMarkvisStreaming` marks a chart fence that has no closing line and runs to the end of the source. That block shows "Drawing chart…" plus the whole rows so far (a cut-off last line waits) and draws when the closing line arrives. A fence closed early by a list or quote is not held.
- `<Markvis source={code} streaming={isIncomplete} />` is the same hold for a host that hands a renderer the partial text of a block and its own "still arriving" flag. While `streaming` is true the block shows "Drawing chart…" plus the whole rows so far (the last line waits, since it may be cut in half), never an error line. Default false.

Host example: `examples/hosts/react-markdown/`. Tests: `packages/react/test/`.

## VitePress / Astro / markdown-it / remark

| Host | Path |
| --- | --- |
| VitePress | examples/hosts/vitepress/ — wire `markvis/markdown-it` (this monorepo still imports `@markvis/markdown-it`) |
| Astro | examples/hosts/astro/ — Astro 7 needs `@astrojs/markdown-remark`, `processor: unified({ rehypePlugins })`, and Shiki `excludeLangs` for chart tags; checked with 7.3.7 |
| markdown-it | examples/hosts/markdown-it/ + `import markdownItMarkvis from "markvis/markdown-it"` |
| remark | `import remarkMarkvis from "markvis/remark"` |
| rehype / MDX | `import rehypeMarkvis from "markvis/rehype"` — real hast (figure, SVG subtree, table), no raw nodes |
| Docusaurus | examples/hosts/docusaurus/ — `rehypePlugins: [rehypeMarkvis]` in the docs preset; checked with 3.10.2 |

Each host example renders at least one valid fence to HTML with svg and table elements.

`markvis/rehype` turns `render().html` into hast with a small parser for markvis's own output (double-quoted attributes, `/>`, the entities markvis emits); it adds no runtime dependency. It also draws a chart comment followed by a table when the tree keeps comments (for example after rehype-raw). Its output equals `render().html` once both are parsed (`packages/remark/test/rehype.test.ts`); hast stringifiers escape `>` and quotes differently, so the bytes differ. react-markdown can use it as a rehype plugin too; `markvis/react` adds width-following and streaming.

## VS Code

hosts/vscode — the `markvis preview` extension (`geekplux.markvis-preview`). The built-in Markdown preview renders chart / markvis / vis blocks to SVG in the editor theme's colors (`preview.css` maps the `--vscode-*` theme colors onto the `--markvis-*` variables). CI compiles it and lists the package contents; the maintainer publishes it to the Marketplace and Open VSX. See that folder README.

## Explicit non-goals

- Waiting for github.com to add native markvis fences
- Docusaurus adapter (skipped for now — use bake or the browser drop-in; MDX surface is not cheap)
- New chart types, JSON-as-default data, or d3 in packages/ or apps/
