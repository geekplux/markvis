# Integrate

Put a chart in any Markdown preview or rendered page. Save a picture so any viewer can show it, or drop in a one-file script where the page already runs JavaScript. If nothing runs, the table of numbers is still there.

## Public site

markvis.js.org is the VitePress site in apps/web, built from branch master. GitHub Pages source must be GitHub Actions (not docsify). Do not change markvis-editor.js.org. Workflow: `.github/workflows/pages.yml` (`pnpm --filter web build`, upload `apps/web/.vitepress/dist`). `check.yml` stays the CI contract; Pages only deploys the site.

## GitHub README

GitHub will not grow a native chart fence. Use markvis bake on README.md and docs/landing.md. Keeps the fence; inserts a markdown image after it. Second bake is a no-op. CI workflow bake.yml runs on master push and PR, with this branch's own build.

Other repositories use the root `action.yml` (composite): `uses: geekplux/markvis@master` with inputs `paths` (space-separated, default `README.md`), `commit` (default `true`), `message` (default `chore: bake markvis charts`). It sets up Node 20 and runs `npx --yes markvis@<version> bake <paths>`, pinned to the package version (`scripts/action.test.ts` checks the two match, so bump both together). It stages only the files bake wrote or removed: the list of changed files before bake is diffed against the list after, so other changes in the tree are never committed. If anything changed, it commits those paths as github-actions[bot] and pushes `HEAD` to the branch. A pull request from another repository, under any `pull_request*` event (`pull_request_target` too), is baked without a commit. On a pull request, `HEAD` must be the pull request head; a merge-commit checkout fails rather than push the base into the branch. Inputs and context reach the shell through `env` only. `scripts/action.test.ts` runs the action's own steps twice in a scratch repository with a bare remote. bake.yml stays as is: it bakes with the branch's build, not the published package. Release tags for `uses: geekplux/markvis@v2` are the maintainer's call.

Without the Action, the comment + table form shows as a plain table on github.com.

## Any JS preview

After `pnpm build` (or a packed install), drop in `dist/markvis.min.js` (or `.mjs`). Zero network. Load it with a classic `<script>` (the CDN copy is `https://cdn.jsdelivr.net/npm/markvis@2/dist/markvis.min.js`); it defines `window.markvis`, and `type="module"` hides it.

Detection (`packages/browser/src/dom.ts`): a `pre` is a chart block when `chart`, `markvis`, or `vis` appears as `language-X`, `lang-X`, or `data-lang="X"` on its `code`, on the `pre`, or on a wrapper `div` up to two levels out, or as a bare class on the `pre` (Pandoc). A chart `code` outside any `pre` counts too. The outermost highlighter wrapper (`highlight`, `highlighter-rouge`, `sourceCode`, `codehilite`, `code-block`, `language-*`) is replaced, so its chrome goes with it, but only while everything else in the wrapper is chrome (`button`, `span`, `small`, `label`, `svg`, or blank text). A wrapper that holds any other content stays, and only the block inside it is replaced. Text is read with `textContent`, so highlighter spans do not matter. Every block renders through `render()`.

Comment form: a comment whose text starts with `chart:`, `markvis:`, or `vis:`, followed (only whitespace between) by a `<table>` or by a paragraph of pipe rows (kramdown leaves the table unparsed right after a comment, and turns `---` into dashes), is rebuilt as a block and replaced with the figure, which keeps the table.

API on the global and the ES module: `run({ nodes?, querySelector?, root? })` returns how many it drew; `init(root)` is `run({ root })`; `initialize({ theme, palette, surface, width })` sets page defaults (a block's own field wins); `render(text, options?)` uses the same defaults. The classic script runs once the DOM is ready (at `DOMContentLoaded` while the page loads, at once after); `data-start-on-load="false"` on its tag turns that off. The ES module never runs on import. A drawn block leaves the page, so a second run draws nothing new.

Host fixtures: `packages/browser/test/fixtures/hosts/*.html`, each rendered from `source.md` by the real tool (marked, markdown-it, markdown-it + highlight.js, Jekyll with kramdown GFM + rouge, Hugo with goldmark + chroma, MkDocs with a custom fence, MkDocs with defaults, Pandoc, docsify); the first line names the tool, version, and command. Hugo needs `markup.goldmark.renderer.unsafe = true` for raw HTML. MkDocs with Pygments keeps no language name unless a superfences custom fence sets the class; `pygments_lang_class` names the lexer (`language-text`), not the fence. docsify renders after load: call `markvis.run()` from a `doneEach` hook.

In this monorepo: `pnpm build`, then open `apps/playground/dropin.html`. `dist/` is gitignored — without that build the script 404s.

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
| Astro | examples/hosts/astro/ — Astro 7 needs `@astrojs/markdown-remark`, `processor: unified({ rehypePlugins })`, and Shiki `excludeLangs` for chart tags; checked with 7.3.7 |
| markdown-it | examples/hosts/markdown-it/ + `import markdownItMarkvis from "markvis/markdown-it"` |
| remark | `import remarkMarkvis from "markvis/remark"` |
| rehype / MDX | `import rehypeMarkvis from "markvis/rehype"` — real hast (figure, SVG subtree, table), no raw nodes |
| Docusaurus | examples/hosts/docusaurus/ — `rehypePlugins: [rehypeMarkvis]` in the docs preset; checked with 3.10.2 |

Each host example renders at least one valid fence to HTML with svg and table elements.

`markvis/rehype` turns `render().html` into hast with a small parser for markvis's own output (double-quoted attributes, `/>`, the entities markvis emits); it adds no runtime dependency. It also draws a chart comment followed by a table when the tree keeps comments (for example after rehype-raw). Its output equals `render().html` once both are parsed (`packages/remark/test/rehype.test.ts`); hast stringifiers escape `>` and quotes differently, so the bytes differ. react-markdown can use it as a rehype plugin too; `markvis/react` adds width-following and streaming.

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
