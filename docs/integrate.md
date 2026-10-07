# Integrate

Put a chart in any Markdown preview or rendered page. Save a picture so any viewer can show it, or drop in a one-file script where the page already runs JavaScript. If nothing runs, the table of numbers is still there.

## Public site

markvis.js.org is the VitePress site in apps/web, built from branch master. GitHub Pages source must be GitHub Actions (not docsify). Do not change markvis-editor.js.org. Workflow: `.github/workflows/pages.yml` (`pnpm --filter web build`, upload `apps/web/.vitepress/dist`). `check.yml` stays the CI contract; Pages only deploys the site.

## GitHub README

GitHub will not grow a native chart fence. Use markvis bake on README.md and docs/landing.md. Keeps the fence; inserts a markdown image after it. Second bake is a no-op. CI workflow bake.yml runs on master push and PR.

## Any JS preview

After `pnpm build` (or a packed install), drop in `dist/markvis.min.js` (or `.mjs`). Zero network. Finds pre/code with language chart, markvis, or vis and replaces with the same SVG as Node.

Load `markvis.min.js` with a classic `<script>` (the CDN copy is `https://cdn.jsdelivr.net/npm/markvis@2/dist/markvis.min.js`). It defines `window.markvis`; `type="module"` hides it. For content added after load, call `markvis.init(element)` once the new nodes are in the page. Blocks already drawn are skipped. Covered by `packages/browser/test/dom.test.ts`.

From code, `render(blockText, options?)` takes one chart block — the inside a Markdown renderer hands a code-block plugin, or the whole block — and returns `{ ok, svg, html, … }` without throwing. `html` is the same figure, or table plus one error line, that markdown-it, remark, and the drop-in emit. `theme`, `palette`, and `surface` options apply only where the block leaves the field out. In the drop-in it is `markvis.render`. `parseBlock(blockText)` parses without drawing.

In this monorepo: `pnpm build`, then open `apps/playground/dropin.html`. `dist/` is gitignored — without that build the script 404s. Packed consumers copy `node_modules/markvis/dist/markvis.min.js`. For the live editor, start the playground Vite app.

Demo: apps/playground/dropin.html.

HTML comment plus GFM table charts only survive if the host already emitted them into the DOM; the browser script does not re-parse Markdown.

## React

`markvis/react` exports `Markvis`, `markvisComponents`, and `remarkMarkvisStreaming`. `react` 18 or later is an optional peer of `markvis`; nothing else is installed.

- `<Markvis source={blockText} />` draws one block. `<Markvis chart={{ type, x, y, … }} data={rows} />` turns the object and rows into a block (header lines, then CSV with `,` and `"` quoted) and parses it the same way, so error codes match text input. Columns come in this order: `x`, then the other columns the chart names, then remaining keys as first seen. A value with a line break is put on one line, since a CSV row is one line.
- Width follows the element around the chart (`ResizeObserver`, redrawn 100 ms after resizing stops). `width` fixes it. A server render uses 720 until hydration.
- The HTML inside the wrapper `div` is `render().html`, byte for byte. The SVG is inserted as HTML; render-svg escapes every text node and attribute.
- `markvisComponents` replaces `pre` and `code` only for `language-chart|markvis|vis` (any case, as the other code-block adapters). Other code passes through.
- `remarkMarkvisStreaming` marks a chart fence that has no closing line and runs to the end of the source. That block shows "Drawing chart…" plus the whole rows so far (a cut-off last line waits) and draws when the closing line arrives. A fence closed early by a list or quote is not held.

Host example: `examples/hosts/react-markdown/`. Tests: `packages/react/test/`.

## VitePress / Astro / markdown-it / remark

| Host | Path |
| --- | --- |
| VitePress | examples/hosts/vitepress/ — wire `markvis/markdown-it` (this monorepo still imports `@markvis/markdown-it`) |
| Astro | examples/hosts/astro/ |
| markdown-it | examples/hosts/markdown-it/ + `import markdownItMarkvis from "markvis/markdown-it"` |
| remark | `import remarkMarkvis from "markvis/remark"` |

Each host example renders at least one valid fence to HTML with svg and table elements.

## VS Code

extensions/vscode-markvis-preview — Markdown preview renders chart / markvis / vis to SVG. Install from folder or vsce package. Publishing to the Marketplace is a maintainer decision. See that folder README.

## GitHub Pages (one-time Settings)

On **github.com/geekplux/markvis** → **Settings** → **Pages**:

1. **Build and deployment → Source:** GitHub Actions. Not “Deploy from a branch”. Docsify must not stay the source.
2. **Custom domain:** `markvis.js.org` (keep existing DNS).
3. First green `pages` run on `master` publishes. Until Source is GitHub Actions, the workflow uploads but GitHub still serves the old branch site.

### Environment `github-pages`

The Actions deploy job uses the **github-pages** environment. Under **Settings** → **Environments** → **github-pages** → **Deployment branches and tags**:

- Must **allow branch `master`** (or “All branches”, or a rule that includes `master`).
- If the allow list is only `v2` / `main` / `gh-pages`, the run fails with: **Branch master is not allowed to deploy to github-pages**.

### Enforce HTTPS vs Cloudflare

**Enforce HTTPS** on the Pages custom-domain screen only works when GitHub sees its own DNS for the domain.

If `markvis.js.org` is **Cloudflare-proxied** (orange cloud):

- Leave **Enforce HTTPS unchecked** in GitHub Pages. GitHub cannot issue/complete HTTPS for a proxied record.
- In Cloudflare: SSL/TLS mode **Full** (not Flexible). Proxied CNAME/A to GitHub Pages; Cloudflare terminates visitor HTTPS.

If DNS is **grey-cloud / DNS-only** to GitHub Pages, Enforce HTTPS can stay on.

`apps/web/public/CNAME` ships `markvis.js.org` in the artifact. pages.yml must not deploy a red build.

## Explicit non-goals

- Waiting for github.com to add native markvis fences
- Docusaurus adapter (skipped for now — use bake or the browser drop-in; MDX surface is not cheap)
- New chart types, JSON-as-default data, or d3 in packages/ or apps/
