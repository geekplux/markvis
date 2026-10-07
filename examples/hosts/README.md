# Host examples

Each folder renders a valid chart page (SVG + table). Plugins only; no new types, no d3.

| Host | Plugin | Page |
| --- | --- | --- |
| `vitepress/` | `@markvis/markdown-it` | `index.md` |
| `astro/` | `markvis/rehype` | `src/pages/index.md` |
| `docusaurus/` | `markvis/rehype` | `docs/report.mdx` (config + page; built with Docusaurus 3.10.2) |
| `markdown-it/` | `@markvis/markdown-it` | `index.md` |
| `script-tag/` | `markvis.min.js` + marked from a CDN | `index.html` + `page.md` |
| `mkdocs/` | `markvis.min.js` via `extra_javascript` | `mkdocs.yml` + `docs/index.md` |
| `react-markdown/` | `markvis/react` | `index.html` (streaming chat; serve the repository root after `pnpm build`) |

See `docs/integrate.md`.
