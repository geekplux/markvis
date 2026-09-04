# markvis 2.0

Quantitative charts in Markdown — the fence is the data; Mermaid keeps structure.

![Feb led Q3](./examples/out/01-bar-basic.svg)

![Pro pulled ahead](./examples/out/02-line-multi.svg)

![Shares stay raw](./examples/out/05-pie-raw.svg)

Fence / GFM table / HTML comment → parser → Chart IR → deterministic SVG (table always kept). Tags: `chart` | `markvis` | `vis`. Types: bar · line · area · scatter · pie · hist.

Try: [docs/landing.md](./docs/landing.md) · [playground](./apps/playground) · [drop-in](./apps/playground/dropin.html) · [gallery](./examples/gallery.html) · [SPEC](./SPEC.md) · [visual-spec](./docs/visual-spec.md)

Browser: `packages/browser/dist/markvis.min.js` (zero network). Bake + host integrate docs come next.

0.0.13 (frozen): [legacy/](./legacy/).
