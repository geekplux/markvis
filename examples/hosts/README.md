# Host examples

Each folder renders a valid chart page (SVG + table). Plugins only; no new types, no d3.

| Host | Plugin | Page |
| --- | --- | --- |
| `vitepress/` | `markvis/markdown-it` (this repo imports `@markvis/markdown-it`) | `index.md` |
| `astro/` | `markvis/rehype` | `src/pages/index.md` |
| `docusaurus/` | `markvis/rehype` | `docs/report.mdx` (config + page; built with Docusaurus 3.10.2) |
| `markdown-it/` | `markvis/markdown-it` (this repo imports `@markvis/markdown-it`) | `index.md` |
| `script-tag/` | `markvis.min.js` + marked from a CDN | `index.html` + `page.md` |
| `mkdocs/` | `markvis.min.js` via `extra_javascript` | `mkdocs.yml` + `docs/index.md` |
| `react-markdown/` | `markvis/react` | `index.html` (streaming chat; serve the repository root after `pnpm build`) |
| `streamdown/` | `markvis/react` in `plugins.renderers`, with `streaming` | `renderer.mjs` + `build.mjs` |
| `svelte/` | `render(text).html` in `{@html}` | `Chart.svelte` + `build.mjs` |
| `vue/` | `render(text).html` in `v-html` | `Chart.vue` + `build.mjs` |

See `docs/integrate.md`.

## Acceptance checklist

A new host recipe is accepted when its folder has all of these:

1. It runs `examples/valid/01-bar-basic.md` **and** `examples/invalid/01-unknown-type.md` through the host itself, so the error path is seen too.
2. The output for the valid one contains `<svg` and `data-chart-type="bar"`.
3. The output for the invalid one contains `markvis-error` and `<table`: the rows stay, with one error line.
4. The README's first line names the tool, its version, and the command that was run, for example `Vue 3.5.44, checked with npm install && npm run build.`
5. A host that streams replies also shows that a block cut off mid-reply gives "Drawing chart…" and no `markvis-error`.
6. A folder with a `package.json` pins exact host versions, has a `build` script that writes `dist/index.html` and fails when a check above fails, and commits no lockfile or `node_modules`.

For a host that loads the script tag, also save its HTML under `packages/browser/test/fixtures/hosts/`; `hosts.test.ts` draws every fixture there.

## Weekly build

`.github/workflows/hosts.yml` runs every week and on demand. It builds the repository, packs `markvis.tgz` at the root, and for each folder here with a `package.json` runs `npm install` and `npm run build`, then checks `dist/index.html` for `<svg`. It is not a required check: it catches a recipe that stopped building against a new host release.

Until `markvis@^2.2.0` is on npm, those recipes install the packed tarball (`"markvis": "file:../../../markvis.tgz"`). Run them locally the same way:

```bash
pnpm install && pnpm build && npm pack --ignore-scripts && mv markvis-*.tgz markvis.tgz
cd examples/hosts/vue && npm install && npm run build
```
