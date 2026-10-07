# Host examples

Each folder renders a valid chart page (SVG + table). Plugins only; no new types, no d3.

| Host | Plugin | Page |
| --- | --- | --- |
| `vitepress/` | `@markvis/markdown-it` | `index.md` |
| `astro/` | `@markvis/remark` | `src/pages/index.md` |
| `markdown-it/` | `@markvis/markdown-it` | `index.md` |
| `script-tag/` | `markvis.min.js` + marked from a CDN | `index.html` + `page.md` |
| `mkdocs/` | `markvis.min.js` via `extra_javascript` | `mkdocs.yml` + `docs/index.md` |
| `react-markdown/` | `markvis/react` | `index.html` (streaming chat; serve the repository root after `pnpm build`) |

Docusaurus is skipped (not cheap). See `docs/integrate.md`.
