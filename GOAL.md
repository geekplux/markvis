# GOAL.md — markvis 2.0

previous U2 cancelled; legacy modernization is not 2.0.

## Product

2.0 is a Chart IR language rewrite — not types on 0.0.13.
The old definition "2.0 = types on 0.0.13" is void.

Pipeline:

    fence / GFM table / HTML comment
            ->
         parser
            ->
         Chart IR + JSON Schema
            ->
     SVG | table fallback | stats | playground | later MCP

Default renderer: our own deterministic SVG.
Keep github.com/geekplux/markvis and npm name markvis.

## Frozen language

Types only: bar | line | area | scatter | pie | hist.
Tags chart / markvis / vis -> same parser.
Data: CSV or GFM table. No JSON-as-default. No JS in fence.

## Wave order (W0 -> W12, sequential)

- W0 纠偏
- W1 研究
- W2 规格
- W3 例子
- W4 IR + parser
- W5 schema
- W6 render-svg
- W7 CLI
- W8 宿主
- W9 playground
- W10 AI 面
- W11 工程硬化
- W12 加厚（W0-W11 全绿才开始，这是「不停工作」的燃料）

## Acceptance (CONSTITUTION section 7)

```
pnpm test
pnpm markvis check examples/valid
pnpm markvis check examples/invalid          退出码必须非 0
pnpm markvis stats examples/valid/01-bar-basic.md
pnpm --filter playground build
rg "d3-node|markvis-bar|markvis-line|markvis-pie" packages apps && exit 1
```

## Stop condition

Stop when acceptance is green AND W12 has at least gallery + landing + README entry.
Do not announce done before W12. Do not ship marketing site before W9.
