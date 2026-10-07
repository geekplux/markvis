# Docusaurus

`docusaurus.config.mjs` adds `rehypeMarkvis` to the docs plugin. It works in `.md` and `.mdx` pages: the plugin writes real elements (figure, SVG, table), not raw HTML, so MDX accepts them. Checked with Docusaurus 3.10.2 (`docusaurus build`).

```bash
npm install markvis @docusaurus/core @docusaurus/preset-classic react react-dom
npx docusaurus build
```
