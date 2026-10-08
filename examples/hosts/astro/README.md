# Astro

`astro.config.mjs` adds `rehypeMarkvis` and tells Shiki to skip chart blocks; without that, Shiki rewrites the block first and it stays code. Astro 7 runs remark and rehype plugins only with `@astrojs/markdown-remark` installed. Checked with Astro 7.3.7 (`astro build`).

`render.mjs` runs the same remark → rehype pipeline without Astro, for the test in `packages/remark/test/hosts.test.ts`.
